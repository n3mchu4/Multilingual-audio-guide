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