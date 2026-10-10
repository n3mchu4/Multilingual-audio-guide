-- Based on section 5 / entity table of baocao_English.docx.
-- PostgreSQL 17; SQL names use lower_case (unquoted).
-- Initial schema only. Changes to existing tables belong in migrations/.
BEGIN;
CREATE TABLE IF NOT EXISTS public.landmarks (
  landmark_id text PRIMARY KEY CHECK (landmark_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_vi text NOT NULL CHECK (btrim(title_vi) <> ''),
  title_en text NOT NULL CHECK (btrim(title_en) <> ''),
  subtitle_vi text NOT NULL DEFAULT '',
  subtitle_en text NOT NULL DEFAULT '',
  latitude numeric(9,6) CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric(9,6) CHECK (longitude BETWEEN -180 AND 180),
  background_image_url text,
  description_vi text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  transcript_vi text NOT NULL DEFAULT '',
  transcript_en text NOT NULL DEFAULT '',
  audio_vi_url text,
  audio_en_url text,
  has_pending_request boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((latitude IS NULL) = (longitude IS NULL)),
  CHECK (background_image_url IS NULL OR btrim(background_image_url) <> ''),
  CHECK (audio_vi_url IS NULL OR btrim(audio_vi_url) <> ''),
  CHECK (audio_en_url IS NULL OR btrim(audio_en_url) <> '')
);
CREATE TABLE IF NOT EXISTS public.users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE CHECK (username = lower(btrim(username)) AND username <> ''),
  password_hash text NOT NULL CHECK (password_hash ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'),
  role text NOT NULL CHECK (role IN ('ADMIN', 'MANAGER')),
  is_active boolean NOT NULL DEFAULT true,
  is_super_admin boolean NOT NULL DEFAULT false,
  landmark_id text REFERENCES public.landmarks(landmark_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((role = 'ADMIN' AND landmark_id IS NULL) OR
         (role = 'MANAGER' AND landmark_id IS NOT NULL)),
  CHECK (NOT is_super_admin OR (role = 'ADMIN' AND is_active))
);
CREATE INDEX IF NOT EXISTS users_landmark_idx ON public.users(landmark_id);
CREATE TABLE IF NOT EXISTS public.landmark_images (
  image_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landmark_id text NOT NULL REFERENCES public.landmarks(landmark_id) ON DELETE CASCADE,
  image_url text NOT NULL CHECK (btrim(image_url) <> ''),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  UNIQUE (landmark_id, image_url)
);
CREATE INDEX IF NOT EXISTS landmark_images_order_idx ON public.landmark_images(landmark_id, sort_order);
CREATE TABLE IF NOT EXISTS public.proposals (
  proposal_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landmark_id text NOT NULL REFERENCES public.landmarks(landmark_id) ON DELETE RESTRICT,
  manager_id uuid NOT NULL REFERENCES public.users(user_id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  -- Full proposed snapshot, not a partial patch; blank text means intentionally blank.
  proposed_title_vi text NOT NULL CHECK (btrim(proposed_title_vi) <> ''),
  proposed_title_en text NOT NULL CHECK (btrim(proposed_title_en) <> ''),
  proposed_subtitle_vi text NOT NULL DEFAULT '',
  proposed_subtitle_en text NOT NULL DEFAULT '',
  proposed_latitude numeric(9,6) CHECK (proposed_latitude BETWEEN -90 AND 90),
  proposed_longitude numeric(9,6) CHECK (proposed_longitude BETWEEN -180 AND 180),
  proposed_background_image_url text,
  proposed_description_vi text NOT NULL DEFAULT '',
  proposed_description_en text NOT NULL DEFAULT '',
  proposed_transcript_vi text NOT NULL DEFAULT '',
  proposed_transcript_en text NOT NULL DEFAULT '',
  proposed_audio_vi_url text,
  proposed_audio_en_url text,
  review_note text,
  reviewed_by uuid REFERENCES public.users(user_id) ON DELETE RESTRICT,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  CHECK ((proposed_latitude IS NULL) = (proposed_longitude IS NULL)),
  CHECK (proposed_background_image_url IS NULL OR btrim(proposed_background_image_url) <> ''),
  CHECK (proposed_audio_vi_url IS NULL OR btrim(proposed_audio_vi_url) <> ''),
  CHECK (proposed_audio_en_url IS NULL OR btrim(proposed_audio_en_url) <> ''),
  CHECK ((status = 'PENDING' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR
         (status IN ('ACCEPTED', 'REJECTED') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS proposals_landmark_status_idx ON public.proposals(landmark_id, status);
CREATE INDEX IF NOT EXISTS proposals_manager_time_idx ON public.proposals(manager_id, submitted_at DESC);
CREATE TABLE IF NOT EXISTS public.proposal_images (
  proposal_image_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(proposal_id) ON DELETE CASCADE,
  image_url text NOT NULL CHECK (btrim(image_url) <> ''),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  UNIQUE (proposal_id, image_url)
);
CREATE TABLE IF NOT EXISTS public.bus_routes (
  route_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number text NOT NULL UNIQUE CHECK (btrim(route_number) <> '')
);
CREATE TABLE IF NOT EXISTS public.bus_stops (
  stop_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_name text NOT NULL CHECK (btrim(stop_name) <> ''),
  latitude numeric(9,6) CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric(9,6) CHECK (longitude BETWEEN -180 AND 180),
  CHECK ((latitude IS NULL) = (longitude IS NULL))
);
CREATE TABLE IF NOT EXISTS public.landmark_bus_connections (
  connection_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landmark_id text NOT NULL REFERENCES public.landmarks(landmark_id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES public.bus_routes(route_id) ON DELETE RESTRICT,
  stop_id uuid NOT NULL REFERENCES public.bus_stops(stop_id) ON DELETE RESTRICT,
  UNIQUE (landmark_id, route_id, stop_id)
);
CREATE INDEX IF NOT EXISTS connections_route_idx ON public.landmark_bus_connections(route_id);
CREATE INDEX IF NOT EXISTS connections_stop_idx ON public.landmark_bus_connections(stop_id);
CREATE TABLE IF NOT EXISTS public.activity_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(user_id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (btrim(action_type) <> ''),
  target_type text NOT NULL CHECK (btrim(target_type) <> ''),
  target_id text,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS logs_time_idx ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS logs_user_idx ON public.activity_logs(user_id);

CREATE OR REPLACE FUNCTION public.touch_landmark() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS landmarks_touch ON public.landmarks;
CREATE TRIGGER landmarks_touch BEFORE UPDATE ON public.landmarks
  FOR EACH ROW EXECUTE FUNCTION public.touch_landmark();

CREATE OR REPLACE FUNCTION public.protect_super_admin() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_super_admin THEN
    IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Cannot delete the super admin'; END IF;
    IF NOT NEW.is_super_admin OR NOT NEW.is_active OR NEW.role <> 'ADMIN' THEN
      RAISE EXCEPTION 'Cannot deactivate or demote the super admin';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS users_protect_super_admin ON public.users;
CREATE TRIGGER users_protect_super_admin BEFORE UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_super_admin();

CREATE OR REPLACE FUNCTION public.validate_proposal_actor() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE manager public.users%ROWTYPE; reviewer public.users%ROWTYPE;
BEGIN
  -- Validate active manager on submission/edit of the proposed snapshot.
  -- Reviewing an old proposal is allowed even if that manager was later deactivated.
  IF TG_OP = 'INSERT' OR NEW.status = 'PENDING' THEN
    SELECT * INTO manager FROM public.users WHERE user_id = NEW.manager_id;
    IF NOT FOUND OR manager.role <> 'MANAGER' OR NOT manager.is_active
       OR manager.landmark_id IS DISTINCT FROM NEW.landmark_id THEN
      RAISE EXCEPTION 'Proposal requires an active manager assigned to this landmark';
    END IF;
  END IF;
  IF NEW.reviewed_by IS NOT NULL THEN
    SELECT * INTO reviewer FROM public.users WHERE user_id = NEW.reviewed_by;
    IF NOT FOUND OR reviewer.role <> 'ADMIN' OR NOT reviewer.is_active THEN
      RAISE EXCEPTION 'Reviewer must be an active ADMIN';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS proposals_validate_actor ON public.proposals;
CREATE TRIGGER proposals_validate_actor BEFORE INSERT OR UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.validate_proposal_actor();

CREATE OR REPLACE FUNCTION public.refresh_pending_flag() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE affected_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN affected_id := OLD.landmark_id;
  ELSE affected_id := NEW.landmark_id; END IF;
  -- Serialize flag updates on the same landmark.
  PERFORM 1 FROM public.landmarks WHERE landmark_id = affected_id FOR UPDATE;
  UPDATE public.landmarks SET has_pending_request = EXISTS (
    SELECT 1 FROM public.proposals WHERE landmark_id = affected_id AND status = 'PENDING'
  ) WHERE landmark_id = affected_id;
  IF TG_OP = 'UPDATE' AND OLD.landmark_id IS DISTINCT FROM NEW.landmark_id THEN
    PERFORM 1 FROM public.landmarks WHERE landmark_id = OLD.landmark_id FOR UPDATE;
    UPDATE public.landmarks SET has_pending_request = EXISTS (
      SELECT 1 FROM public.proposals WHERE landmark_id = OLD.landmark_id AND status = 'PENDING'
    ) WHERE landmark_id = OLD.landmark_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS proposals_refresh_pending ON public.proposals;
CREATE TRIGGER proposals_refresh_pending AFTER INSERT OR UPDATE OR DELETE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.refresh_pending_flag();
COMMIT;
