BEGIN;

CREATE TABLE IF NOT EXISTS public.analytics_visitors (
  visitor_id uuid PRIMARY KEY,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audio_listens (
  listen_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_id uuid NOT NULL REFERENCES public.analytics_visitors(visitor_id) ON DELETE CASCADE,
  landmark_id text NOT NULL REFERENCES public.landmarks(landmark_id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('vi', 'en')),
  listened_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audio_listens_time_idx
  ON public.audio_listens(listened_at DESC);

COMMIT;
