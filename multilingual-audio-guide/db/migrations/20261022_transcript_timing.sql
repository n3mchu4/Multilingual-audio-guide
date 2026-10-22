-- Apply once to existing installations; safe to rerun.
BEGIN;
ALTER TABLE public.landmarks
  ADD COLUMN IF NOT EXISTS transcript_cues_vi jsonb NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(transcript_cues_vi) = 'array'),
  ADD COLUMN IF NOT EXISTS transcript_cues_en jsonb NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(transcript_cues_en) = 'array');

-- Timings belong to a specific transcript AND audio asset.
CREATE OR REPLACE FUNCTION public.invalidate_transcript_cues()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.transcript_vi IS DISTINCT FROM OLD.transcript_vi
     OR NEW.audio_vi_url IS DISTINCT FROM OLD.audio_vi_url THEN
    NEW.transcript_cues_vi = '[]'::jsonb;
  END IF;
  IF NEW.transcript_en IS DISTINCT FROM OLD.transcript_en
     OR NEW.audio_en_url IS DISTINCT FROM OLD.audio_en_url THEN
    NEW.transcript_cues_en = '[]'::jsonb;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS landmarks_invalidate_cues ON public.landmarks;
CREATE TRIGGER landmarks_invalidate_cues BEFORE UPDATE ON public.landmarks
  FOR EACH ROW EXECUTE FUNCTION public.invalidate_transcript_cues();
COMMIT;
