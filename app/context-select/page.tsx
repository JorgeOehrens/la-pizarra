import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronRight, Plus, Shield, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { features } from '@/lib/features'
import { pickTeam, pickLeague } from './actions'

type ContextPayload = {
  leagues: Array<{
    id: string
    name: string
    slug: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
    role: string
    is_active: boolean
  }>
  teams: Array<{
    id: string
    name: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
    role: string
    jersey_number: number | null
    position: string | null
    is_active: boolean
  }>
  active_league_id: string | null
  active_team_id: string | null
}

const LEAGUE_ROLE_LABEL: Record<string, string> = {
  league_owner: 'Dueña/o de liga',
  league_admin: 'Admin de liga',
  league_referee: 'Árbitro',
  league_viewer: 'Observador',
}

const TEAM_ROLE_LABEL: Record<string, string> = {
  team_manager: 'Manager',
  admin: 'Manager',
  coach: 'Coach',
  captain: 'Capitán',
  player: 'Jugador',
  team_viewer: 'Observador',
}

export default async function ContextSelectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // If leagues feature is disabled, behave like /team-select.
  if (!features.leagues) {
    redirect('/team-select')
  }

  const { data: rpc } = await supabase.rpc('get_user_contexts')
  const ctx = (rpc ?? { leagues: [], teams: [], active_league_id: null, active_team_id: null }) as ContextPayload

  // No memberships → onboarding hub.
  if (ctx.leagues.length === 0 && ctx.teams.length === 0) {
    redirect('/onboarding')
  }

  // Single team and zero leagues → mimic legacy /team-select auto-select.
  if (ctx.leagues.length === 0 && ctx.teams.length === 1) {
    await supabase.rpc('set_active_context', {
      p_league_id: null,
      p_team_id: ctx.teams[0].id,
    })
    redirect('/home')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-12 max-w-lg mx-auto w-full">
        <div className="mb-8">
          <div className="w-14 h-14 bg-accent/15 rounded-2xl flex items-center justify-center mb-5">
            <Shield className="h-7 w-7 text-accent" />
          </div>
          <h1 className="font-display text-3xl uppercase tracking-tight mb-2">
            ¿Con qué contexto entrás hoy?
          </h1>
          <p className="text-muted-foreground text-sm">
            Elegí una liga o un equipo para activarlo.
          </p>
        </div>

        {ctx.leagues.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
              Tus ligas
            </h2>
            <div className="space-y-3">
              {ctx.leagues.map((l) => (
                <form key={l.id} action={pickLeague.bind(null, l.id)}>
                  <button
                    type="submit"
                    className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left border border-transparent hover:border-accent/30"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ backgroundColor: l.primary_color || '#D7FF00' }}
                    >
                      {l.logo_url ? (
                        <Image
                          src={l.logo_url}
                          alt={l.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy className="h-6 w-6" style={{ color: l.secondary_color || '#000' }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xl leading-tight truncate mb-0.5">
                        {l.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {LEAGUE_ROLE_LABEL[l.role] ?? l.role}
                        {l.is_active && ' · activa'}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                </form>
              ))}
            </div>
          </section>
        )}

        {ctx.teams.length > 0 && (
          <section className="mb-6">
            <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
              Tus equipos
            </h2>
            <div className="space-y-3">
              {ctx.teams.map((t) => (
                <form key={t.id} action={pickTeam.bind(null, t.id)}>
                  <button
                    type="submit"
                    className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left border border-transparent hover:border-accent/30"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ backgroundColor: t.primary_color || '#D7FF00' }}
                    >
                      {t.logo_url ? (
                        <Image
                          src={t.logo_url}
                          alt={t.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="font-display text-2xl"
                          style={{ color: t.secondary_color || '#000' }}
                        >
                          {t.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xl leading-tight truncate mb-0.5">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {TEAM_ROLE_LABEL[t.role] ?? t.role}
                        {t.jersey_number != null && ` · #${t.jersey_number}`}
                        {t.is_active && ' · activo'}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                </form>
              ))}
            </div>
          </section>
        )}

        {/* CTA to create a league */}
        <Link
          href="/onboarding/create-league"
          className="flex items-center gap-3 bg-card rounded-2xl p-4 border border-dashed border-border/60 hover:border-accent/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <Plus className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Crear nueva liga</p>
            <p className="text-xs text-muted-foreground">
              Organizar torneo o liga amateur con varios equipos
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
