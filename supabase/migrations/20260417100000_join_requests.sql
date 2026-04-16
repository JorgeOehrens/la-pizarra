-- ============================================================
-- Join Requests — acceso controlado por equipo
-- ============================================================

-- 1. join_mode en teams
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS join_mode text NOT NULL DEFAULT 'invite_only'
  CHECK (join_mode IN ('open', 'request', 'invite_only'));

-- 2. Tabla join_requests
CREATE TABLE IF NOT EXISTS public.join_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid NOT NULL REFERENCES public.teams(id)    ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS join_requests_team_id_idx ON public.join_requests(team_id);
CREATE INDEX IF NOT EXISTS join_requests_user_id_idx ON public.join_requests(user_id);
CREATE INDEX IF NOT EXISTS join_requests_status_idx  ON public.join_requests(status);

-- updated_at trigger
CREATE TRIGGER set_join_requests_updated_at
  BEFORE UPDATE ON public.join_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. RLS
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- Users see their own requests
CREATE POLICY "Users see own join requests"
  ON public.join_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins see all requests for their team
CREATE POLICY "Admins see team join requests"
  ON public.join_requests FOR SELECT TO authenticated
  USING (public.is_team_admin(team_id));

-- Users can submit a request
CREATE POLICY "Users can create join requests"
  ON public.join_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can approve or reject
CREATE POLICY "Admins can review join requests"
  ON public.join_requests FOR UPDATE TO authenticated
  USING (public.is_team_admin(team_id));

-- 4. Update get_public_directory to include join_mode
CREATE OR REPLACE FUNCTION public.get_public_directory()
RETURNS TABLE (
  id              uuid,
  name            text,
  logo_url        text,
  primary_color   text,
  secondary_color text,
  join_mode       text,
  member_count    bigint,
  matches_played  bigint,
  wins            bigint,
  draws           bigint,
  losses          bigint,
  goals_for       bigint,
  goals_against   bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    t.id,
    t.name,
    t.logo_url,
    t.primary_color,
    t.secondary_color,
    t.join_mode,
    COUNT(DISTINCT CASE WHEN tm.status = 'active' THEN tm.user_id END)                              AS member_count,
    COUNT(DISTINCT CASE WHEN m.status = 'finished' AND m.deleted_at IS NULL THEN m.id END)          AS matches_played,
    COUNT(DISTINCT CASE WHEN m.status = 'finished' AND m.goals_for  > m.goals_against THEN m.id END) AS wins,
    COUNT(DISTINCT CASE WHEN m.status = 'finished' AND m.goals_for  = m.goals_against THEN m.id END) AS draws,
    COUNT(DISTINCT CASE WHEN m.status = 'finished' AND m.goals_for  < m.goals_against THEN m.id END) AS losses,
    COALESCE(SUM(CASE WHEN m.status = 'finished' AND m.deleted_at IS NULL THEN m.goals_for  ELSE 0 END), 0) AS goals_for,
    COALESCE(SUM(CASE WHEN m.status = 'finished' AND m.deleted_at IS NULL THEN m.goals_against ELSE 0 END), 0) AS goals_against
  FROM public.teams t
  LEFT JOIN public.team_members tm ON tm.team_id = t.id
  LEFT JOIN public.matches m       ON m.team_id  = t.id
  WHERE t.deleted_at IS NULL
  GROUP BY t.id, t.name, t.logo_url, t.primary_color, t.secondary_color, t.join_mode
  ORDER BY t.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_directory() TO authenticated;
