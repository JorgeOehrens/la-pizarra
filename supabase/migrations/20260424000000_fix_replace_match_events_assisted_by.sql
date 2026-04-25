-- ─────────────────────────────────────────────────────────────
-- Fix: replace_match_events drops assisted_by on every save.
-- The form sends assisted_by per goal event but the previous
-- version of the RPC ignored it, wiping all assists each time
-- a match was edited.
-- ─────────────────────────────────────────────────────────────

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
  v_assisted_by   uuid;
  v_minute        smallint;
BEGIN
  SELECT team_id INTO v_team_id
  FROM public.matches
  WHERE id = p_match_id AND deleted_at IS NULL;

  IF v_team_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = v_team_id
      AND user_id = auth.uid()
      AND status  = 'active'
  ) THEN
    RETURN jsonb_build_object('error', 'not_member');
  END IF;

  DELETE FROM public.match_events WHERE match_id = p_match_id;

  FOR ev IN SELECT * FROM jsonb_array_elements(p_events) LOOP
    v_player_id   := NULLIF(ev->>'player_id', '')::uuid;
    v_assisted_by := NULLIF(ev->>'assisted_by', '')::uuid;
    v_minute      := CASE
      WHEN ev->>'minute' IS NULL OR ev->>'minute' = '' THEN NULL
      ELSE (ev->>'minute')::smallint
    END;

    INSERT INTO public.match_events (
      match_id,
      team_id,
      player_id,
      event_type,
      minute,
      assisted_by,
      created_by
    ) VALUES (
      p_match_id,
      v_team_id,
      v_player_id,
      (ev->>'event_type')::public.event_type,
      v_minute,
      v_assisted_by,
      auth.uid()
    );

    IF (ev->>'event_type') IN ('goal', 'own_goal') THEN
      v_goals_for := v_goals_for + 1;
    ELSIF (ev->>'event_type') = 'opponent_goal' THEN
      v_goals_against := v_goals_against + 1;
    END IF;
  END LOOP;

  UPDATE public.matches
  SET goals_for     = v_goals_for,
      goals_against = v_goals_against
  WHERE id = p_match_id;

  RETURN jsonb_build_object('ok', true, 'goals_for', v_goals_for, 'goals_against', v_goals_against);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
