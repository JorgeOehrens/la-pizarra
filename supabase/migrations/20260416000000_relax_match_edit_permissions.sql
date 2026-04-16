-- ─────────────────────────────────────────────────────────────
-- Relax match edit permissions: any active team member can
-- update a match or replace its events (not just admins).
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_match(
  p_match_id         uuid,
  p_opponent_name    text,
  p_is_home          boolean,
  p_match_type       public.match_type,
  p_competition_name text,
  p_match_date       timestamptz,
  p_venue_custom     text,
  p_status           public.match_status,
  p_notes            text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_team_id uuid;
BEGIN
  -- Get team and verify match exists
  SELECT team_id INTO v_team_id
  FROM public.matches
  WHERE id = p_match_id AND deleted_at IS NULL;

  IF v_team_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  -- Verify active team membership (any member, not just admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = v_team_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('error', 'not_member');
  END IF;

  UPDATE public.matches SET
    opponent_name    = p_opponent_name,
    is_home          = p_is_home,
    type             = p_match_type,
    competition_name = p_competition_name,
    match_date       = p_match_date,
    venue_custom     = p_venue_custom,
    status           = p_status,
    notes            = p_notes
  WHERE id = p_match_id;

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.replace_match_events(
  p_match_id uuid,
  p_events   jsonb
) RETURNS jsonb AS $$
DECLARE
  v_team_id       uuid;
  v_goals_for     integer := 0;
  v_goals_against integer := 0;
  ev              jsonb;
  v_player_id     uuid;
  v_minute        smallint;
BEGIN
  -- Get team and verify match exists
  SELECT team_id INTO v_team_id
  FROM public.matches
  WHERE id = p_match_id AND deleted_at IS NULL;

  IF v_team_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  -- Verify active team membership (any member, not just admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = v_team_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('error', 'not_member');
  END IF;

  -- Delete all existing events
  DELETE FROM public.match_events WHERE match_id = p_match_id;

  -- Insert new events
  FOR ev IN SELECT * FROM jsonb_array_elements(p_events) LOOP
    -- Parse nullable player_id
    v_player_id := NULLIF(ev->>'player_id', '')::uuid;

    -- Parse nullable minute
    v_minute := CASE
      WHEN ev->>'minute' IS NULL OR ev->>'minute' = '' THEN NULL
      ELSE (ev->>'minute')::smallint
    END;

    INSERT INTO public.match_events (
      match_id,
      team_id,
      player_id,
      event_type,
      minute,
      notes,
      created_by
    ) VALUES (
      p_match_id,
      v_team_id,
      v_player_id,
      (ev->>'event_type')::public.event_type,
      v_minute,
      ev->>'notes',
      auth.uid()
    );

    -- Count for score sync
    IF (ev->>'event_type') IN ('goal', 'own_goal') THEN
      v_goals_for := v_goals_for + 1;
    ELSIF (ev->>'event_type') = 'opponent_goal' THEN
      v_goals_against := v_goals_against + 1;
    END IF;
    -- assist, yellow_card, red_card don't affect score
  END LOOP;

  -- Sync score on match
  UPDATE public.matches
  SET goals_for     = v_goals_for,
      goals_against = v_goals_against
  WHERE id = p_match_id;

  RETURN jsonb_build_object('ok', true, 'goals_for', v_goals_for, 'goals_against', v_goals_against);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
