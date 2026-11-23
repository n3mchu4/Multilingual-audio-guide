-- Apply once before restarting the API. Existing admins receive a 24-hour grace period.
-- No password hash is reset by this migration.
BEGIN;
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password_changed_at timestamptz NOT NULL DEFAULT now();
-- User table permissions used by the API are inherited from the existing schema setup.
COMMIT;
