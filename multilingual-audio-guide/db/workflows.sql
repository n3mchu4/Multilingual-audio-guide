-- Atomic approval/rejection helper. The API must derive p_admin_id from the
-- authenticated session, never trust a user_id passed by an untrusted client.
-- SECURITY INVOKER: uses the application role's permissions.
BEGIN;
CREATE OR REPLACE FUNCTION public.review_proposal(
  p_proposal_id uuid, p_admin_id uuid, p_accept boolean, p_note text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE p public.proposals%ROWTYPE; l public.landmarks%ROWTYPE; target_landmark text;
BEGIN
  IF p_accept IS NULL THEN RAISE EXCEPTION 'Decision is required'; END IF;
  PERFORM 1 FROM public.users WHERE user_id = p_admin_id AND role = 'ADMIN' AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active admin required'; END IF;
  SELECT landmark_id INTO target_landmark FROM public.proposals WHERE proposal_id = p_proposal_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proposal not found'; END IF;
  SELECT * INTO l FROM public.landmarks WHERE landmark_id = target_landmark FOR UPDATE;
  SELECT * INTO p FROM public.proposals WHERE proposal_id = p_proposal_id FOR UPDATE;
  IF NOT FOUND OR p.status <> 'PENDING' THEN RAISE EXCEPTION 'Proposal is no longer pending'; END IF;
  IF p.landmark_id IS DISTINCT FROM target_landmark THEN RAISE EXCEPTION 'Proposal landmark changed; retry'; END IF;
  IF p_accept THEN
    IF (p.proposed_transcript_vi IS DISTINCT FROM l.transcript_vi OR
        p.proposed_transcript_en IS DISTINCT FROM l.transcript_en) AND
       (p.proposed_audio_vi_url IS NULL OR p.proposed_audio_en_url IS NULL) THEN
      RAISE EXCEPTION 'Changing transcript requires both VI and EN audio references';
    END IF;
    UPDATE public.landmarks SET
      title_vi = p.proposed_title_vi, title_en = p.proposed_title_en,
      subtitle_vi = p.proposed_subtitle_vi, subtitle_en = p.proposed_subtitle_en,
      latitude = p.proposed_latitude, longitude = p.proposed_longitude,
      background_image_url = p.proposed_background_image_url,
      description_vi = p.proposed_description_vi, description_en = p.proposed_description_en,
      transcript_vi = p.proposed_transcript_vi, transcript_en = p.proposed_transcript_en,
      audio_vi_url = p.proposed_audio_vi_url, audio_en_url = p.proposed_audio_en_url
    WHERE landmark_id = p.landmark_id;
    -- proposal_images is the FULL replacement gallery; empty means remove gallery.
    DELETE FROM public.landmark_images WHERE landmark_id = p.landmark_id;
    INSERT INTO public.landmark_images(landmark_id, image_url, sort_order)
      SELECT p.landmark_id, image_url, sort_order FROM public.proposal_images
      WHERE proposal_id = p.proposal_id;
  END IF;
  UPDATE public.proposals SET
    status = CASE WHEN p_accept THEN 'ACCEPTED' ELSE 'REJECTED' END,
    reviewed_by = p_admin_id, reviewed_at = now(), review_note = p_note
  WHERE proposal_id = p.proposal_id;
  INSERT INTO public.activity_logs(user_id, action_type, target_type, target_id, description)
  VALUES (p_admin_id, CASE WHEN p_accept THEN 'ACCEPT_PROPOSAL' ELSE 'REJECT_PROPOSAL' END,
          'PROPOSAL', p.proposal_id::text, coalesce(p_note, ''));
END $$;
COMMIT;
