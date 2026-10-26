BEGIN;
CREATE TABLE IF NOT EXISTS public.device_sessions (
  session_id text PRIMARY KEY,
  visitor_id text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('web', 'mobile')),
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
CREATE INDEX IF NOT EXISTS device_sessions_recent_idx ON public.device_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS device_sessions_visitor_idx ON public.device_sessions(visitor_id);
COMMIT;
