# PRD — Ứng dụng Thuyết minh Địa danh Sài Gòn

**Phiên bản:** 1.0
**Ngày:** 15/09/2026
**Nhóm thực hiện:** 3 thành viên (FE Web / FE Mobile / Backend tối thiểu + tích hợp AI)
**Nền tảng:** Web, iOS, Android

---

## 1. Bối cảnh & Mục tiêu

Sài Gòn có nhiều địa danh lịch sử, văn hóa (Nhà thờ Đức Bà, Bến Nhà Rồng, Dinh Độc Lập, Chợ Bến Thành...) nhưng khách du lịch, đặc biệt khách nước ngoài, thường thiếu thông tin thuyết minh dễ tiếp cận bằng ngôn ngữ của họ khi tham quan tự do (không đi tour có hướng dẫn viên). Ứng dụng cung cấp thuyết minh tự động bằng giọng đọc đa ngôn ngữ cho các địa danh, giúp người dùng tự tham quan mà vẫn hiểu được thông tin, lịch sử, ý nghĩa của địa điểm.

**Mục tiêu đồ án:** Xây dựng ứng dụng demo hoạt động trên cả Web, iOS và Android, cho phép người dùng chọn địa danh và nghe thuyết minh bằng ngôn ngữ mong muốn, trong thời gian 2.5 tháng.

## 2. Đối tượng người dùng

| Nhóm người dùng | Nhu cầu |
|---|---|
| Khách du lịch nước ngoài | Nghe thuyết minh bằng tiếng mẹ đẻ khi tham quan tự do, không cần thuê hướng dẫn viên |
| Khách du lịch trong nước | Tìm hiểu sâu hơn về lịch sử, văn hóa địa danh đang ghé thăm |
| Người dùng từ xa (không tại chỗ) | Tìm hiểu trước về địa danh Sài Gòn qua Web trước khi đi hoặc để tham khảo |

## 3. Phạm vi ban đầu (chốt cứng)

- **Danh sách địa danh (MVP):** chọn 5-8 địa danh tiêu biểu để làm demo, ví dụ: Nhà thờ Đức Bà, Bưu điện Trung tâm, Dinh Độc Lập, Chợ Bến Thành, Bến Nhà Rồng, Địa đạo Củ Chi (hoặc Bảo tàng Chứng tích Chiến tranh) — nhóm cần chốt danh sách cụ thể ở Tuần 1
- **Ngôn ngữ hỗ trợ:** Tiếng Việt, Tiếng Anh (bắt buộc), Tiếng Nhật hoặc Hàn (nếu còn thời gian)
- **Nền tảng:** Web (React.js), iOS + Android (React Native/Expo — build 1 codebase cho cả 2 hệ điều hành)
- **Nội dung thuyết minh:** Soạn sẵn (script cố định) cho từng địa danh, KHÔNG tự động tạo nội dung từ AI sinh văn bản — chỉ dùng AI để **dịch** script đã soạn và **đọc thành giọng nói** (TTS). Cách này đảm bảo nội dung chính xác về lịch sử, tránh AI "bịa" thông tin sai

## 4. Tính năng

### 4.1 MVP — bắt buộc phải có để demo được

| # | Tính năng | Mô tả |
|---|---|---|
| F1 | Danh sách địa danh | Hiển thị danh sách địa danh kèm ảnh, tên, mô tả ngắn |
| F2 | Chi tiết địa danh | Trang/màn hình chi tiết: ảnh, thông tin cơ bản, nút nghe thuyết minh |
| F3 | Chọn ngôn ngữ thuyết minh | Người dùng chọn ngôn ngữ trước khi nghe (VI/EN tối thiểu) |
| F4 | Phát thuyết minh (audio player) | Player phát giọng đọc thuyết minh, có thanh tiến trình, play/pause, tua |
| F5 | Hiển thị văn bản kèm audio | Hiển thị transcript/phụ đề đồng bộ với giọng đọc đang phát |
| F6 | Đa nền tảng đồng bộ | Cùng 1 trải nghiệm nhất quán trên Web, iOS, Android |

### 4.2 Tính năng phụ — làm nếu còn thời gian

| # | Tính năng | Mô tả |
|---|---|---|
| F7 | Bản đồ vị trí địa danh | Hiển thị vị trí địa danh trên bản đồ (Google Maps embed) |
| F8 | Chế độ nghe khi ở gần địa danh (GPS) | Tự động gợi ý phát thuyết minh khi người dùng đến gần vị trí (mobile) |
| F9 | Lưu địa danh yêu thích | Đánh dấu địa danh muốn xem lại |
| F10 | Tải thuyết minh về nghe offline | Tải file audio về máy để nghe không cần mạng |
| F11 | Tìm kiếm địa danh | Ô tìm kiếm theo tên |

### 4.3 Ngoài phạm vi (Out of scope)

