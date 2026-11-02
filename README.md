# Saigon Audio Guide — Multilingual Audio Guide

Ứng dụng thuyết minh địa danh tại khu vực Quận 1, TP. Hồ Chí Minh, hỗ trợ tiếng Việt và tiếng Anh trên web và ứng dụng mobile sử dụng React Native/Expo. Hệ thống có giao diện khách, Admin và Manager; nội dung và thống kê được lưu trong PostgreSQL, media được truy cập qua URL.

## Mục lục

- [Chức năng hiện có](#chức-năng-hiện-có)
- [Công nghệ](#công-nghệ)
- [Cấu trúc repository](#cấu-trúc-repository)
- [Cài đặt và chạy web](#cài-đặt-và-chạy-web)
- [Chạy mobile](#chạy-mobile)
- [Audio, ảnh và transcript](#audio-ảnh-và-transcript)
- [Thống kê hoạt động](#thống-kê-hoạt-động)
- [API chính](#api-chính)
- [Kiểm tra và build](#kiểm-tra-và-build)
- [Giới hạn hiện tại](#giới-hạn-hiện-tại)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

## Chức năng hiện có

### Khách trên web

- Truy cập không cần đăng nhập tại `/user`.
- Xem danh sách, thông tin chi tiết, ảnh, mô tả và bài thuyết minh của địa danh.
- Mở trực tiếp địa danh qua `/user/:placeId`; đường dẫn cũ `/places/:id` được chuyển hướng tương ứng.
- Chọn tiếng Việt hoặc tiếng Anh, phát/tạm dừng, tua bằng thanh tiến trình và tua ±10 giây.
- Hiển thị trạng thái tải, lỗi audio, kết thúc và thử tải lại.
- Hiển thị transcript theo câu, đánh dấu câu đang đọc, tự cuộn và nhấn câu để tua.
- Khi thiếu mốc căn audio, component transcript có thể tạo mốc ước lượng theo thời lượng và hiển thị thông báo.
- Gửi heartbeat hoạt động và ghi nhận khách/lượt nghe qua API.
- Dev server tạo QR trong terminal để mở website qua mạng LAN.

### Khách trên mobile

- Ứng dụng React Native/Expo lấy dữ liệu địa danh từ cùng backend PostgreSQL.
- Chọn và ghi nhớ ngôn ngữ bằng AsyncStorage.
- Xem địa danh, ảnh, mô tả, transcript theo đoạn và nghe audio VI/EN nếu địa danh đã có URL tương ứng.
- Phát/tạm dừng, tua theo thanh tiến trình, xử lý lỗi tải audio.
- Bản đồ, xin quyền vị trí, tính khoảng cách đường chim bay và mở Google Maps để chỉ đường đi bộ.
- Gửi heartbeat theo trạng thái ứng dụng.
- Ghi nhận phiên nghe, nền tảng Android/iOS, số giây nghe và trạng thái hoàn thành.
- Lưu hàng đợi thống kê trên thiết bị để thử gửi lại khi API lỗi hoặc ứng dụng hoạt động trở lại.
- Khi ứng dụng xuống nền, mã hiện tại dừng audio và lưu trạng thái phiên nghe.

### Admin

- Đăng nhập và truy cập khu vực theo vai trò.
- Dashboard lấy dữ liệu qua API: địa danh, Manager, đề xuất và thống kê nghe/hoạt động.
- Chỉnh sửa một số nội dung địa danh qua giao diện quản trị hiện có.
- Tạo, sửa, phân công địa danh và khóa/mở tài khoản Manager.
- Xem, duyệt hoặc từ chối đề xuất cập nhật nội dung.
- Thêm/xóa liên kết tuyến xe buýt và trạm xuống của địa danh.
- Xem nhật ký hoạt động.

### Manager

- Đăng nhập và xem địa danh được phân công.
- Soạn đề xuất nội dung VI/EN, thông tin địa danh và các URL media.
- Gửi đề xuất để Admin xét duyệt; nội dung chính thức được cập nhật theo quy trình duyệt.
- Xem dữ liệu và trạng thái đề xuất trong workspace.

## Công nghệ

| Thành phần | Công nghệ trong mã nguồn |
| --- | --- |
| Web | React, Vite, React Router, Zustand, i18next |
| Mobile | React Native, Expo, expo-audio, expo-location, react-native-maps, AsyncStorage |
| API chạy demo | Node.js `node:http`, `pg`, `bcryptjs`, `dotenv` |
| Database | PostgreSQL; schema, trigger, workflow và migration SQL |
| Xác thực | Mật khẩu bcrypt; token ký HMAC-SHA256 có thời hạn |
| Media | URL ảnh/audio công khai hoặc file local trong `db/storage/` |
| QR | `qrcode-terminal`; dependency `qrcode.react` cũng có trong dự án |
| Kiểm tra | Node.js test runner, ESLint |

API mặc định được chạy từ `db/node/demo-api.js`. Thư mục `functions/` chứa thêm mã xác thực và dev server riêng; lệnh `npm run dev:api` hiện không chạy server đó.

## Cấu trúc repository

```text
Multilingual-audio-guide/            # Thư mục sau khi git clone
├── README.md                       # Đặt README này tại đây
├── package-lock.json
└── multilingual-audio-guide/       # Thư mục làm việc chính
    ├── package.json                # Scripts web, API, test, lint
    ├── db/
    │   ├── .env.example
    │   ├── create-db.sql
    │   ├── schema.sql
    │   ├── workflows.sql
    │   ├── seed.sql
    │   ├── permissions.sql
    │   ├── verify.sql
    │   ├── migrations/
    │   ├── node/                   # API, repository, CLI nhập nội dung
    │   ├── scripts/                # Setup, backup, verify PowerShell
    │   ├── content/                # Transcript TXT VI/EN
    │   └── storage/                # Media local nếu sử dụng
    ├── functions/src/              # Thành phần xác thực, test
    ├── mobile/                     # App Expo; có package.json riêng
    ├── shared/                     # Constants và utilities dùng chung
    ├── web/                        # React; không có package.json riêng
    └── docs/                       # Tài liệu bổ sung
```

## Cài đặt và chạy web

### 1. Chuẩn bị

- Git.
- Node.js và npm tương thích với các phiên bản Vite/Expo được khai báo trong các file `package.json`. Có thể bắt đầu với Node.js 24; nếu công cụ báo lỗi engine, kiểm tra lại phiên bản yêu cầu.
- PostgreSQL; các script hiện được viết theo PostgreSQL 17.
- `psql` để chạy script SQL. pgAdmin có thể dùng để kiểm tra dữ liệu.

### 2. Clone và cài dependency

```powershell
git clone https://github.com/n3mchu4/Multilingual-audio-guide.git
cd Multilingual-audio-guide
cd multilingual-audio-guide
npm install
npm --prefix db install
```

**Các lệnh bên dưới được chạy tại thư mục con `multilingual-audio-guide/` chứa `package.json`.** Không chạy `npm --prefix web install` vì web dùng dependency ở thư mục làm việc chính.

### 3. Khởi tạo database mới

Ví dụ PowerShell trên Windows:

```powershell
.\db\scripts\setup.ps1 -PgBin "C:\Program Files\PostgreSQL\17\bin"
```

Điều chỉnh `-PgBin` theo nơi cài PostgreSQL. Có thể truyền thêm `-DbHost` và `-Port` nếu khác mặc định.

Script chạy bằng tài khoản PostgreSQL `postgres`, lần lượt tạo database/role, schema, workflow, seed, cấp quyền và kiểm tra. Khi được hỏi, nhập mật khẩu của `postgres` và thiết lập mật khẩu cho role `guide_app`.

Nếu `psql` đã có trong PATH, có thể chạy trực tiếp:

```powershell
psql -X -h 127.0.0.1 -p 5432 -U postgres -W -d postgres -v ON_ERROR_STOP=1 -f db/create-db.sql -f db/schema.sql -f db/workflows.sql -f db/seed.sql -f db/permissions.sql -f db/verify.sql
```

`create-db.sql` có lệnh riêng của psql như `\gexec`, `\password`, `\connect`; không chạy nguyên file bằng Query Tool của pgAdmin.

Seed hiện khai báo **7 địa danh**: Chợ Bến Thành, Dinh Độc Lập, Nhà thờ Đức Bà, Bưu điện Trung tâm, Bến Bạch Đằng, Nhà hát Thành phố và Đường Sách Nguyễn Văn Bình. Số bản ghi thực tế cần kiểm tra trong database sau khi setup.

### 4. Áp dụng migration

Sau setup database mới, vẫn chạy các migration dưới đây theo thứ tự. Với database đã có dữ liệu, sao lưu trước và áp dụng migration còn thiếu; tránh chạy lại seed vì seed có các câu UPDATE nội dung/media.

```powershell
psql -h 127.0.0.1 -U postgres -W -d saigon_audio_guide -v ON_ERROR_STOP=1 -f db/migrations/20261019_analytics.sql
psql -h 127.0.0.1 -U postgres -W -d saigon_audio_guide -v ON_ERROR_STOP=1 -f db/migrations/20261022_transcript_timing.sql
psql -h 127.0.0.1 -U postgres -W -d saigon_audio_guide -v ON_ERROR_STOP=1 -f db/migrations/20261026_device_sessions.sql
psql -h 127.0.0.1 -U postgres -W -d saigon_audio_guide -v ON_ERROR_STOP=1 -f db/migrations/20261030_mobile_listening.sql
```

Migration `20261030_mobile_listening.sql` bổ sung các cột phiên nghe mà API thống kê đang truy vấn, đồng thời cấp quyền UPDATE `audio_listens` cho `guide_app`. `setup.ps1` hiện chưa tự chạy các file migration.

### 5. Cấu hình môi trường

```powershell
Copy-Item db/.env.example db/.env
Copy-Item web/.env.example web/.env
```

Chỉnh `db/.env`:

```dotenv
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=saigon_audio_guide
PGUSER=guide_app
PGPASSWORD=YOUR_GUIDE_APP_PASSWORD

DB_API_PORT=3002
DB_API_CORS_ORIGIN=http://localhost:5173
AUTH_SECRET=YOUR_LONG_RANDOM_PRIVATE_SECRET

STORAGE_MODE=local
STORAGE_PUBLIC_BASE_URL=http://localhost:3002/media
```

- `PGUSER/PGPASSWORD` là tài khoản kết nối PostgreSQL, khác tài khoản đăng nhập Admin/Manager.
- API và các CLI DB đọc cấu hình từ `db/.env`.
- `web/.env` có thể để `VITE_API_BASE_URL=` khi dùng proxy Vite trong môi trường dev.
- Nếu API chạy ở URL khác, cấu hình `VITE_API_BASE_URL` tương ứng và cho phép đúng origin web ở backend.
- Tự đặt mật khẩu và secret; không sử dụng giá trị mặc định trong code để triển khai.

### 6. Tạo tài khoản Admin

Sau khi cấu hình DB và cài dependency:

```powershell
$adminPassword = Read-Host "Mat khau Admin" -AsSecureString
$env:BOOTSTRAP_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $adminPassword).Password
npm --prefix db run create:admin -- admin
Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
Remove-Variable adminPassword
```

CLI yêu cầu mật khẩu **ít nhất 10 ký tự, tối đa 72 byte UTF-8**. Tài khoản được tạo là Admin cấp cao. Chỉ chạy khi cần tạo mới; username trùng sẽ gây lỗi.

### 7. Chạy API và web

Terminal 1, tại thư mục làm việc chính:

```powershell
npm run dev:api
```

Terminal 2, cùng thư mục:

```powershell
npm run dev
```

| Địa chỉ mặc định | Mục đích |
| --- | --- |
| `http://localhost:5173/` | Trang vào; khách được chuyển đến /user |
| `http://localhost:5173/user` | Giao diện khách |
| `http://localhost:5173/user/ben-thanh-market` | Mở trực tiếp Chợ Bến Thành |
| `http://localhost:5173/login` | Đăng nhập Admin/Manager |
| `http://localhost:5173/admin` | Khu vực Admin |
| `http://localhost:5173/manager` | Khu vực Manager |
| `http://localhost:3002/api/health` | Kiểm tra kết nối API/database |

Vite proxy `/api` và `/media` đến `http://127.0.0.1:3002`. Nếu thay cổng API, cập nhật cả proxy trong `web/vite.config.js`.

Để mở web bằng điện thoại, kết nối cùng mạng với máy chạy dự án và quét QR mà Vite in ra. Đây là QR mở **website qua LAN**, không phải QR cài đặt ứng dụng mobile. Nếu IP được chọn sai do VPN/card mạng ảo, dùng địa chỉ IPv4 LAN phù hợp.

## Chạy mobile

Từ thư mục làm việc chính:

```powershell
npm --prefix mobile install
Copy-Item mobile/.env.example mobile/.env
```

Đặt URL API trong `mobile/.env`, ví dụ máy tính có IP LAN `192.168.1.10`:

```dotenv
EXPO_PUBLIC_GUIDE_API_URL=http://192.168.1.10:3002
```

Thay IP ví dụ bằng IP máy đang chạy API. Điện thoại thật không truy cập được API trên máy tính qua `localhost`.

```powershell
npm run dev:mobile
```

Các lệnh khác đã có trong package mobile:

```powershell
npm --prefix mobile run android
npm --prefix mobile run ios
```

- Dùng Expo Go/runtime tương thích với phiên bản Expo trong `mobile/package.json`.
- Máy tính và điện thoại phải truy cập được nhau qua mạng; mở cổng API 3002 và các cổng Expo cần dùng khi firewall chặn.
- iOS Simulator cần môi trường macOS/Xcode; có thể thử trên iPhone thật bằng môi trường Expo phù hợp.
- Sau khi đổi biến môi trường, khởi động lại Expo; nếu cần: `npm --prefix mobile start -- --clear`.
- Nếu dùng media local, URL lưu trong DB phải là IP LAN hoặc địa chỉ mà điện thoại truy cập được. Chỉ đổi URL API chưa đủ nếu audio vẫn trỏ đến `localhost`.

## Audio, ảnh và transcript

### Media qua URL

PostgreSQL lưu URL ảnh/audio; client tải media từ URL đó. Repo có các URL Supabase Storage trong seed, nhưng khả năng truy cập từng file và mức độ đầy đủ của audio VI/EN cần kiểm tra thực tế.

Có thể gắn URL công khai đầy đủ bằng CLI:

```powershell
npm --prefix db run set:media -- ben-thanh-market audio-vi "https://YOUR_PROJECT.supabase.co/storage/v1/object/public/audio/ben-thanh-market/vi.mp3"
npm --prefix db run set:media -- ben-thanh-market audio-en "https://YOUR_PROJECT.supabase.co/storage/v1/object/public/audio/ben-thanh-market/en.mp3"
npm --prefix db run set:media -- ben-thanh-market background "https://YOUR_HOST/ben-thanh.jpg"
npm --prefix db run set:media -- ben-thanh-market gallery "https://YOUR_HOST/ben-thanh-gallery.jpg"
```

URL phải trỏ đến file, không dùng URL trang dashboard quản lý storage. CLI trên cập nhật tham chiếu trong DB, không upload file.

Với storage local, đặt file tại `db/storage/audio/` hoặc `db/storage/images/`, rồi dùng key, ví dụ:

```powershell
npm --prefix db run set:media -- ben-thanh-market audio-vi audio/ben-thanh-market/vi.mp3
```

Với `STORAGE_MODE=cloud`, `STORAGE_PUBLIC_BASE_URL` là tiền tố URL được nối với key. Nếu bucket/path hiện tại không khớp quy ước `audio/...` hoặc `images/...`, truyền URL đầy đủ để tránh tạo sai đường dẫn.

### Nhập transcript

```powershell
npm --prefix db run import:text -- ben-thanh-market vi content/ben-thanh.vi.txt
npm --prefix db run import:text -- ben-thanh-market en content/ben-thanh.en.txt
```

Đường dẫn của các CLI chạy qua `npm --prefix db` được tính từ thư mục `db/`. Các lệnh bảo trì này cập nhật trực tiếp dữ liệu chính thức.

### Chuẩn bị mốc câu

```powershell
npm --prefix db run prepare:timing -- content/ben-thanh.vi.txt "URL_AUDIO_VI_DANG_LUU_TRONG_DB" content/ben-thanh.vi.timing.json
```

Nghe audio thật, điền `start/end` theo giây cho từng câu, rồi nhập:

```powershell
npm --prefix db run import:timing -- ben-thanh-market vi content/ben-thanh.vi.timing.json
```

- Mốc VI và EN được căn riêng.
- Công cụ kiểm tra URL audio, nội dung transcript, thứ tự và khoảng thời gian không chồng lấn.
- Khi thay transcript hoặc URL audio, trigger xóa mốc của ngôn ngữ tương ứng; cần nhập lại.
- Mốc ước lượng trên giao diện web không thay thế mốc đã căn theo audio thật.
- Mobile hiện chưa sử dụng giao diện tô sáng/nhấn câu như web.

Hướng dẫn chi tiết: [Transcript timing](multilingual-audio-guide/docs/transcript-timing.md). Một số mô tả trong tài liệu cũ cần đối chiếu lại với code mobile hiện tại.

## Thống kê hoạt động

| Chỉ số | Cách lấy trong backend hiện tại |
| --- | --- |
| `visitors` | Số visitor ID trong `analytics_visitors` |
| `listens` / `totalAudioPlays` | Cùng lấy từ số bản ghi `audio_listens` |
| `playsByLandmark` | Số bản ghi nghe nhóm theo địa danh |
| `activeUsers` | Số visitor ID còn hoạt động trong bộ theo dõi heartbeat của tiến trình API |
| `listeningSeconds` | Tổng `listened_seconds` |
| `completedListens` | Số bản ghi có `completed=true` |

- Heartbeat mặc định gửi mỗi **5 giây**, hết hạn sau **10 giây** không nhận ping; Dashboard lấy thống kê khoảng mỗi **6 giây**.
- `device_sessions` lưu lịch sử hoạt động. Không coi toàn bộ bản ghi trong bảng này là thiết bị đang online.
- Online phản ánh các client gửi heartbeat; không tương đương số tài khoản Admin/Manager đã đăng nhập.
- Bộ đếm online nằm trong bộ nhớ một tiến trình API và mất trạng thái khi API khởi động lại; chưa có cơ chế tổng hợp nhiều API instance.
- Web hiện gửi lượt nghe qua `/api/analytics/listens`; mobile gửi snapshot phiên nghe qua `/api/analytics/play`.
- Mobile dùng session ID để chống đếm trùng khi gửi lại, giữ phiên khi pause/resume và cập nhật thời gian nghe. Hoàn thành được xác định khi audio kết thúc và thời gian nghe đạt ít nhất 90% thời lượng.
- Bản ghi web/legacy không có dữ liệu thời gian nghe tương đương mobile; không suy ra tổng thời gian nghe của mọi nền tảng từ số liệu hiện tại.
- Visitor ID nhận diện client theo cách triển khai, không bảo đảm một ID tương ứng một người thật.

## API chính

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| GET | `/api/health`, `/health/db` | Kiểm tra DB |
| GET | `/api/landmarks?lang=vi` | Danh sách địa danh |
| GET | `/api/landmarks/:id?lang=en` | Chi tiết địa danh |
| GET | `/api/places` | Alias danh sách địa danh |
| POST | `/api/auth/login` | Đăng nhập với `unfid` và `password` |
| POST | `/api/analytics/ping` | Heartbeat web/mobile |
| POST | `/api/analytics/visitors` | Ghi nhận visitor |
| POST | `/api/analytics/listens` | Ghi lượt nghe web |
| POST | `/api/analytics/play` | Ghi/cập nhật phiên nghe; có hỗ trợ payload legacy |
| GET | `/api/analytics/stats` | Thống kê, yêu cầu Admin |
| GET | `/api/admin/bootstrap` | Dữ liệu ban đầu cho Admin |
| POST | `/api/admin/accounts` | Tạo Manager |
| PATCH | `/api/admin/accounts/:id` | Sửa Manager |
| PATCH | `/api/admin/accounts/:id/status` | Khóa/mở Manager |
| PATCH | `/api/admin/landmarks/:id` | Cập nhật địa danh |
| POST | `/api/admin/landmarks/:id/review` | Duyệt/từ chối đề xuất |
| POST | `/api/admin/landmarks/:id/buses` | Thêm liên kết xe buýt |
| DELETE | `/api/admin/bus-connections/:id` | Xóa liên kết xe buýt |
| GET | `/api/manager/workspace` | Workspace Manager |
| POST | `/api/manager/proposals` | Gửi đề xuất nội dung |

Các endpoint Admin/Manager kiểm tra token và vai trò. Token đăng nhập của API demo có thời hạn 30 phút. Chi tiết payload và xử lý hiện hành nằm trong [demo-api.js](multilingual-audio-guide/db/node/demo-api.js).

## Kiểm tra và build

Chạy từ thư mục làm việc chính:

```powershell
npm --prefix db run check
npm test
npm --prefix db run test:timing
npm run lint
npm run build
```

Các lệnh trên phục vụ kiểm tra khi cài đặt; tài liệu này không khẳng định chúng đã chạy thành công trên môi trường của bạn. `check` cần DB; build web không thay thế việc kiểm tra API, media, quyền và mobile trên thiết bị thật.

Xem thử bản build web:

```powershell
npm run preview
```

Proxy API hiện được khai báo ở `server.proxy` cho dev. Khi preview hoặc triển khai, cần cấu hình đường dẫn backend/reverse proxy phù hợp; cấu hình SPA fallback để các URL như `/user/:placeId` mở trực tiếp được.

## Giới hạn hiện tại

- Chưa xác nhận tính khả dụng của tất cả URL ảnh/audio trong seed, đặc biệt audio tiếng Anh cho từng địa danh.
- Chưa có bộ mốc câu đã căn audio thật đi kèm; mobile hiện đọc transcript theo đoạn.
- Hàng đợi thống kê mobile không phải chức năng tải audio/nội dung để nghe offline.
- QR ở dev server mở web qua LAN; chưa phải luồng deep link native Android/iOS hoàn chỉnh.
- API đăng nhập mặc định chưa triển khai OTP, 2FA hoặc khóa tạm sau nhiều lần sai mật khẩu.
- Các file `docs/prd.md`, `docs/architecture.md`, `docs/api-contract.md`, `docs/demo-script.md` và workflow CI hiện còn rỗng tại commit được kiểm tra.
- Thư mục workflow đang nằm dưới thư mục dự án con; cần cấu hình tại `.github/workflows/` ở gốc repository nếu xây dựng GitHub Actions.
- Chưa có xác nhận đóng gói/phát hành ứng dụng lên Google Play hoặc App Store.
- Trong repo hiện có file môi trường được theo dõi và giá trị cấu hình DB mặc định trong mã. Trước khi chia sẻ hoặc triển khai, rà soát, đưa cấu hình riêng ra môi trường và đổi thông tin bí mật nếu đã lộ; không sao chép chúng vào README.

## Xử lý lỗi thường gặp

| Lỗi/hiện tượng | Cách xử lý |
| --- | --- |
| `ENOENT package.json` hoặc không có script dev | Chuyển vào thư mục con `multilingual-audio-guide/` |
| `npm --prefix web install` thất bại | Chạy `npm install` tại thư mục làm việc chính |
| `vite not found` | Cài dependency tại thư mục làm việc chính |
| Thiếu `dotenv` hoặc `bcryptjs` | Chạy `npm --prefix db install` |
| `Missing PGHOST; configure db/.env` | Tạo/sửa `db/.env`, kiểm tra đủ 5 biến PG |
| Database/role không tồn tại | Chạy setup bằng tài khoản PostgreSQL có quyền phù hợp |
| `permission denied` | Kiểm tra `guide_app`, permissions và migration cấp quyền |
| Thiếu cột `session_id`, `listened_seconds` hoặc `completed` | Chạy migration `20261030_mobile_listening.sql` |
| Không nhận lệnh `psql` | Thêm PostgreSQL bin vào PATH hoặc dùng đường dẫn đầy đủ |
| Điện thoại không vào được API | Dùng IP LAN thay localhost, kiểm tra mạng và firewall |
| Web lỗi khi API đổi cổng | Sửa proxy Vite hoặc cấu hình URL API phù hợp |
| Có transcript nhưng không phát audio | Kiểm tra URL audio đúng ngôn ngữ và khả năng mở trực tiếp |
| Audio local chạy trên máy nhưng lỗi trên điện thoại | Kiểm tra URL media trong DB có đang trỏ đến localhost |
| Lỗi CORS | Đặt `DB_API_CORS_ORIGIN` đúng origin frontend, rồi khởi động lại API |
| Online về 0 sau restart API | Bộ đếm nằm trong RAM; đợi heartbeat mới |
| Nhập timing bị từ chối | Kiểm tra transcript, URL audio, start/end và thứ tự các câu |


