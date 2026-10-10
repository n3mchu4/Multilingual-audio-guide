-- Run as postgres with psql. This file contains psql meta-commands.
-- Do NOT run this whole file in pgAdmin Query Tool.
\set ON_ERROR_STOP on
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'guide_app') THEN
    CREATE ROLE guide_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
  END IF;
END $$;
SELECT 'CREATE DATABASE saigon_audio_guide OWNER postgres ENCODING ''UTF8'''
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'saigon_audio_guide')
\gexec
\echo Set a password for guide_app (type twice; characters are hidden):
\password guide_app
\connect saigon_audio_guide
