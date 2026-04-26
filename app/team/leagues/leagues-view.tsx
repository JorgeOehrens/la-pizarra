'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, LogOut, Search, Send, Trophy } from 'lucide-react'
import {
  acceptLeagueInvitation,
  withdrawFromLeague,
  requestToJoinLeague,
} from './actions'

type League = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

type Participation = {
  id: string
  status: 'pending' | 'active'
  league: League | null
}

type DiscoverLeague = League & {
  visibility: 'public' | 'unlisted' | 'private'
  join_mode: 'open' | 'request' | 'invite_only'
}

export function LeaguesView({
  teamId,
  participations: initialParticipations,
  discoverable,
  isAdmin,
}: {
  teamId: string
  participations: Participation[]
  discoverable: DiscoverLeague[]
  isAdmin: boolean
}) {
  const [participations, setParticipations] = useState(initialParticipations)
  const [requested, setRequested] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [, startTransition] = useTransition()

  const filteredDiscover = query
    ? discoverable.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()))
    : discoverable

  const pending = participations.filter((p) => p.status === 'pending')
  const active = participations.filter((p) => p.status === 'active')

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Invitaciones pendientes ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((p) => (
              <div
                key={p.id}
                className="bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3"
              >
                <LeagueAvatar league={p.league} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.league?.name ?? 'Liga'}</p>
                  <p className="text-xs text-muted-foreground">Te invitaron a participar</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setError(null)
                      startTransition(async () => {
                        const res = await acceptLeagueInvitation(p.id)
                        if ('ok' in res) {
                          setParticipations((q) =>
                            q.map((x) => (x.id === p.id ? { ...x, status: 'active' as const } : x)),
                          )
                        } else {
                          setError(res.error)
                        }
                      })
                    }}
                    className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aceptar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Ligas activas ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="bg-card rounded-xl p-6 text-center border border-border/40">
            <Trophy className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Tu equipo no participa en ninguna liga.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((p) => (
              <div key={p.id} className="bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3">
                <LeagueAvatar league={p.league} />
                <Link
                  href={p.league ? `/team/leagues/${p.league.slug}` : '#'}
                  className="flex-1 min-w-0 hover:opacity-80"
                >
                  <p className="font-medium text-sm truncate">{p.league?.name ?? 'Liga'}</p>
                  <p className="text-xs text-muted-foreground">Ver mis partidos →</p>
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (!confirm('¿Salir de la liga?')) return
                      setError(null)
                      startTransition(async () => {
                        const res = await withdrawFromLeague(p.id)
                        if ('ok' in res) {
                          setParticipations((q) => q.filter((x) => x.id !== p.id))
                        } else {
                          setError(res.error)
                        }
                      })
                    }}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                    title="Salir de la liga"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {isAdmin && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Descubrir ligas
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Pedile unirte a ligas públicas o no listadas que aceptan solicitudes.
          </p>

          <div className="relative mb-3">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ligas…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-3 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {filteredDiscover.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay ligas para mostrar.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredDiscover.map((l) => {
                const wasRequested = requested.has(l.id)
                const canRequest = l.join_mode !== 'invite_only'
                return (
                  <div
                    key={l.id}
                    className="bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3"
                  >
                    <LeagueAvatar league={l} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{l.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {l.join_mode === 'open' ? 'Abierta' : l.join_mode === 'request' ? 'Por solicitud' : 'Solo invitación'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (!canRequest || wasRequested) return
                        setError(null)
                        startTransition(async () => {
                          const res = await requestToJoinLeague(l.id, teamId)
                          if ('ok' in res) {
                            setRequested((p) => new Set(p).add(l.id))
                          } else {
                            setError(res.error)
                          }
                        })
                      }}
                      disabled={!canRequest || wasRequested}
                      className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {wasRequested ? 'Enviado' : canRequest ? 'Solicitar' : 'Cerrada'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function LeagueAvatar({ league }: { league: League | null }) {
  if (!league) return <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
  return league.logo_url ? (
    <Image
      src={league.logo_url}
      alt={league.name}
      width={40}
      height={40}
      className="rounded-lg object-cover shrink-0"
    />
  ) : (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: league.primary_color || '#D7FF00' }}
    >
      <Trophy className="h-5 w-5" style={{ color: league.secondary_color || '#000' }} />
    </div>
  )
}
