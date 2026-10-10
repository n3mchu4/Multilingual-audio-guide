SELECT current_database() AS database, version();
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT count(*) AS landmarks FROM public.landmarks;
SELECT landmark_id, title_vi, title_en, audio_vi_url, audio_en_url FROM public.landmarks ORDER BY landmark_id;
SELECT role, count(*) FROM public.users GROUP BY role;
SELECT count(*) AS pending_proposals FROM public.proposals WHERE status = 'PENDING';
DO $$
BEGIN
  IF (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE') <> 9 THEN
    RAISE EXCEPTION 'Expected 9 ERD tables in a fresh standalone database';
  END IF;
  IF EXISTS (SELECT 1 FROM public.landmarks l WHERE l.has_pending_request IS DISTINCT FROM
      EXISTS (SELECT 1 FROM public.proposals p WHERE p.landmark_id=l.landmark_id AND p.status='PENDING')) THEN
    RAISE EXCEPTION 'Pending flags are inconsistent';
  END IF;
END $$;
