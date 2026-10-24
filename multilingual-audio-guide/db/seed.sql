-- Sample IDs only: align with shared/web/mobile constants before integration.
-- No real coordinates, bus schedules, media URLs or fake credentials.
BEGIN;
INSERT INTO public.landmarks(landmark_id, title_vi, title_en, description_vi, description_en, transcript_vi, transcript_en)
VALUES
 ('ben-thanh-market', 'Chợ Bến Thành', 'Ben Thanh Market', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Chợ Bến Thành. Thay bằng bài thuyết minh của bạn.', 'Sample Ben Thanh Market narration. Replace with your own transcript.'),
 ('independence-palace', 'Dinh Độc Lập', 'Independence Palace', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Dinh Độc Lập. Thay bằng bài thuyết minh của bạn.', 'Sample Independence Palace narration. Replace with your own transcript.'),
 ('notre-dame-cathedral', 'Nhà thờ Đức Bà', 'Notre Dame Cathedral', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Nhà thờ Đức Bà. Thay bằng bài thuyết minh của bạn.', 'Sample Notre Dame Cathedral narration. Replace with your own transcript.'),
 ('central-post-office', 'Bưu điện Trung tâm', 'Central Post Office', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Bưu điện Trung tâm. Thay bằng bài thuyết minh của bạn.', 'Sample Central Post Office narration. Replace with your own transcript.'),
 ( 'bach-dang-wharf', 'Bến Bạch Đằng','Bach Dang Wharf', 'Nội dung mẫu ','Sample content.', 'Sample content for Bach Dang Wharf.'),
 ('saigon-opera-house', 'Nhà hát Thành phố', 'Saigon Opera House', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Nhà hát Thành phố. Thay bằng bài thuyết minh của bạn.', 'Sample Saigon Opera House narration. Replace with your own transcript.')
 ('nguyen-van-binh-book-street',  'Đường Sách Nguyễn Văn Bình',  'Nguyen Van Binh Book Street', 'https://example.com/anh-nen-duong-sach.jpg', 'Nội dung mẫu Đường Sách Nguyễn Văn Bình.', 'Sample content for Nguyen Van Binh Book Street.'
);)
ON CONFLICT (landmark_id) DO NOTHING;
COMMIT;
UPDATE public.landmarks SET
  background_image_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/ben-thanh-market/ben-thanh-market1.jpeg',
  audio_vi_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/ben-thanh-market/vi.mp3',
  audio_en_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/ben-thanh-market/en.mp3'
WHERE landmark_id = 'ben-thanh-market';

UPDATE public.landmarks SET
  background_image_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Saigon_central_Post/buudienmenu.jpg',
  audio_vi_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/center-post-office/vi.mp3',
  audio_en_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/center-post-office/en.mp3'
WHERE landmark_id = 'central-post-office';

UPDATE public.landmarks SET
  background_image_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/independence_palce/dinhdoclapmenu.jpg',
  audio_vi_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/independence-place/vi.mp3',
  audio_en_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/independence-place/en.mp3'
WHERE landmark_id = 'independence-palace';

UPDATE public.landmarks SET
  background_image_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Notre-Dame_Cathedral_Basilica_of_Saigon/nhathomenu.jpg',
  audio_vi_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/notre-dame/vi.mp3',
  audio_en_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/notre-dame/en.mp3'
WHERE landmark_id = 'notre-dame-cathedral';

UPDATE public.landmarks SET
  background_image_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Ho_Chi_Minh_City_Opera_House/nhahatlon%20menu.jpg',
  audio_vi_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/operahouse/vi.mp3',
  audio_en_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/operahouse/en.mp3'
WHERE landmark_id = 'saigon-opera-house';

UPDATE public.landmarks SET
  background_image_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/bach-dang-wharf/bach_dang_wharf.jpg',
  audio_vi_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/bach-dang-wharf/vi.mp3',
  audio_en_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/bach-dang-wharf/en.mp3'
WHERE landmark_id = 'bach-dang-wharf';
UPDATE public.landmarks SET
  background_image_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/book-street/bookstreetmenu.jpg',
  audio_vi_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/book-street/vi.mp3',
  audio_en_url = 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/audio/book-street/en.mp3'
WHERE landmark_id = 'nguyen-van-binh-book-street';

# chia ra phần trên trc r ms phần này nha

INSERT INTO public.landmark_images (landmark_id, image_url, sort_order) VALUES
  ('ben-thanh-market',     'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/ben-thanh-market/hl1.jpg',  0),
  ('central-post-office',  'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Saigon_central_Post/buudienhl1.jpg',   0),
  ('independence-palace',  'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/independence_palce/dinhdoclaphl2.jpg', 1),
  ('notre-dame-cathedral', 'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Notre-Dame_Cathedral_Basilica_of_Saigon/nhathohl1.jpg',     0),
  ('saigon-opera-house',   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Ho_Chi_Minh_City_Opera_House/nhahatlonhl1.jpg',    0),
  ('bach-dang-wharf',      'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/bach-dang-wharf/hl1.webp',  0),
  ('nguyen-van-binh-book-street',      'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/book-street/hl1.jpg',  0)
  
ON CONFLICT (landmark_id, image_url) DO NOTHING;

# phân thêm ảnh nổi bật
INSERT INTO public.landmark_images (landmark_id, image_url, sort_order) VALUES
  -- 1. Chợ Bến Thành
  ('ben-thanh-market',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/ben-thanh-market/hl3.jpg', 0),
  ('ben-thanh-market',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/ben-thanh-market/hl2.jpg', 1),

  -- 2. Bưu điện Trung tâm
  ('central-post-office',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Saigon_central_Post/buudienhl2.jpg', 0),
  ('central-post-office',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Saigon_central_Post/buudienhl3.jpg', 1),

  -- 3. Dinh Độc Lập (đã có ảnh sort_order 0 nên bắt đầu từ 1)
  ('independence-palace',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/independence_palce/dinhdoclaphl3.jpg', 0),

  ('independence-palace',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/independence_palce/dinhdoclaphl1.jpg', 1),

  -- 4. Nhà thờ Đức Bà
  ('notre-dame-cathedral',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Notre-Dame_Cathedral_Basilica_of_Saigon/nhathohl2.jpg', 0),
  ('notre-dame-cathedral',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Notre-Dame_Cathedral_Basilica_of_Saigon/nhathohl3.jpg', 1),

  -- 5. Nhà hát Thành phố
  ('saigon-opera-house',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Ho_Chi_Minh_City_Opera_House/nhahatlonhl2.jpg', 0),
  ('saigon-opera-house',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/Ho_Chi_Minh_City_Opera_House/nhahatlonhl3.jpg', 1),

  -- 6. Bến Bạch Đằng (dữ liệu thật từ desktopData.js)
  ('bach-dang-wharf',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/bach-dang-wharf/hl2.webp', 0),
  ('bach-dang-wharf',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/bach-dang-wharf/hl3.jpg', 1),

  -- 7. Phố sách Nguyễn Văn Bình
  ('nguyen-van-binh-book-street',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/book-street/hl2.jpg', 0),
  ('nguyen-van-binh-book-street',
   'https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/book-street/hl3.jpg', 1)
ON CONFLICT (landmark_id, image_url) DO NOTHING;

#  nd thuyết minh 
-- 1. Bến Bạch Đằng
UPDATE public.landmarks
SET 
    transcript_vi = 'Bến Bạch Đằng, công viên và bờ kè ven sông Sài Gòn, trải dài dọc theo đường Tôn Đức Thắng, đoạn từ khu vực gần cột cờ Thủ Ngữ đến cầu Ba Son. Đây từ lâu đã là khu vực bến cảng, bến tàu quan trọng gắn liền với lịch sử hình thành và phát triển của đô thị Sài Gòn ngay từ những ngày đầu, khi thành phố còn được biết đến như một thương cảng sầm uất bên bờ sông.

Tên gọi "Bạch Đằng" được đặt nhằm gợi nhớ đến những chiến thắng lịch sử oai hùng trên sông Bạch Đằng của dân tộc Việt Nam. Qua nhiều giai đoạn lịch sử, khu vực bến sông này từng mang nhiều tên gọi khác nhau, và đã được quy hoạch, cải tạo nhiều lần để trở thành không gian công cộng phục vụ người dân và du khách như hiện nay. Gần đây nhất, công viên Bến Bạch Đằng đã được chỉnh trang, nâng cấp toàn diện, hoàn thành đưa vào sử dụng với diện mạo mới khang trang, hiện đại, trở thành một trong những không gian công cộng ven sông đẹp nhất thành phố.

Từ Bến Bạch Đằng, du khách có thể phóng tầm mắt ngắm nhìn toàn cảnh dòng sông Sài Gòn thơ mộng, cùng khu đô thị mới Thủ Thiêm sầm uất phía bên kia bờ sông với những tòa nhà cao tầng hiện đại, tạo nên một khung cảnh tương phản thú vị giữa nét cổ kính của trung tâm thành phố cũ và sự phát triển năng động của đô thị mới. Đây cũng là nơi bắt đầu của nhiều tuyến du thuyền, tàu cao tốc ngắm cảnh trên sông, tuyến buýt đường sông (Waterbus) kết nối trung tâm thành phố với các khu vực lân cận, cũng như là bến xuất phát của các chuyến tàu cao tốc đi Vũng Tàu, Cần Giờ.

Vào mỗi buổi chiều tà, Bến Bạch Đằng trở thành điểm hẹn hò, dạo mát quen thuộc của người dân thành phố và du khách, đặc biệt vào thời điểm hoàng hôn buông xuống, khi ánh nắng vàng cam phản chiếu lung linh trên mặt sông, hòa cùng ánh đèn dần lên của các tòa nhà cao tầng bên kia bờ Thủ Thiêm, tạo nên một trong những khung cảnh hoàng hôn đẹp và lãng mạn bậc nhất Sài Gòn. Đây cũng là điểm ngắm pháo hoa lý tưởng vào các dịp lễ, Tết quan trọng của thành phố.',
    
    transcript_en = 'Bach Dang Wharf, comprising the park and waterfront embankment along the Saigon River, stretches along Ton Duc Thang Street from the area near Thu Ngu Flagpole to Ba Son Bridge This area has long served as an important port and pier closely tied to the history and development of Saigon since its early days when the city was known as a bustling commercial port along the riverbank

The name "Bach Dang" was given to commemorate the glorious historic victories on the Bach Dang River in Vietnamese national history Through various historical periods, this riverside wharf bore different names and underwent multiple planning and renovation projects to become the public space serving residents and tourists today Most recently, Bach Dang Wharf Park was comprehensively renovated and upgraded, reopening with a modern, spacious appearance as one of the city''s finest waterfront public spaces

From Bach Dang Wharf, visitors can take in panoramic views of the picturesque Saigon River and the bustling Thu Thiem New Urban Area across the water with its modern skyscrapers, creating a fascinating contrast between the charm of the historic city center and the dynamic growth of the new urban area It is also the departure point for numerous river cruises, sightseeing speedboats, the Saigon Waterbus connecting downtown with surrounding areas, as well as high-speed ferries to Vung Tau and Can Gio

Every late afternoon, Bach Dang Wharf becomes a popular spot for locals and tourists to stroll and meet, especially as sunset falls The warm orange sunlight glimmers on the river surface, merging with the emerging lights of the skyscrapers across in Thu Thiem to create one of Saigon''s most romantic sunset scenes It also serves as an ideal location for watching firework displays during major holidays and New Year celebrations in the city'
WHERE landmark_id = 'bach-dang-wharf';


-- 2. Chợ Bến Thành
UPDATE public.landmarks
SET 
    transcript_vi = 'Chợ Bến Thành là khu chợ được xem như biểu tượng thương mại lâu đời và nổi tiếng bậc nhất của Sài Gòn – TP. Hồ Chí Minh. Chợ Bến Thành hiện nay được khởi công xây dựng vào năm 1912 và khánh thành năm 1914, do người Pháp quy hoạch xây dựng, nằm trên nền đất trước đây vốn là một khu đầm lầy được san lấp. Tên gọi "Bến Thành" bắt nguồn từ vị trí chợ xưa vốn nằm gần một bến sông sát thành Gia Định cũ; trước khi xây dựng tại vị trí hiện tại, khu vực chợ cũ từng tọa lạc gần bờ sông Sài Gòn (nay là khu vực Bến Bạch Đằng), sau khi bị hỏa hoạn mới được dời và xây dựng lại kiên cố tại vị trí hiện nay.

Về kiến trúc, điểm nhận diện đặc trưng và nổi tiếng nhất của chợ chính là tháp đồng hồ ở cửa Nam (mặt chính hướng ra vòng xoay Quách Thị Trang), từ lâu đã trở thành một trong những hình ảnh mang tính biểu tượng của Sài Gòn, thường xuất hiện trên các ấn phẩm quảng bá du lịch, bưu thiếp. Chợ có 4 cửa chính hướng ra bốn con đường xung quanh, mỗi cửa mang một đặc trưng buôn bán riêng: cửa Nam bán quần áo, giày dép; cửa Bắc chủ yếu kinh doanh vải vóc, phụ liệu may mặc; cửa Đông tập trung hàng lưu niệm, hàng thủ công mỹ nghệ; còn cửa Tây chủ yếu bán thực phẩm khô, gia vị, đặc sản.

Bên trong chợ có khoảng hơn một nghìn năm trăm sạp hàng khác nhau, được bố trí thành các khu ngành hàng riêng biệt, kinh doanh đa dạng các mặt hàng từ thực phẩm tươi sống, đặc sản vùng miền, hàng gia dụng, vải vóc, quần áo, giày dép cho đến đồ thủ công mỹ nghệ, quà lưu niệm phục vụ du khách. Không chỉ là nơi mua sắm, khu vực xung quanh chợ Bến Thành về đêm còn nổi tiếng với phố ẩm thực đường Phan Chu Trinh và Phan Bội Châu, quy tụ nhiều món ăn đặc trưng của ẩm thực Sài Gòn và các vùng miền Việt Nam.

Trải qua hơn một thế kỷ tồn tại, chợ Bến Thành không chỉ đơn thuần là một trung tâm thương mại sầm uất mà đã trở thành một biểu tượng văn hóa, gắn liền với đời sống, ký ức của nhiều thế hệ người Sài Gòn, đồng thời là điểm đến quen thuộc, gần như bắt buộc phải ghé qua đối với bất kỳ du khách nào khi đặt chân đến thành phố mang tên Bác.',
    
    transcript_en = 'Ben Thanh Market is considered one of the oldest and most iconic commercial landmarks of Saigon – Ho Chi Minh City. Construction of the current market began in 1912 and was completed in 1914 under French planning, built on reclaimed land that was previously a marshland. The name "Ben Thanh" originates from the old market''s location near a river wharf adjacent to the ancient Gia Dinh Citadel; prior to its present location, the old market stood near the Saigon River bank (now the Bach Dang Wharf area) before being relocated and permanently rebuilt at its current site following a fire.

Architecturally, the market''s most recognizable feature is the clock tower at the South Gate (facing the Quach Thi Trang roundabout), which has long served as a classic symbol of Saigon, frequently featured on travel publications and postcards. The market features four main gates facing four surrounding streets, each specializing in distinct goods: the South Gate sells clothing and footwear; the North Gate primarily trades fabrics and sewing accessories; the East Gate focuses on souvenirs and handicrafts; while the West Gate mainly offers dried foods, spices, and regional specialties.

Inside, the market houses over 1,500 stalls organized into specialized sections, offering a diverse array of items ranging from fresh produce, regional delicacies, and household items to fabrics, apparel, handicrafts, and souvenirs for tourists. Beyond daytime shopping, the surrounding area at night is famous for the vibrant street food scene along Phan Chu Trinh and Phan Bội Châu streets, gathering signature dishes from Saigon and across Vietnam.

Spanning over a century of existence, Ben Thanh Market is not merely a bustling commercial center but has evolved into a cultural icon deeply woven into the lives and memories of generations of Saigonese, as well as an essential landmark for any visitor exploring the city.'
WHERE landmark_id = 'ben-thanh-market';


-- 3. Đường Sách Nguyễn Văn Bình
UPDATE public.landmarks
SET 
    transcript_vi = 'Nằm ngay cạnh Bưu điện Trung tâm Sài Gòn, con đường Nguyễn Văn Bình tuy ngắn nhưng lại mang một nét văn hóa rất riêng: đây chính là Đường sách Thành phố Hồ Chí Minh, được khánh thành và đi vào hoạt động từ ngày 9 tháng 1 năm 2016, nhân dịp chào mừng năm mới và hướng tới Ngày sách Việt Nam. Đây là con đường sách đầu tiên được hình thành một cách quy hoạch, bài bản tại Việt Nam, trên cơ sở cải tạo lại không gian công cộng vốn có từ nhiều thập niên trước.

Con đường dài khoảng 144 mét, được lát gạch, trồng nhiều cây xanh rợp bóng mát, bố trí khoảng 20 gian hàng sách cố định của các nhà xuất bản, công ty phát hành sách lớn trong nước, cùng với các quầy sách cũ, sách quý hiếm, khu vực cà phê sách và không gian trưng bày, tổ chức sự kiện giao lưu tác giả, ra mắt sách định kỳ. Kiến trúc các gian hàng được thiết kế đồng bộ, hài hòa với cảnh quan xung quanh khu vực Nhà thờ Đức Bà và Bưu điện Trung tâm, tạo nên một quần thể không gian văn hóa – lịch sử thống nhất ngay giữa trung tâm thành phố.

Từ khi đi vào hoạt động, Đường sách Nguyễn Văn Bình nhanh chóng trở thành điểm hẹn văn hóa quen thuộc của người dân thành phố, đặc biệt là giới trẻ, học sinh, sinh viên và những người yêu sách. Đây cũng là nơi thường xuyên diễn ra các hoạt động như triển lãm sách, workshop kỹ năng đọc sách, các buổi giao lưu với tác giả trong và ngoài nước, hoạt động hưởng ứng Ngày Sách và Văn hóa đọc Việt Nam (21/4) cũng như Ngày Sách và Bản quyền Thế giới.

Không chỉ là nơi mua bán sách, Đường sách còn được xem như một "lá phổi văn hóa" giữa lòng đô thị, nơi du khách có thể tản bộ, nghỉ chân, thưởng thức cà phê, tìm đọc những cuốn sách về lịch sử, văn hóa Sài Gòn xưa và nay. Với vị trí đắc địa nằm giữa hai công trình kiến trúc mang tính biểu tượng là Nhà thờ Đức Bà và Bưu điện Trung tâm, Đường sách Nguyễn Văn Bình đã góp phần làm phong phú thêm trải nghiệm văn hóa của du khách khi khám phá khu vực trung tâm thành phố, đồng thời thể hiện nỗ lực gìn giữ và lan tỏa văn hóa đọc trong đời sống đô thị hiện đại.',
    
    transcript_en = 'Located right next to the Saigon Central Post Office, Nguyen Van Binh Street is short yet possesses a distinct cultural atmosphere: this is Ho Chi Minh City Book Street, inaugurated and opened on January 9, 2016, to celebrate the New Year and look forward to Vietnam Book Day It is the first well-planned and structured book street in Vietnam, developed by transforming a public space with a history spanning several decades

Measuring approximately 144 meters in length, the brick-paved street is shaded by lush trees and hosts about 20 permanent book stalls operated by major domestic publishers and distributors, alongside secondhand and rare book booths, book cafes, and spaces for exhibitions, author meet-and-greets, and book launches The architecture of the stalls is uniformly designed to harmonize with the surrounding landscape of Notre-Dame Cathedral and the Central Post Office, creating a unified historical and cultural complex in the heart of the city

Since its opening, Nguyen Van Binh Book Street has quickly become a familiar cultural gathering spot for city residents, especially youth, students, and book lovers It frequently hosts events such as book exhibitions, reading skill workshops, author exchanges with domestic and international writers, as well as activities celebrating Vietnam Book and Reading Culture Day (April 21) and World Book and Copyright Day

More than just a place to buy and sell books, the Book Street is regarded as a "cultural lung" in the urban center, where visitors can stroll, rest, enjoy coffee, and explore books about Saigon''s history and culture past and present With its prime location between two iconic architectural landmarks—Notre-Dame Cathedral and the Central Post Office—Nguyen Van Binh Book Street enriches the cultural experience of tourists exploring downtown, while demonstrating efforts to preserve and spread reading culture in modern urban life'
WHERE landmark_id = 'nguyen-van-binh-book-street';


-- 4. Bưu điện Trung tâm
UPDATE public.landmarks
SET 
    transcript_vi = 'Ngay đối diện Nhà thờ Đức Bà là một công trình kiến trúc Pháp cổ kính khác: Bưu điện Trung tâm Sài Gòn. Công trình được xây dựng trong khoảng thời gian từ năm 1886 đến 1891, theo thiết kế có sự tham gia của kiến trúc sư Alfred Foulhoux, mang phong cách kết hợp giữa kiến trúc châu Âu cổ điển và những nét trang trí phương Đông, đến nay vẫn được xem là một trong những công trình bưu điện đẹp và cổ nhất còn hoạt động tại Việt Nam.

Mặt tiền tòa nhà nổi bật với các cột trụ, vòm cửa và những tấm biển ghi tên các danh nhân khoa học nổi tiếng của Pháp gắn trên mặt tường phía trước. Đặc biệt, hai bên tường ngoài còn có hai tấm bản đồ lớn đắp nổi bằng vữa: một bên là bản đồ "Sài Gòn và các vùng phụ cận năm 1892", bên còn lại là bản đồ đường dây điện tín Nam Kỳ và Campuchia năm 1936, vốn là các bản đồ hành chính, viễn thông thời Pháp thuộc, nay trở thành những chứng tích lịch sử quý giá.

Bước vào bên trong, du khách sẽ ấn tượng với không gian đại sảnh rộng lớn, mái vòm cong hình cung uốn lượn theo suốt chiều dài tòa nhà, được nâng đỡ bởi hệ khung sắt vững chắc theo phong cách kiến trúc công nghiệp châu Âu cuối thế kỷ 19, tương tự phong cách của các nhà ga xe lửa lớn thời bấy giờ. Hai bên đại sảnh là những dãy ghế gỗ dài cùng các ô cửa quầy giao dịch cổ, cùng tồn tại với các quầy dịch vụ bưu chính hiện đại ngày nay, tạo nên sự pha trộn thú vị giữa quá khứ và hiện tại.

Nổi bật ở vị trí trung tâm cuối đại sảnh là bức chân dung Chủ tịch Hồ Chí Minh cỡ lớn, cùng tấm bản đồ Việt Nam, thể hiện rõ dấu ấn lịch sử qua các thời kỳ mà công trình đã đi qua.

Trải qua hơn 130 năm, Bưu điện Trung tâm Sài Gòn vẫn duy trì đầy đủ chức năng của một bưu cục đang hoạt động, phục vụ các dịch vụ gửi thư, bưu phẩm, đổi ngoại tệ, đồng thời là điểm tham quan, chụp ảnh yêu thích của du khách trong và ngoài nước. Đây được xem là một minh chứng sống động cho việc bảo tồn và phát huy giá trị di sản kiến trúc đô thị ngay trong lòng một thành phố hiện đại, năng động.',
    
    transcript_en = 'Directly across from Notre-Dame Cathedral stands another historic French architectural treasure: the Saigon Central Post Office. Built between 1886 and 1891 based on designs involving architect Alfred Foulhoux, the building combines classic European architecture with subtle Asian ornamental details, remaining one of the most beautiful and oldest operating post offices in Vietnam.

The facade features grand pillars, arched doorways, and commemorative plaques bearing the names of famous French scientists mounted on the outer walls. Notably, flanking the main entrance inside are two large historical painted maps plaster-molded on the walls: one displaying "Saigon and its Environs in 1892" and the other showing the "Telegraphic Lines of Southern Vietnam and Cambodia in 1936."

Stepping inside, visitors are greeted by a vast main hall featuring a soaring vaulted ceiling supported by an intricate iron framework reminiscent of 19th-century European industrial architecture and railway stations. Long wooden benches and vintage teller booths line the sides, operating alongside modern postal services to create a charming harmony between past and present. Prominently featured at the far end of the hall is a large portrait of President Ho Chi Minh above a map of Vietnam.

After more than 130 years, Saigon Central Post Office continues to function as a fully operational postal facility offering mailing, parcel shipping, and currency exchange services, while serving as a beloved sightseeing and photography spot for domestic and international travelers alike.'
WHERE landmark_id = 'central-post-office';


-- 5. Dinh Độc Lập
UPDATE public.landmarks
SET 
    transcript_vi = 'chúng ta đang đứng trước Dinh Độc Lập – một trong những công trình kiến trúc và di tích lịch sử quan trọng bậc nhất của Việt Nam. Công trình đầu tiên trên nền đất này là Dinh Norodom, được người Pháp xây dựng từ năm 1868 đến 1871, làm nơi ở và làm việc cho Thống đốc Nam Kỳ, sau đó là Toàn quyền Đông Dương. Trải qua nhiều biến động lịch sử, tòa dinh thự cũ đã bị hư hại nặng trong một vụ ném bom năm 1962. Chính quyền Việt Nam Cộng hòa khi đó đã quyết định xây dựng lại hoàn toàn trên nền cũ, và công trình mới mang tên Dinh Độc Lập được hoàn thành vào năm 1966, do kiến trúc sư Ngô Viết Thụ – người Việt Nam đầu tiên đoạt giải Khôi nguyên La Mã – thiết kế.

Điểm đặc biệt của kiến trúc Dinh Độc Lập nằm ở sự kết hợp hài hòa giữa phong cách hiện đại của thập niên 1960 với các yếu tố triết lý phương Đông. Mặt tiền dinh được thiết kế mô phỏng hình chữ "Hưng", tượng trưng cho sự hưng thịnh; toàn bộ mặt bằng tổng thể lại mang hình chữ "Cát" (may mắn, tốt lành) nếu nhìn từ trên cao. Hệ thống các bức rèm hoa văn bằng bê tông đúc sẵn bao quanh tầng hai, được lấy cảm hứng từ những đốt trúc, vừa có tác dụng che nắng vừa mang ý nghĩa về khí tiết người quân tử. Dinh gồm 3 tầng chính, 2 gác lửng, sân thượng, tầng nền và 2 tầng hầm, với tổng cộng khoảng 100 phòng được trang trí theo nhiều phong cách khác nhau, phục vụ các mục đích từ nghi lễ ngoại giao, làm việc, đến sinh hoạt riêng tư của gia đình Tổng thống.

Vào trưa ngày 30 tháng 4 năm 1975, chiếc xe tăng mang số hiệu 843 và 390 của Quân Giải phóng đã húc đổ cánh cổng sắt của Dinh Độc Lập, đánh dấu thời khắc kết thúc cuộc kháng chiến chống Mỹ, thống nhất đất nước. Hình ảnh này đã trở thành một trong những biểu tượng lịch sử nổi tiếng nhất của Việt Nam thế kỷ 20. Hai chiếc xe tăng mô phỏng hiện vẫn được trưng bày trang trọng trong khuôn viên dinh.
Ngày nay, Dinh Độc Lập được bảo tồn gần như nguyên vẹn nội thất từ trước năm 1975, cho phép du khách tham quan phòng khánh tiết, phòng họp Hội đồng Nội các, phòng làm việc của Tổng thống, phòng trình quốc thư, khu vực sinh hoạt gia đình ở tầng hai, cũng như hệ thống hầm ngầm kiên cố với các phòng thông tin liên lạc, phòng tác chiến từng được thiết kế để chống chịu bom đạn. Năm 1976, Dinh được xếp hạng Di tích lịch sử văn hóa quốc gia, và đến năm 2009 được công nhận là Di tích quốc gia đặc biệt. Đây không chỉ là một công trình kiến trúc độc đáo mà còn là chứng nhân sống động cho một giai đoạn lịch sử đầy biến động của dân tộc Việt Nam.',
    
    transcript_en = 'We are standing in front of Independence Palace – one of the most significant architectural monuments and historical landmarks in Vietnam. The first structure on this site was Norodom Palace, built by the French between 1868 and 1871 as the residence and workplace for the Governor-General of Cochinchina and later the Governor-General of French Indochina. Following severe damage during a 1962 bombing raid, the Republic of Vietnam government decided to rebuild a completely new structure on the original grounds. Completed in 1966, the new building was named Independence Palace and designed by architect Ngo Viet Thu – the first Vietnamese winner of the prestigious Prix de Rome.

The architectural highlight of Independence Palace lies in its harmonious blend of 1960s modernism and Eastern philosophical symbolism. The facade is designed to resemble the Sino-Vietnamese character "Hưng" (Prosperity), while the overall aerial floor plan represents the character "Cát" (Good Fortune). The precast concrete screen panels surrounding the second floor draw inspiration from bamboo stalks, providing sun shading while symbolizing the integrity of a noble gentleman. The palace comprises 3 main floors, 2 mezzanines, a rooftop terrace, a ground level, and 2 basement levels, featuring around 100 rooms decorated in various styles to serve diplomatic ceremonies, executive meetings, and private presidential living quarters.

Today, Independence Palace preserves its pre-1975 interior nearly intact, allowing visitors to tour the Reception Hall, Cabinet Room, Presidential Office, Credential Presentation Room, family quarters, as well as the fortified underground bunker complex containing telecommunications and war rooms built to withstand heavy bombardment. Designated a National Historical Monument in 1976 and a Special National Landmark in 2009, it stands as a unique architectural masterpiece and a living witness to a pivotal period in Vietnamese history.On the noon of April 30, 1975, Liberation Army tanks No. 843 and 390 crashed through the iron gates of Independence Palace, marking the dramatic conclusion of the Vietnam War and the reunification of the country. This moment stands as one of the most famous historical symbols of 20th-century Vietnam, with replicas of the two tanks proudly displayed on the palace grounds today.'
WHERE landmark_id = 'independence-palace';


-- 6. Nhà thờ Đức Bà
UPDATE public.landmarks
SET 
    transcript_vi = 'chúng ta di chuyển đến Vương cung Thánh đường Chính tòa Đức Bà Sài Gòn, thường được gọi thân mật là Nhà thờ Đức Bà – một trong những biểu tượng kiến trúc lâu đời và nổi tiếng nhất của thành phố. Nhà thờ được xây dựng từ năm 1877 đến 1880 dưới sự chỉ đạo của kiến trúc sư J. Bourard, theo phong cách kiến trúc Roman cải biên kết hợp với Gothic, một phong cách thường thấy ở các nhà thờ lớn châu Âu thời kỳ đó.

Toàn bộ vật liệu xây dựng nhà thờ đều được nhập khẩu trực tiếp từ Pháp. Gạch xây tường được lấy từ vùng Marseille, đến nay sau hơn 140 năm vẫn giữ được màu sắc hồng nhạt đặc trưng, không hề bám rêu phong hay bợt màu, và không cần trát vữa hay sơn phủ bên ngoài. Đây là một điểm rất đặc biệt khiến công trình luôn giữ được vẻ đẹp nguyên bản qua thời gian. Các khung cửa sổ kính màu (kính vitrail) mô tả các điển tích trong Kinh Thánh cũng được chế tác tinh xảo tại Pháp và vận chuyển sang, tuy nhiên phần lớn số kính nguyên bản đã bị hư hại qua hai cuộc chiến tranh và hiện chỉ còn một phần được lưu giữ.

Công trình có hai tháp chuông cao khoảng 58 mét, ban đầu chưa có chóp nhọn, đến năm 1895 mới được xây thêm hai chóp tháp bằng thép cao khoảng 21 mét, đưa tổng chiều cao mỗi tháp lên khoảng 60,5 mét, trở thành điểm nhấn nổi bật trên bầu trời Sài Gòn. Bên trong tháp còn lưu giữ bộ 6 quả chuông đồng lớn được đúc tại Pháp năm 1879, có tổng trọng lượng gần 30 tấn, được xem là bộ chuông có trọng lượng lớn nhất Việt Nam.

Phía trước nhà thờ, trên quảng trường Công xã Paris, là bức tượng Đức Mẹ Hòa Bình bằng đá cẩm thạch trắng, được dựng năm 1959, tay cầm quả địa cầu với cây thánh giá phía trên, ánh mắt hướng lên trời. Bức tượng gắn liền với một sự kiện được nhiều người truyền tụng vào năm 1959, khi có tin đồn tượng "chảy nước mắt", thu hút rất đông người dân đến chiêm ngưỡng và cầu nguyện.

Trải qua hơn một thế kỷ, Nhà thờ Đức Bà vẫn là nơi hành lễ quan trọng của cộng đồng Công giáo Sài Gòn, đồng thời là điểm đến không thể bỏ qua với bất kỳ du khách nào khi ghé thăm thành phố, một biểu tượng gắn liền với hình ảnh trung tâm đô thị Sài Gòn – TP. Hồ Chí Minh qua nhiều thế hệ.',
    
    transcript_en = 'We now move to the Notre-Dame Cathedral Basilica of Saigon, affectionately known as Notre-Dame Cathedral – one of the city''s oldest and most renowned architectural icons. Constructed between 1877 and 1880 under the direction of French architect J. Bourard, the cathedral features a neo-Romanesque design blended with Gothic elements, characteristic of major European cathedrals of that era.

All building materials were imported directly from France. The exterior red bricks were sourced from Marseille; even after more than 140 years, they retain their distinct pinkish-red hue without accumulating moss, fading, or requiring any plastering or paint coating. The stained-glass windows depicting biblical scenes were also crafted in France, though much of the original glass was damaged during wartime and only partially preserved today.

The structure features two bell towers reaching a height of approximately 58 meters. In 1895, two iron spires measuring 21 meters were added, bringing the total height of each tower to 60.5 meters and creating a prominent landmark against the Saigon skyline. Inside the towers hangs a set of six large bronze bells cast in France in 1879 with a combined weight of nearly 30 tons, recognized as the heaviest bell set in Vietnam.

In front of the cathedral on Paris Square stands the Statue of Our Lady of Peace, sculpted from white Italian marble in 1959. The statue depicts the Virgin Mary holding a globe topped with a cross, with her gaze directed toward the heavens. Over more than a century, Notre-Dame Cathedral remains an important place of worship for Saigon''s Catholic community and an unmissable destination for visitors exploring the historic heart of Ho Chi Minh City.'
WHERE landmark_id = 'notre-dame-cathedral';


-- 7. Nhà hát Thành phố
UPDATE public.landmarks
SET 
    transcript_vi = 'Tiếp tục hành trình dọc theo con đường Đồng Khởi sầm uất, chúng ta đến với Nhà hát Thành phố Hồ Chí Minh, hay còn được biết đến với tên gọi Nhà hát Lớn Sài Gòn – một trong những công trình kiến trúc tiêu biểu cho phong cách "Flamboyant" (kiến trúc thời Đệ Tam Cộng hòa Pháp) còn được bảo tồn nguyên vẹn nhất tại Việt Nam. Công trình được xây dựng từ năm 1898 và hoàn thành vào năm 1900, do kiến trúc sư người Pháp Eugène Ferret thiết kế, lấy cảm hứng từ kiến trúc của Nhà hát Opéra Garnier nổi tiếng tại Paris.

Mặt tiền Nhà hát được trang trí cầu kỳ, tinh xảo với nhiều phù điêu, tượng đắp nổi mang phong cách nghệ thuật châu Âu cổ điển, các đường nét uốn lượn mềm mại đặc trưng của trường phái kiến trúc lãng mạn cuối thế kỷ 19. Một số chi tiết điêu khắc, tượng trang trí ở mặt tiền được lấy nguyên mẫu, phỏng theo phong cách trang trí của Petit Palais tại Paris (khánh thành cùng năm 1900). Nội thất bên trong nhà hát được trang bị theo tiêu chuẩn châu Âu đương thời, gồm hệ thống ánh sáng, âm thanh, cùng khán phòng thiết kế theo dạng hình móng ngựa cổ điển, sức chứa khoảng 500 chỗ ngồi (đã qua nhiều lần trùng tu điều chỉnh), đảm bảo hiệu ứng âm thanh tối ưu cho các buổi biểu diễn nghệ thuật.

Trải qua hơn một thế kỷ, Nhà hát Thành phố đã đóng nhiều vai trò khác nhau qua các giai đoạn lịch sử: từng là nơi biểu diễn nghệ thuật của giới thượng lưu Pháp và bản xứ thời thuộc địa, có giai đoạn được sử dụng làm trụ sở của Hạ Nghị viện chính quyền Sài Gòn trước năm 1975, và từ sau năm 1975 chính thức được khôi phục lại chức năng ban đầu là nhà hát biểu diễn nghệ thuật. Công trình đã trải qua một đợt trùng tu lớn vào năm 1998, nhân dịp kỷ niệm 300 năm thành lập Sài Gòn, nhằm phục hồi lại các chi tiết kiến trúc nguyên bản đã bị biến đổi qua thời gian.
Ngày nay, Nhà hát Thành phố vẫn thường xuyên tổ chức các chương trình biểu diễn nghệ thuật đa dạng, từ nhạc giao hưởng, opera, múa ballet đến các chương trình nghệ thuật dân tộc, đồng thời là nơi diễn ra nhiều sự kiện văn hóa, liên hoan nghệ thuật quan trọng của thành phố. Nằm ở vị trí trung tâm, ngay giao lộ giữa các con đường sầm uất bậc nhất Sài Gòn, Nhà hát Thành phố không chỉ là một thiết chế văn hóa nghệ thuật mà còn là một trong những biểu tượng kiến trúc – lịch sử nổi bật, gắn liền với hình ảnh khu vực trung tâm thành phố qua hơn một thế kỷ.',
    
    transcript_en = 'Continuing along bustling Dong Khoi Street, we arrive at the Municipal Theatre of Ho Chi Minh City, popularly known as the Saigon Opera House – one of the finest preserved examples of French Third Republic "Flamboyant" architecture in Vietnam. Built between 1898 and 1900 under the design of French architect Eugène Ferret, the building took inspiration from the iconic Opéra Garnier in Paris.

The exterior facade is ornately decorated with intricate reliefs, statues, and sweeping curves characteristic of late 19th-century European romanticism. Certain sculptural elements on the facade were modeled after decor from the Petit Palais in Paris. The interior was equipped to contemporary European standards of its time, featuring professional lighting, acoustics, and a classic horseshoe-shaped auditorium with a seating capacity of around 500.

Over more than a century, the Saigon Opera House has fulfilled diverse historical roles: serving as an elite performing arts venue during the colonial era, temporarily housing the Lower House of the Saigon government prior to 1975, and returning to its original purpose as a premier performing arts theater post-1975. It underwent a major restoration in 1998 to celebrate the 300th anniversary of Saigon, restoring its original architectural details.

Today, the Opera House regularly hosts diverse artistic performances ranging from symphonies, operas, and ballets to traditional Vietnamese cultural shows. Situated at the junction of Saigon''s most elegant avenues, it serves as both a cultural institution and an enduring architectural milestone of the city.'
WHERE landmark_id = 'saigon-opera-house';
# mô tả ngắn
-- 1. Chợ Bến Thành
UPDATE public.landmarks SET description_vi = 'Biểu tượng thương mại lâu đời nhất Sài Gòn với tháp đồng hồ cửa Nam nổi tiếng, nơi giao thương sầm uất của các mặt hàng đặc sản, vải vóc và thủ công mỹ nghệ.', description_en = 'Saigon''s oldest commercial symbol famous for its South Gate clock tower, bustling with local specialties, fabrics, and handicrafts.' WHERE landmark_id = 'ben-thanh-market';

-- 2. Bưu điện Trung tâm
UPDATE public.landmarks SET description_vi = 'Công trình kiến trúc Pháp cổ kính với mái vòm sắt ấn tượng và những tấm bản đồ cổ, là một trong những bưu điện lâu đời nhất Việt Nam vẫn đang hoạt động.', description_en = 'A historic French colonial building with an impressive iron vault and old maps, remaining one of the oldest operating post offices in Vietnam.' WHERE landmark_id = 'central-post-office';

-- 3. Dinh Độc Lập
UPDATE public.landmarks SET description_vi = 'Di tích lịch sử quốc gia đặc biệt, chứng nhân của sự kiện 30/4/1975, nổi bật với kiến trúc hiện đại kết hợp hài hòa cùng triết lý phương Đông.', description_en = 'A special national historic site marking the end of the Vietnam War in 1975, featuring modern architecture blended with Eastern philosophy.' WHERE landmark_id = 'independence-palace';

-- 4. Nhà thờ Đức Bà
UPDATE public.landmarks SET description_vi = 'Biểu tượng kiến trúc Roman-Gothic tráng lệ với gạch đỏ nhập khẩu hoàn toàn từ Pháp và hai tháp chuông cao vút giữa trung tâm thành phố.', description_en = 'A magnificent Roman-Gothic architectural masterpiece with red bricks imported entirely from France and twin bell towers in the city center.' WHERE landmark_id = 'notre-dame-cathedral';

-- 5. Nhà hát Thành phố
UPDATE public.landmarks SET description_vi = 'Nhà hát mang kiến trúc "Flamboyant" tráng lệ, là trung tâm biểu diễn nghệ thuật và diễn ra nhiều sự kiện văn hóa quan trọng bậc nhất của thành phố.', description_en = 'A magnificent "Flamboyant" style theater serving as the city''s premier performing arts and cultural event venue.' WHERE landmark_id = 'saigon-opera-house';

-- 6. Bến Bạch Đằng
UPDATE public.landmarks SET description_vi = 'Công viên bờ kè ven sông Sài Gòn, điểm ngắm hoàng hôn tuyệt đẹp và là bến khởi hành của các chuyến tàu du lịch đường thủy, buýt sông.', description_en = 'A riverside park along the Saigon River, offering stunning sunset views and serving as a departure point for river cruises and waterbuses.' WHERE landmark_id = 'bach-dang-wharf';

-- 7. Đường Sách Nguyễn Văn Bình
UPDATE public.landmarks SET description_vi = 'Không gian văn hóa độc đáo giữa trung tâm thành phố, nơi hội tụ các gian hàng sách, cà phê và thường xuyên tổ chức các sự kiện giao lưu tác giả.', description_en = 'A unique cultural space in the city center, gathering book stalls, cafes, and regularly hosting author meet-and-greet events.' WHERE landmark_id = 'nguyen-van-binh-book-street';