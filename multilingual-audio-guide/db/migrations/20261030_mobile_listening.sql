-- M09: bổ sung phiên nghe, nền tảng, thời gian nghe và trạng thái hoàn thành.
BEGIN;

ALTER TABLE public.audio_listens
  ADD COLUMN IF NOT EXISTS session_id uuid UNIQUE,
  ADD COLUMN IF NOT EXISTS platform text
    CHECK (platform IN ('web', 'mobile', 'android', 'ios')),
  ADD COLUMN IF NOT EXISTS listened_seconds double precision
    NOT NULL DEFAULT 0 CHECK (listened_seconds >= 0),
  ADD COLUMN IF NOT EXISTS duration_seconds double precision
    NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  ADD COLUMN IF NOT EXISTS completed boolean
    NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz
    NOT NULL DEFAULT now();

GRANT SELECT, INSERT, UPDATE
ON TABLE public.device_sessions
TO guide_app;

GRANT SELECT, INSERT, UPDATE
ON TABLE public.audio_listens
TO guide_app;

COMMIT;