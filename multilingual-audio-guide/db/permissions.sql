-- Run as postgres, after schema.sql, workflows.sql and pending migrations.
BEGIN;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT CONNECT ON DATABASE saigon_audio_guide TO guide_app;
GRANT USAGE ON SCHEMA public TO guide_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.users, public.landmarks, public.landmark_images, public.proposals,
  public.proposal_images, public.bus_routes, public.bus_stops,
  public.landmark_bus_connections TO guide_app;
GRANT SELECT, INSERT ON public.activity_logs TO guide_app;
GRANT SELECT, INSERT, UPDATE ON public.analytics_visitors TO guide_app;
GRANT SELECT, INSERT ON public.audio_listens TO guide_app;
GRANT SELECT, INSERT, UPDATE ON public.device_sessions TO guide_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO guide_app;
REVOKE ALL ON FUNCTION public.review_proposal(uuid,uuid,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_proposal(uuid,uuid,boolean,text) TO guide_app;
COMMIT;
