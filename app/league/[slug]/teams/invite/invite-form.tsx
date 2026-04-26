'use client'

import { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { Search, Send, CheckSquare, Square } from 'lucide-react'
import { searchTeams, type SearchTeam } from './actions'
import { inviteTeamToLeague } from '../actions'

export function InviteTeamForm({
  leagueId,
  slug,
}: {
  leagueId: string
  slug: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchTeam[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [invited, setInvited] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [pending, startTransition] = useTransition()

  // Initial empty search to show some teams the admin might recognise.
  useEffect(() => {
    startTransition(async () => {
      const res = await searchTeams(leagueId, '')
      if ('data' in res) setResults(res.data)
    })
  }, [leagueId])

  function runSearch(q: string) {
    setQuery(q)
    setError(null)
    startTransition(async () => {
      const res = await searchTeams(leagueId, q)
      if ('error' in res) {
        setError(res.error)
        setResults([])
      } else {
        setResults(res.data)
      }
    })
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(
      new Set(results.filter((r) => !invited.has(r.id)).map((r) => r.id)),
    )
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function inviteSelected() {
    setError(null)
    const ids = Array.from(selected).filter((id) => !invited.has(id))
    if (ids.length === 0) return

    setProgress({ done: 0, total: ids.length })
    let firstError: string | null = null

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const res = await inviteTeamToLeague(leagueId, id, null, slug)
      if ('error' in res) {
        if (!firstError) firstError = res.error
      } else {
        setInvited((p) => new Set(p).add(id))
      }
      setProgress({ done: i + 1, total: ids.length })
    }

    if (firstError) setError(firstError)
    setSelected(new Set())
    setProgress(null)
  }

  const selectedCount = Array.from(selected).filter((id) => !invited.has(id)).length

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar equipos por nombre…"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-3 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {/* Bulk actions bar */}
      {results.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-accent hover:underline"
              disabled={pending}
            >
              Seleccionar todos
            </button>
            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-muted-foreground hover:underline"
                disabled={pending}
              >
                Limpiar
              </button>
            )}
          </div>
          {selectedCount > 0 && (
            <button
              onClick={inviteSelected}
              disabled={pending}
              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-lg uppercase tracking-wider disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {progress
                ? `${progress.done}/${progress.total}`
                : `Invitar ${selectedCount}`}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>
      )}

      {results.length === 0 && !pending && query.length > 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Sin resultados para “{query}”.
        </p>
      )}

      {results.length === 0 && !pending && query.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No hay equipos disponibles para invitar.
        </p>
      )}

      <div className="space-y-2">
        {results.map((t) => {
          const wasInvited = invited.has(t.id)
          const isSelected = selected.has(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => !wasInvited && toggleSelect(t.id)}
              disabled={wasInvited}
              className={`w-full bg-card rounded-xl p-4 border flex items-center gap-3 transition-colors text-left ${
                wasInvited
                  ? 'border-accent/40 bg-accent/5'
                  : isSelected
                  ? 'border-accent'
                  : 'border-border/40 hover:border-border'
              }`}
            >
              {wasInvited ? (
                <div className="w-5 h-5 rounded bg-accent flex items-center justify-center shrink-0">
                  <CheckSquare className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
              ) : isSelected ? (
                <CheckSquare className="h-5 w-5 text-accent shrink-0" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground shrink-0" />
              )}

              {t.logo_url ? (
                <Image
                  src={t.logo_url}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-lg shrink-0"
                  style={{ backgroundColor: t.primary_color || '#D7FF00', color: t.secondary_color || '#000' }}
                >
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.member_count} miembro{t.member_count === 1 ? '' : 's'}
                  {wasInvited && ' · Invitación enviada'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
