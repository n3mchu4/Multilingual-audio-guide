# G01 — Upload ảnh và audio

## Sử dụng

1. Đăng nhập Manager đã được gán địa danh, mở cổng Manager.
2. Chọn tệp ở **Tải ảnh bìa**, **Tải audio tiếng Việt/Anh**, hoặc **Thêm ảnh thư viện**. Mỗi lần một tệp; tối đa 20 ảnh thư viện.
3. Chờ upload thành công. URL tự điền vào bản nháp. Trong khi upload, nút gửi đề xuất bị khóa; có thể hủy hoặc thử lại khi lỗi. URL cũ giữ nguyên nếu upload thất bại.
4. Bấm **Gửi đề xuất cập nhật**. Admin xem bản cũ/mới và duyệt như trước. Upload không tự sửa dữ liệu địa danh công khai.

Ảnh: JPG/JPEG, PNG, WebP, tối đa **5 MiB/tệp**. Audio: MP3, M4A, OGG, WAV, tối đa **20 MiB/tệp**. Backend kiểm tra MIME, đuôi và chữ ký cơ bản của định dạng (không thay thế việc giải mã/kiểm duyệt toàn bộ media). Tệp rỗng bị từ chối.

## Chạy local

Trong `multilingual-audio-guide/db/.env` giữ cấu hình PostgreSQL và thêm:

```dotenv
STORAGE_MODE=local
STORAGE_PUBLIC_BASE_URL=http://localhost:3002/media
```

Từ thư mục `multilingual-audio-guide/`:

```sh
npm ci
npm --prefix db ci
npm run dev:api
# Terminal khác:
npm run dev
```

Tệp được lưu tại `db/storage/images/<landmark-id>/<uuid>.<ext>` hoặc `db/storage/audio/<landmark-id>/<uuid>.<ext>`. Thư mục tự tạo, tệp upload được Git bỏ qua. Với điện thoại qua LAN, dùng IP LAN thay cho localhost trong `STORAGE_PUBLIC_BASE_URL`.

## Dùng Supabase Storage hiện có

Cấu hình **chỉ trên backend**, tại `db/.env`:

```dotenv
STORAGE_MODE=cloud
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
SUPABASE_IMAGE_BUCKET=image
SUPABASE_AUDIO_BUCKET=audio
```

- Dùng hai bucket public `image` và `audio` hiện có, hoặc đổi tên bằng biến môi trường. Bucket phải tồn tại; kiểm tra allowed MIME và giới hạn bucket tương ứng với ứng dụng. Code không tự tạo hay sửa bucket/policy.
- `SUPABASE_SERVICE_ROLE_KEY` lấy từ cấu hình API của dự án, không đưa vào web/mobile, không đặt tiền tố `VITE_`, không commit. Manager dùng tài khoản PostgreSQL của ứng dụng; không dùng Supabase Auth. Vì vậy API xác thực token, kiểm tra tài khoản hoạt động và địa danh được gán trước khi gọi Storage bằng khóa phía server. Không cần mở policy cho phép người lạ upload.
- Tệp mới dùng UUID, không ghi đè tệp cũ. Ảnh và audio dùng chung URL trên web/mobile sau khi Admin duyệt. Khi audio đổi, trigger hiện có sẽ xóa timing cũ.
- Khởi động lại API sau khi sửa `.env`. `STORAGE_PUBLIC_BASE_URL` vẫn phục vụ script `set:media` cũ; upload cloud tự tạo URL dựa trên `SUPABASE_URL` và bucket.

Tệp trong bucket public có thể được truy cập bởi người biết URL ngay sau upload, kể cả bản nháp chưa duyệt. Bước duyệt kiểm soát việc đưa URL vào nội dung địa danh. Chưa có cơ chế xóa tự động tệp của bản nháp bị bỏ, bị từ chối hoặc upload đã lưu nhưng client mất kết nối. Khi dọn thủ công, chỉ xóa tệp chắc chắn không còn được tham chiếu trong địa danh, proposal và thư viện ảnh.

## API

`POST /api/manager/media?kind=image|audio&filename=<encoded filename>`

Header `Authorization: Bearer <token Manager>` và `Content-Type` của tệp. Body là bytes thô (không JSON/base64/multipart). Địa danh đích luôn lấy từ tài khoản trong database; client không chọn đường dẫn/bucket. Tối đa một upload đồng thời mỗi Manager và bốn upload trong mỗi tiến trình API.

Thành công `201`:

```json
{"data":{"url":"https://.../storage/v1/object/public/image/ben-thanh-market/<uuid>.png","key":"image/ben-thanh-market/<uuid>.png","size":1234,"contentType":"image/png"}}
```

Lỗi: `400` metadata/tệp không hợp lệ; `401` token hoặc tài khoản không hoạt động; `403` chưa được gán địa danh; `409` đang có đề xuất chờ duyệt; `413` quá dung lượng; `415` sai chữ ký định dạng; `429` đang có upload; `502` Storage từ chối hoặc mất kết nối; `503` thiếu cấu hình hoặc không ghi được local. UI hiển thị lỗi và cho chọn lại/thử lại, không cập nhật URL khi lỗi.

Tiến trình đo chặng trình duyệt → API, sau đó hiển thị “Đang lưu tệp vào Storage...” cho tới khi API trả thành công. Chưa hỗ trợ tiếp tục upload từ phần đã gửi sau khi mất mạng. Với file audio lớn/mạng yếu, có thể bổ sung TUS sau này.

## Kiểm tra

```sh
node --test db/node/media-upload.test.js
npm run build
```

Kiểm tra thủ công: upload ảnh bìa/audio VI/EN/ảnh thư viện; xác nhận URL và payload đề xuất; Admin duyệt rồi mở web/mobile. Thử tệp rỗng, đổi đuôi tệp, quá dung lượng, hủy/mất mạng, bucket sai và tài khoản bị đóng. URL cũ phải giữ nguyên khi thất bại; gửi đề xuất phải khóa khi upload.

Chưa xác minh upload trên Supabase thật hoặc PostgreSQL thật trong môi trường thực hiện thay đổi này.

Tham khảo: [Standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).
