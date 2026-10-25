# Chạy bản sửa Admin, online và transcript

Chạy lệnh dưới đây ở thư mục `multilingual-audio-guide` chứa `web`, `mobile`, `db`.

## Cài đặt và chạy

```powershell
npm ci
npm --prefix db ci
```

Cấu hình `db/.env` theo `db/.env.example`. Với DB đã tồn tại, chạy bằng tài khoản
quản trị PostgreSQL (có thể dùng Query Tool của pgAdmin):

```powershell
psql -h localhost -U postgres -d saigon_audio_guide -v ON_ERROR_STOP=1 -f db/migrations/20261019_analytics.sql
psql -h localhost -U postgres -d saigon_audio_guide -v ON_ERROR_STOP=1 -f db/migrations/20261022_transcript_timing.sql
psql -h localhost -U postgres -d saigon_audio_guide -v ON_ERROR_STOP=1 -f db/permissions.sql
```

Các migration dùng `IF NOT EXISTS` và có thể chạy lại. Không cần chạy lại seed
trên database đang có dữ liệu. API và frontend chạy ở hai terminal riêng:

```powershell
npm run dev:api
```

```powershell
npm run dev
```

Mở `/login`, dùng tài khoản có role `ADMIN`; đăng nhập thành công chuyển đến
`/admin`. Manager chuyển đến `/manager`. `/` và `/user` vẫn là trang khách.
Nếu chưa có Admin, tạo **một lần** (mật khẩu ít nhất 10 ký tự, tối đa 72 byte):

```powershell
$env:BOOTSTRAP_ADMIN_PASSWORD = Read-Host "Nhap mat khau Admin"
npm --prefix db run create:admin -- admin
Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
```

Nếu terminal đã ở `db`, dùng `npm run create:admin -- admin` thay cho lệnh
`npm --prefix db ...`. Tài khoản đã tồn tại sẽ báo trùng tên, không bị ghi đè.

## Online và lượt nghe

- Trang khách `/`, `/user`, `/places`, `/places/:id` gửi heartbeat mỗi 30 giây.
- Mobile gửi heartbeat định kỳ trong foreground, báo rời khi chuyển background,
  và gửi lại ngay khi quay vào app.
- Online đếm các mã thiết bị/trình duyệt đang hoạt động trong 120 giây gần nhất.
  Các tab chung một trình duyệt được gộp; rời một tab không xóa tab khác.
  API có thể trả 0. Không tính trang Admin/Manager vào số khách online.
- Đóng trang/chuyển nền báo rời ngay khi có mạng; mất kết nối hoặc app bị kill
  đột ngột thì phiên hết hạn sau 120 giây. Admin cập nhật số liệu mỗi 6 giây.
- Đây là số mã thiết bị/phiên, không phải số con người xác thực. Mã mobile ổn
  định trong một lần chạy app; mở lại app có thể tạo mã mới.
- Presence nằm trong bộ nhớ một API process, reset khi restart; phù hợp demo
  chạy một API. Lượt nghe lưu PostgreSQL trong `audio_listens`, giữ sau restart.
- `/api/analytics/play` (mobile) và `/api/analytics/listens` (web) cùng ghi vào
  `audio_listens`. Tổng, biểu đồ từng địa danh và hoạt động gần đây dùng chung
  nguồn. Các log `AUDIO_PLAY` cũ trong `activity_logs` không tự chuyển thành
  lượt nghe mới; vẫn giữ nguyên trong nhật ký hoạt động.
- `/api/analytics/stats` yêu cầu token Admin. Tổng lượt truy cập/lượt nghe được
  giữ khi refresh bảng online; lỗi tải không giả thành 1 người đang dùng.

## Đánh dấu câu VI/EN

Cả trang khách, `/places/:id` và mobile dùng mốc của **đúng địa danh và ngôn ngữ**:
`transcript_cues_vi`/`transcript_cues_en`. Click/chạm câu để tua đến `start`.
Khoảng im lặng giữa các mốc và cuối audio không đánh dấu câu.

Chưa có mốc hợp lệ: chỉ sau khi tải được thời lượng audio thật mới chia thời
lượng theo độ dài câu và ghi rõ **mốc câu ước lượng**. Không dùng mặc định
120 giây. Muốn đánh dấu khớp lời đọc thực tế, cần căn mốc riêng cho từng file
VI/EN và nhập bằng hướng dẫn [transcript-timing.md](transcript-timing.md).
Không sao chép mốc VI sang EN. Audio/ảnh vẫn dùng URL Supabase hiện có.

Kiểm tra: mở ít nhất hai địa danh, thử cả VI và EN; phát, tạm dừng, tua tiến/lùi,
đổi địa danh/ngôn ngữ, nghe hết audio. Mốc thật được ưu tiên hơn ước lượng.
Trên mobile, cấu hình `EXPO_PUBLIC_GUIDE_API_URL` bằng IP LAN của máy chạy API
(ví dụ `http://192.168.1.10:3002`); `localhost` trên điện thoại là chính điện thoại.

```powershell
npm test
npm run lint
npm run build
npm --prefix mobile ci
npm --prefix mobile start
```
