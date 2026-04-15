import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { setActiveTeam } from './actions'
import { ChevronRight, Shield } from 'lucide-react'
import Image from 'next/image'

type UserTeam = {
  team_id: string
  team_name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  role: 'admin' | 'player'
  jersey_number: number | null
  player_position: string | null
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  player: 'Jugador',
}

export default async function TeamSelectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: rpcTeams, error: rpcError } = await supabase.rpc('get_user_teams')

  let userTeams: UserTeam[] = (rpcTeams ?? []) as UserTeam[]

  // Fallback: if RPC failed or returned empty, query team_members directly
  if (rpcError || userTeams.length === 0) {
    const { data: directMemberships } = await supabase
      .from('team_members')
      .select('team_id, role, jersey_number, position, teams(id, name, logo_url, primary_color, secondary_color)')
      .eq('user_id', user.id)
      .eq('status', 'active')

    userTeams = (directMemberships ?? []).map((m) => {
      const t = m.teams as unknown as { id: string; name: string; logo_url: string | null; primary_color: string; secondary_color: string } | null
      return {
        team_id: m.team_id,
        team_name: t?.name ?? '',
        logo_url: t?.logo_url ?? null,
        primary_color: t?.primary_color ?? '#D7FF00',
        secondary_color: t?.secondary_color ?? '#000000',
        role: m.role as 'admin' | 'player',
        jersey_number: m.jersey_number,
        player_position: m.position,
      }
    })
  }

  // No teams → go to onboarding
  if (userTeams.length === 0) {
    redirect('/onboarding')
  }

  // Single team → auto-select and go to home
  if (userTeams.length === 1) {
    await setActiveTeam(userTeams[0].team_id)
    redirect('/home')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 bg-accent/15 rounded-2xl flex items-center justify-center mb-5">
            <Shield className="h-7 w-7 text-accent" />
          </div>
          <h1 className="font-display text-3xl uppercase tracking-tight mb-2">
            ¿Con qué equipo entras hoy?
          </h1>
          <p className="text-muted-foreground text-sm">
            Estás en {userTeams.length} equipos. Selecciona el equipo activo.
          </p>
        </div>

        {/* Team list */}
        <div className="space-y-3">
          {userTeams.map((team) => (
            <form key={team.team_id} action={setActiveTeam.bind(null, team.team_id)}>
              <button
                type="submit"
                className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left border border-transparent hover:border-accent/30"
              >
                {/* Logo */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ backgroundColor: team.primary_color || '#D7FF00' }}
                >
                  {team.logo_url ? (
                    <Image
                      src={team.logo_url}
                      alt={team.team_name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span
                      className="font-display text-2xl"
                      style={{ color: team.secondary_color || '#000' }}
                    >
                      {team.team_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xl leading-tight truncate mb-0.5">
                    {team.team_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABEL[team.role] ?? team.role}
                    {team.jersey_number != null && ` · #${team.jersey_number}`}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  )
}
