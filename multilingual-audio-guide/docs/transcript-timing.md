# Mốc thời gian transcript cho web và mobile

Mỗi câu có `start`, `end` (số giây từ đầu audio, cho phép số thập phân)
và `text`. Mốc VI và EN độc lập, không dùng chung vì tốc độ đọc khác nhau.
Khoảng trống giữa hai câu được phép; thời điểm kết thúc không thuộc câu đó.

## 1. Cập nhật PostgreSQL

Chạy tại thư mục `multilingual-audio-guide`, bằng tài khoản quản trị DB:

```powershell
psql -h localhost -U postgres -d saigon_audio_guide -v ON_ERROR_STOP=1 -f db/migrations/20261022_transcript_timing.sql
```

Nếu PowerShell không nhận `psql`, dùng đường dẫn đến `psql.exe` giống khi
setup DB hoặc mở file migration trong Query Tool của pgAdmin rồi Execute.
DB mới tạo từ `db/schema.sql` đã bao gồm thay đổi này.
Quyền UPDATE landmarks hiện có của `guide_app` cũng áp dụng cho cột mới.
Phải chạy migration trước khi khởi động API phiên bản mới.

## 2. Chuẩn bị câu từ TXT

```powershell
npm --prefix db run prepare:timing -- content/ben-thanh.vi.txt "URL_AUDIO_VI_DANG_LUU_TRONG_DB" content/ben-thanh.vi.timing.json
```

Đường dẫn file trong các lệnh `npm --prefix db` được tính từ thư mục `db`.
Lệnh chạy không cần kết nối DB, tạo JSON với `audio_url` và danh sách `cues`.
`start/end` ban đầu là `null`, chưa thể nhập. File đích đã tồn tại sẽ không bị
ghi đè. Kiểm tra cách chia câu (đặc biệt tên viết tắt), nghe audio và điền mốc
bắt đầu/kết thúc thực tế. Không chia đều thời lượng để giả định mốc chính xác.

Ví dụ minh họa định dạng, không phải mốc thật của Chợ Bến Thành:

```json
{
  "audio_url": "https://example.com/audio/vi.mp3",
  "cues": [
    { "start": 0.5, "end": 2.8, "text": "Xin chào." },
    { "start": 3.2, "end": 6.1, "text": "Chào mừng đến với Sài Gòn!" }
  ]
}
```

Ghép toàn bộ `text` bằng dấu cách phải trùng transcript trong DB, kể cả dấu
câu (cho phép khác khoảng trắng và Unicode tương đương). Cần nhập TXT và
gắn URL audio trước, rồi mới nhập timing. Đảm bảo mốc cuối không vượt thời
lượng audio; CLI không tải file audio để đo thời lượng hay tự nhận dạng giọng nói.

## 3. Nhập mốc đã căn

Cấu hình `db/.env` như các lệnh DB hiện có, sau đó:

```powershell
npm --prefix db run import:timing -- ben-thanh-market vi content/ben-thanh.vi.timing.json
```

Lặp lại với `en` và từng địa danh. Lệnh kiểm tra URL đúng audio đang lưu,
nội dung đầy đủ, thời gian là số hữu hạn không âm, `end > start`, thứ tự và
không chồng lấn. Nhập trong transaction có khóa để tránh thay đổi nội dung
đồng thời. Đây là công cụ bảo trì dùng quyền DB, không phải API công khai.

Khi transcript hoặc URL audio thay đổi (kể cả Admin duyệt đề xuất Manager),
trigger tự xóa mốc của ngôn ngữ đó; ngôn ngữ còn lại giữ nguyên. Cần nhập
lại timing sau chỉnh sửa. Nếu thay file audio tại cùng URL, hãy dùng URL có
phiên bản mới để hệ thống nhận biết thay đổi và xóa mốc cũ.

## 4. Dữ liệu cho nhóm web/mobile

`GET /api/landmarks?lang=vi` và `GET /api/landmarks/:id?lang=vi` trả thêm:

- `transcript_cues_vi`: danh sách mốc tiếng Việt.
- `transcript_cues_en`: danh sách mốc tiếng Anh.
- `transcript_cues`: danh sách theo tham số `lang`.

Chưa nhập mốc hoặc nội dung đã đổi: trả `[]`; giao diện hiển thị transcript
thường. Bộ chuyển đổi dữ liệu của web và mobile đã giữ các mốc trong
`place.transcriptCues.vi` và `place.transcriptCues.en`.

Thuật toán dùng ở cả hai nền tảng:

```js
const cues = place.transcriptCues[lang] || [];
const activeIndex = cues.findIndex(
  cue => currentTimeSeconds >= cue.start && currentTimeSeconds < cue.end
);
// Render cue.text, đánh dấu phần tử có index === activeIndex.
```

Web lấy thời gian từ `audio.elapsed` (hook hiện tại) hoặc
`HTMLAudioElement.currentTime`. Mobile Expo Audio hiện tại dùng
`player.currentTime` (giây); nếu dùng API trả milliseconds thì chia 1000.
Tính lại sau tua, đổi ngôn ngữ hoặc đổi địa danh; chỉ dùng thời gian của audio
đang thuộc địa danh/ngôn ngữ hiển thị. Khoảng im lặng, hết audio và danh sách
rỗng trả `-1`, bỏ đánh dấu. Hàm dùng chung có sẵn ở
`shared/utils/transcriptTiming.js`: `findActiveTranscriptCue`.

Phần bổ sung này cung cấp dữ liệu và hàm tìm câu. Giao diện tô sáng/nhấn câu
để tua chưa được thêm. Chưa có bộ timing đã căn audio thật đi kèm.

## Kiểm tra

```powershell
npm --prefix db run test:timing
```

Sau migration, nhập timing rồi mở hai endpoint để xác nhận dữ liệu VI/EN.
Thử cập nhật transcript hoặc URL audio trên DB thử nghiệm: mốc ngôn ngữ đó
phải về `[]`. Không sửa dữ liệu chính thức chỉ để thử.
