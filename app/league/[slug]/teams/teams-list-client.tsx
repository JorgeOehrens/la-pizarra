'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { CheckCircle2, XCircle, LogOut } from 'lucide-react'
import {
  approveTeamRequest,
  rejectTeamRequest,
  withdrawTeamFromLeague,
} from './actions'

type TeamShape = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
} | null

type RequestItem = {
  id: string
  team: TeamShape
  requester: { display_name: string | null; username: string } | null
  created_at: string
}

type ParticipationItem = {
  id: string
  team: TeamShape
  status: 'pending' | 'active'
  joined_at: string
}

type Props =
  | { kind: 'requests'; slug: string; items: RequestItem[] }
  | { kind: 'participations'; slug: string; isAdmin: boolean; items: ParticipationItem[] }

export function TeamsListClient(props: Props) {
  const [items, setItems] = useState(() => props.items)
  const [, startTransition] = useTransition()

  if (props.kind === 'requests') {
    if (items.length === 0) return null
    return (
      <div className="space-y-2">
        {(items as RequestItem[]).map((r) => (
          <div
            key={r.id}
            className="bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3"
          >
            <TeamAvatar team={r.team} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{r.team?.name ?? 'Equipo'}</p>
              {r.requester && (
                <p className="text-xs text-muted-foreground truncate">
                  Pedido por {r.requester.display_name || r.requester.username}
                </p>
              )}
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => {
                  startTransition(async () => {
                    const res = await approveTeamRequest(r.id, null, props.slug)
                    if ('ok' in res) setItems((p) => (p as RequestItem[]).filter((x) => x.id !== r.id))
                  })
                }}
                className="p-2 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent transition-colors"
                title="Aprobar"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  startTransition(async () => {
                    const res = await rejectTeamRequest(r.id, props.slug)
                    if ('ok' in res) setItems((p) => (p as RequestItem[]).filter((x) => x.id !== r.id))
                  })
                }}
                className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                title="Rechazar"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // participations
  return (
    <div className="space-y-2">
      {(items as ParticipationItem[]).map((p) => (
        <div
          key={p.id}
          className="bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3"
        >
          <TeamAvatar team={p.team} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{p.team?.name ?? 'Equipo'}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {p.status === 'pending' ? 'Invitación pendiente' : 'Activo'}
            </p>
          </div>
          {props.isAdmin && (
            <button
              onClick={() => {
                if (!confirm('¿Quitar el equipo de la liga?')) return
                startTransition(async () => {
                  const res = await withdrawTeamFromLeague(p.id, props.slug)
                  if ('ok' in res) setItems((q) => (q as ParticipationItem[]).filter((x) => x.id !== p.id))
                })
              }}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              title="Quitar de la liga"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function TeamAvatar({ team }: { team: TeamShape }) {
  if (!team) {
    return <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
  }
  return team.logo_url ? (
    <Image
      src={team.logo_url}
      alt={team.name}
      width={40}
      height={40}
      className="rounded-lg object-cover shrink-0"
    />
  ) : (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-lg shrink-0"
      style={{ backgroundColor: team.primary_color || '#D7FF00', color: team.secondary_color || '#000' }}
    >
      {team.name.charAt(0).toUpperCase()}
    </div>
  )
}
