/**
 * Player stats tiles — mimics the dashboard StatCard pattern but pure UI.
 */
const STATS = [
  { label: 'Partidos', value: '38' },
  { label: 'Goles', value: '27' },
  { label: 'Asist.', value: '14' },
  { label: 'Asist. %', value: '94' },
]

const RECENT = [
  { date: 'Sáb 19', vs: 'Atl. Lo B.', score: '3 – 1', tag: 'W' as const },
  { date: 'Mié 16', vs: 'Náutico',     score: '2 – 2', tag: 'D' as const },
  { date: 'Dom 13', vs: 'Sur',         score: '0 – 1', tag: 'L' as const },
]

export function MockPlayerStats() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border/30 p-3 text-center">
            <p className="font-display text-2xl tabular-nums leading-none">{s.value}</p>
            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border/30 overflow-hidden">
        <p className="px-3 py-2 border-b border-border/30 text-[10px] uppercase tracking-[0.2em] text-white/40">
          Últimos partidos
        </p>
        {RECENT.map((r, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 ${i < RECENT.length - 1 ? 'border-b border-border/20' : ''}`}
          >
            <span
              className={
                'w-6 h-6 rounded text-[10px] font-display flex items-center justify-center ' +
                (r.tag === 'W'
                  ? 'bg-accent/15 text-accent'
                  : r.tag === 'L'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-white/60')
              }
            >
              {r.tag}
            </span>
            <span className="text-[10px] text-white/40 w-12">{r.date}</span>
            <span className="flex-1 text-xs truncate">vs {r.vs}</span>
            <span className="font-display text-sm tabular-nums">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
