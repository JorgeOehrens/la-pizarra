'use client'

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Star } from 'lucide-react'

export type SeasonOption = {
  id: string
  name: string
  is_current: boolean
}

/**
 * Switches the current page to a different `?season=<id>` value.
 * Use it on /fixtures, /standings and the bracket page.
 *
 * The "Todas" option clears the param (returns null → server uses
 * the current season fallback if any).
 */
export function SeasonSelect({
  seasons,
  selectedId,
  className,
}: {
  seasons: SeasonOption[]
  selectedId: string | null
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  function setSeason(id: string | null) {
    const next = new URLSearchParams(params?.toString() ?? '')
    if (id) next.set('season', id)
    else next.delete('season')
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`)
      router.refresh()
    })
  }

  if (seasons.length === 0) return null

  const current = seasons.find((s) => s.id === selectedId)

  return (
    <div className={className}>
      <div className="relative">
        <Calendar className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <select
          value={selectedId ?? ''}
          onChange={(e) => setSeason(e.target.value || null)}
          disabled={pending}
          className="appearance-none w-full pl-9 pr-8 py-2 bg-card border border-border/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        >
          <option value="">Todas las temporadas</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}{s.is_current ? ' (actual)' : ''}
            </option>
          ))}
        </select>
        {current?.is_current && (
          <Star className="h-3.5 w-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-accent fill-current pointer-events-none" />
        )}
      </div>
    </div>
  )
}
