# Mốc thời gian transcript

API danh sách và chi tiết địa danh trả `transcript_cues_vi`,
`transcript_cues_en` và `transcript_cues` theo `lang`.
Mỗi mốc là `{ start, end, text }`, thời gian tính bằng giây với
`start <= currentTime < end`. Chưa có mốc: `[]`.
Trước khi chạy API mới, áp dụng migration
`db/migrations/20261022_transcript_timing.sql` cho DB hiện có.
Xem [hướng dẫn nhập mốc và tích hợp web/mobile](transcript-timing.md).

# Thống kê khách truy cập và lượt nghe

Trước khi chạy API trên cơ sở dữ liệu hiện có, áp dụng migration
[`20261019_analytics.sql`](../db/migrations/20261019_analytics.sql). Cơ sở dữ liệu
mới tạo từ `db/schema.sql` đã có các bảng này.
Sau đó chạy lại `db/permissions.sql` bằng tài khoản quản trị cơ sở dữ liệu để
cấp quyền truy cập các bảng thống kê cho `guide_app`.

## API công khai

- `POST /api/analytics/visitors` nhận `{ "visitorId": "<UUID>" }`. Trình duyệt
  tạo và lưu UUID ẩn danh trong local storage; mỗi trình duyệt được tính một
  khách truy cập duy nhất.
- `POST /api/analytics/listens` nhận
  `{ "visitorId": "<UUID>", "landmarkId": "<slug>", "language": "vi" | "en" }`.
  Một lượt được ghi khi audio bắt đầu phát thành công; phát lại sau khi tạm
  dừng được tính là lượt mới.

## Dashboard quản trị

Dashboard hiển thị tổng số trình duyệt đã truy cập và tổng lượt phát audio từ
hai bảng analytics trên. Số liệu được làm mới mỗi 30 giây khi Dashboard đang mở.
Đây là thống kê ẩn danh theo trình duyệt, không phải danh tính cá nhân; xóa local
storage hoặc dùng trình duyệt/thiết bị khác sẽ được tính như khách mới.
