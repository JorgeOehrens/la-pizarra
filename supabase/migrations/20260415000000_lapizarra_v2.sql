-- ============================================================
-- LaPizarra v2 — Migration
-- Features: multi-team, email login, match editing, smart events,
--           upcoming/played logic, yellow/red cards in stats
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES — add active_team_id and email
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email text;

-- Unique index allows nulls (multiple users can have null email)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx
  ON public.profiles(email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_email_idx
  ON public.profiles(email)
  WHERE email IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 2. EVENT TYPE — add opponent_goal
-- ─────────────────────────────────────────────────────────────

ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'opponent_goal';

-- ─────────────────────────────────────────────────────────────
-- 3. MATCH EVENTS — make player_id nullable
--    (needed for rival events: opponent_goal, rival cards)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.match_events
  ALTER COLUMN player_id DROP NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 4. UPDATE handle_new_user TRIGGER
--    Copy real_email from auth metadata → profiles.email
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTR(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NULL),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'real_email', '')), '')
  )
  ON CONFLICT (id) DO UPDATE
    SET username     = EXCLUDED.username,
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        email        = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 5. RPC: set_active_team
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_active_team(p_team_id uuid)
RETURNS void AS $$
BEGIN
  -- Validate user is an active member of the requested team
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  UPDATE public.profiles
  SET active_team_id = p_team_id
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 6. RPC: get_user_teams
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_teams()
RETURNS TABLE (
  team_id        uuid,
  team_name      text,
  team_logo_url  text,
  team_primary_color  text,
  team_secondary_color text,
  role           public.team_role,
  jersey_number  smallint,
  member_count   bigint,
  is_active      boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.logo_url,
    t.primary_color,
    t.secondary_color,
    tm.role,
    tm.jersey_number,
    (
      SELECT COUNT(*)::bigint
      FROM public.team_members tm2
      WHERE tm2.team_id = t.id
        AND tm2.status = 'active'
        AND tm2.deleted_at IS NULL
    ) AS member_count,
    (p.active_team_id = t.id) AS is_active
  FROM public.team_members tm
  JOIN public.teams t ON t.id = tm.team_id
  JOIN public.profiles p ON p.id = auth.uid()
  WHERE tm.user_id = auth.uid()
    AND tm.status = 'active'
    AND t.deleted_at IS NULL
    AND tm.deleted_at IS NULL
  ORDER BY (p.active_team_id = t.id) DESC, t.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────
-- 7. RPC: update_match
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

  -- Verify admin
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = v_team_id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('error', 'not_admin');
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

-- ─────────────────────────────────────────────────────────────
-- 8. RPC: replace_match_events
--    Replaces all events for a match and syncs the score.
--    Events array format per item:
--      { event_type, player_id (nullable), minute (nullable), notes (nullable) }
--    Assists are separate entries with event_type='assist'.
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
  v_minute        smallint;
BEGIN
  -- Get team and verify match exists
  SELECT team_id INTO v_team_id
  FROM public.matches
  WHERE id = p_match_id AND deleted_at IS NULL;

  IF v_team_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  -- Verify admin
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = v_team_id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('error', 'not_admin');
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

-- ─────────────────────────────────────────────────────────────
-- 9. RECREATE player_stats VIEW
--    Adds yellow_cards, red_cards.
--    Goals and assists now also filtered by status='finished'.
-- ─────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS public.player_stats;

CREATE OR REPLACE VIEW public.player_stats AS
SELECT
  tm.user_id   AS player_id,
  tm.team_id,

  -- Partidos jugados (solo partidos finished)
  COALESCE((
    SELECT COUNT(DISTINCT me.match_id)
    FROM public.match_events me
    JOIN public.matches m ON m.id = me.match_id
    WHERE me.player_id = tm.user_id
      AND me.team_id   = tm.team_id
      AND me.event_type NOT IN ('opponent_goal')
      AND m.status      = 'finished'
      AND m.deleted_at  IS NULL
  ), 0)
  + COALESCE((
    SELECT SUM(delta)
    FROM public.manual_stat_adjustments
    WHERE player_id = tm.user_id
      AND team_id   = tm.team_id
      AND stat_type = 'matches_played'
  ), 0) AS matches_played,

  -- Goles (solo partidos finished)
  COALESCE((
    SELECT COUNT(*)
    FROM public.match_events me
    JOIN public.matches m ON m.id = me.match_id
    WHERE me.player_id = tm.user_id
      AND me.team_id   = tm.team_id
      AND me.event_type = 'goal'
      AND m.status      = 'finished'
      AND m.deleted_at  IS NULL
  ), 0)
  + COALESCE((
    SELECT SUM(delta)
    FROM public.manual_stat_adjustments
    WHERE player_id = tm.user_id
      AND team_id   = tm.team_id
      AND stat_type = 'goals'
  ), 0) AS goals,

  -- Asistencias (solo partidos finished)
  COALESCE((
    SELECT COUNT(*)
    FROM public.match_events me
    JOIN public.matches m ON m.id = me.match_id
    WHERE me.player_id = tm.user_id
      AND me.team_id   = tm.team_id
      AND me.event_type = 'assist'
      AND m.status      = 'finished'
      AND m.deleted_at  IS NULL
  ), 0)
  + COALESCE((
    SELECT SUM(delta)
    FROM public.manual_stat_adjustments
    WHERE player_id = tm.user_id
      AND team_id   = tm.team_id
      AND stat_type = 'assists'
  ), 0) AS assists,

  -- Autogoles (solo partidos finished)
  COALESCE((
    SELECT COUNT(*)
    FROM public.match_events me
    JOIN public.matches m ON m.id = me.match_id
    WHERE me.player_id = tm.user_id
      AND me.team_id   = tm.team_id
      AND me.event_type = 'own_goal'
      AND m.status      = 'finished'
      AND m.deleted_at  IS NULL
  ), 0) AS own_goals,

  -- Tarjetas amarillas (solo partidos finished)
  COALESCE((
    SELECT COUNT(*)
    FROM public.match_events me
    JOIN public.matches m ON m.id = me.match_id
    WHERE me.player_id = tm.user_id
      AND me.team_id   = tm.team_id
      AND me.event_type = 'yellow_card'
      AND m.status      = 'finished'
      AND m.deleted_at  IS NULL
  ), 0) AS yellow_cards,

  -- Tarjetas rojas (solo partidos finished)
  COALESCE((
    SELECT COUNT(*)
    FROM public.match_events me
    JOIN public.matches m ON m.id = me.match_id
    WHERE me.player_id = tm.user_id
      AND me.team_id   = tm.team_id
      AND me.event_type = 'red_card'
      AND m.status      = 'finished'
      AND m.deleted_at  IS NULL
  ), 0) AS red_cards

FROM public.team_members tm
WHERE tm.status = 'active'
  AND tm.deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 10. UPDATE create_match_with_events RPC
--     Extend to handle all event types including opponent_goal,
--     yellow_card, red_card with nullable player_id.
--     goals_against now computed from opponent_goal events
--     (p_goals_against kept as fallback for backward compat).
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_match_with_events(
  p_team_id          uuid,
  p_opponent_name    text,
  p_is_home          boolean,
  p_match_type       public.match_type,
  p_competition_name text,
  p_match_date       timestamptz,
  p_venue_custom     text,
  p_goals_against    integer,
  p_events           jsonb
) RETURNS jsonb AS $$
DECLARE
  v_match_id      uuid;
  v_goals_for     integer := 0;
  v_goals_against integer := 0;
  ev              jsonb;
  v_player_id     uuid;
  v_minute        smallint;
BEGIN
  -- Auth check
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  -- Admin check
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND role    = 'admin'
      AND status  = 'active'
  ) THEN
    RETURN jsonb_build_object('error', 'not_admin');
  END IF;

  -- Count scores from events
  FOR ev IN SELECT * FROM jsonb_array_elements(p_events) LOOP
    IF (ev->>'type') IN ('goal', 'own_goal') THEN
      v_goals_for := v_goals_for + 1;
    ELSIF (ev->>'type') = 'opponent_goal' THEN
      v_goals_against := v_goals_against + 1;
    END IF;
  END LOOP;

  -- If no opponent_goal events provided, fall back to p_goals_against
  IF v_goals_against = 0 THEN
    v_goals_against := COALESCE(p_goals_against, 0);
  END IF;

  -- Insert match
  INSERT INTO public.matches (
    team_id, opponent_name, is_home, type, competition_name,
    match_date, venue_custom, status,
    goals_for, goals_against, created_by
  ) VALUES (
    p_team_id, p_opponent_name, p_is_home, p_match_type, p_competition_name,
    p_match_date, p_venue_custom,
    CASE WHEN p_match_date <= NOW() THEN 'finished'::public.match_status
         ELSE 'scheduled'::public.match_status
    END,
    v_goals_for, v_goals_against, auth.uid()
  )
  RETURNING id INTO v_match_id;

  -- Insert events
  FOR ev IN SELECT * FROM jsonb_array_elements(p_events) LOOP
    v_player_id := NULLIF(ev->>'player_id', '')::uuid;
    v_minute    := CASE
      WHEN ev->>'minute' IS NULL OR ev->>'minute' = '' THEN NULL
      ELSE (ev->>'minute')::smallint
    END;

    INSERT INTO public.match_events (
      match_id, team_id, player_id, event_type, minute, notes, created_by
    ) VALUES (
      v_match_id,
      p_team_id,
      v_player_id,
      CASE ev->>'type'
        WHEN 'goal'          THEN 'goal'::public.event_type
        WHEN 'own_goal'      THEN 'own_goal'::public.event_type
        WHEN 'opponent_goal' THEN 'opponent_goal'::public.event_type
        WHEN 'assist'        THEN 'assist'::public.event_type
        WHEN 'yellow_card'   THEN 'yellow_card'::public.event_type
        WHEN 'red_card'      THEN 'red_card'::public.event_type
        ELSE 'goal'::public.event_type
      END,
      v_minute,
      ev->>'notes',
      auth.uid()
    );
  END LOOP;

  RETURN jsonb_build_object('match_id', v_match_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