- Tự động tạo nội dung thuyết minh bằng AI sinh văn bản (tránh rủi ro sai lệch thông tin lịch sử)
- Đặt tour, đặt vé, thanh toán
- Nhận diện địa danh qua camera (image recognition)
- Thuyết minh real-time cho địa danh không có trong danh sách cố định

## 5. Luồng người dùng chính (User Flow)

```
Người dùng mở app
   → Xem danh sách địa danh (có thể tìm kiếm/lọc)
   → Chọn 1 địa danh
   → Xem thông tin chi tiết + ảnh
   → Chọn ngôn ngữ thuyết minh
   → Nhấn phát → nghe giọng đọc kèm transcript hiển thị đồng bộ
   → (Tùy chọn) Lưu yêu thích / tải về nghe offline
```

## 6. Yêu cầu phi chức năng (Non-functional)

- **Nền tảng:** Web (React.js), iOS + Android (React Native/Expo — 1 codebase build ra cả 2 store, không cần viết riêng native Swift/Kotlin)
- **Hiệu năng:** Audio phát mượt, không giật khi chuyển ngôn ngữ
- **Offline-friendly (nếu làm F10):** Cache được nội dung đã tải để dùng nơi sóng yếu — phù hợp bối cảnh thực tế khi tham quan
- **Bảo mật cơ bản:** API key TTS/dịch không lộ ra frontend

## 7. Kiến trúc tổng quan (tham chiếu)

- **Frontend:** React.js (Web) + React Native/Expo (iOS & Android)
- **Backend tối thiểu:** Firebase/Supabase — lưu trữ dữ liệu địa danh, script thuyết minh, file audio đã tạo sẵn (pre-generated, không cần tạo audio real-time mỗi lần người dùng bấm nghe — tiết kiệm chi phí API và tăng tốc độ)
- **Dịch vụ AI bên thứ 3:** Google Translate/DeepL (dịch script), Google Cloud TTS/Azure Speech/ElevenLabs (tạo giọng đọc)
- **Lưu ý quan trọng:** Vì nội dung thuyết minh cố định (không phải người dùng tự upload), audio thuyết minh có thể **tạo trước 1 lần cho mỗi địa danh × mỗi ngôn ngữ**, lưu sẵn trên Storage — không cần gọi AI mỗi lần người dùng nghe. Điều này giúp giảm đáng kể độ phức tạp và chi phí so với hệ thống xử lý file người dùng tải lên

## 8. Tiêu chí hoàn thành (Definition of Done) cho MVP

- [ ] Danh sách 5-8 địa danh hiển thị đầy đủ trên cả Web, iOS, Android
- [ ] Mỗi địa danh phát được thuyết minh bằng ít nhất 2 ngôn ngữ (VI/EN)
- [ ] Transcript hiển thị đồng bộ với audio đang phát
- [ ] Giao diện nhất quán, không lỗi hiển thị giữa 3 nền tảng
- [ ] Demo chạy ổn định, không phụ thuộc mạng chậm lúc trình bày (audio đã tạo sẵn, không xử lý real-time khi demo)

## 9. Rủi ro đã biết trước

| Rủi ro | Ảnh hưởng | Giải pháp dự phòng |
|---|---|---|
| Thiếu thời gian soạn nội dung thuyết minh chính xác cho nhiều địa danh | Chậm tiến độ, nội dung sơ sài | Giới hạn 5-6 địa danh, soạn script ngắn gọn (200-300 từ/địa danh) thay vì dài |
| Chi phí API TTS cho nhiều ngôn ngữ | Vượt ngân sách miễn phí | Tạo audio trước 1 lần duy nhất/lưu trữ, không tạo lại mỗi lần phát; giới hạn 2 ngôn ngữ cho MVP |
| React Native/Expo build lên App Store cần tài khoản Apple Developer (trả phí) | Không submit được lên iOS chính thức | Dùng Expo Go hoặc TestFlight để demo, không bắt buộc phải public lên App Store cho đồ án |
| 3 người làm song song 4 đồ án khác | Không đủ thời gian hoàn thành MVP trên cả 3 nền tảng | Ưu tiên hoàn thiện Web + 1 nền tảng mobile (ví dụ Android dễ test hơn) trước, iOS kiểm tra sau nếu có máy Mac |

## 10. Timeline tham chiếu

| Giai đoạn | Nội dung |
|---|---|
| Tuần 1 | Chốt danh sách địa danh, soạn script thuyết minh, setup kiến trúc |
| Tuần 2 | Tạo trước audio thuyết minh (dịch + TTS) cho toàn bộ địa danh × ngôn ngữ |
| Tuần 3-4 | Xây UI danh sách + chi tiết địa danh trên Web và Mobile |
| Tuần 5-6 | Tích hợp player, transcript đồng bộ, kết nối dữ liệu thật |
| Tuần 7 | Hoàn thiện đa ngôn ngữ giao diện, polish UI |
| Tuần 8-9 | Test trên nhiều thiết bị, sửa lỗi |
| Tuần 10 | Chuẩn bị demo, báo cáo |