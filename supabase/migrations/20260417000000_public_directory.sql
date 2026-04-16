-- ============================================================
-- Public Team Directory
-- Provides a SECURITY DEFINER function that bypasses RLS
-- to return all teams with computed stats for the public directory.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_public_directory()
RETURNS TABLE (
  id            uuid,
  name          text,
  logo_url      text,
  primary_color text,
  secondary_color text,
  member_count  bigint,
  matches_played bigint,
  wins          bigint,
  draws         bigint,
  losses        bigint,
  goals_for     bigint,
  goals_against bigint
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
  GROUP BY t.id, t.name, t.logo_url, t.primary_color, t.secondary_color
  ORDER BY t.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_directory() TO authenticated;
