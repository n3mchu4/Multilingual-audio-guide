-- Sample IDs only: align with shared/web/mobile constants before integration.
-- No real coordinates, bus schedules, media URLs or fake credentials.
BEGIN;
INSERT INTO public.landmarks(landmark_id, title_vi, title_en, description_vi, description_en, transcript_vi, transcript_en)
VALUES
 ('ben-thanh-market', 'Chợ Bến Thành', 'Ben Thanh Market', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Chợ Bến Thành. Thay bằng bài thuyết minh của bạn.', 'Sample Ben Thanh Market narration. Replace with your own transcript.'),
 ('independence-palace', 'Dinh Độc Lập', 'Independence Palace', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Dinh Độc Lập. Thay bằng bài thuyết minh của bạn.', 'Sample Independence Palace narration. Replace with your own transcript.'),
 ('notre-dame-cathedral', 'Nhà thờ Đức Bà', 'Notre Dame Cathedral', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Nhà thờ Đức Bà. Thay bằng bài thuyết minh của bạn.', 'Sample Notre Dame Cathedral narration. Replace with your own transcript.'),
 ('central-post-office', 'Bưu điện Trung tâm', 'Central Post Office', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Bưu điện Trung tâm. Thay bằng bài thuyết minh của bạn.', 'Sample Central Post Office narration. Replace with your own transcript.'),
 ('nguyen-hue-walking-street', 'Phố đi bộ Nguyễn Huệ', 'Nguyen Hue Walking Street', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Phố đi bộ Nguyễn Huệ. Thay bằng bài thuyết minh của bạn.', 'Sample Nguyen Hue Walking Street narration. Replace with your own transcript.'),
 ('saigon-opera-house', 'Nhà hát Thành phố', 'Saigon Opera House', 'Nội dung mẫu.', 'Sample content.', 'Nội dung mẫu Nhà hát Thành phố. Thay bằng bài thuyết minh của bạn.', 'Sample Saigon Opera House narration. Replace with your own transcript.')
ON CONFLICT (landmark_id) DO NOTHING;
COMMIT;
