/**
 * Compact bracket mock — 3 columns (Cuartos/Semis/Final), each with
 * placeholder match cards. Sized to fit in a marketing tile, not a full
 * tournament view.
 */
type Slot = { home: string; away: string; hs?: number; as?: number; color: string }

const C: Slot[] = [
  { home: 'R. Maipú', away: 'Náutico',      hs: 2, as: 1, color: '#dc2626' },
  { home: 'Atl. Lo B.', away: 'Sur',         hs: 0, as: 1, color: '#2563eb' },
]
const S: Slot[] = [
  { home: 'R. Maipú', away: 'Sur',           hs: 1, as: 0, color: '#dc2626' },
]

export function MockBracket() {
  return (
    <div className="bg-card rounded-xl border border-border/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          Llave
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-accent">
          Eliminatoria
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Column title="Cuartos" matches={C} />
        <Column title="Semis"   matches={S} />
        <Column title="Final"   matches={[{ home: 'R. Maipú', away: '?', color: '#dc2626' }]} />
      </div>
    </div>
  )
}

function Column({ title, matches }: { title: string; matches: Slot[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 text-center">
        {title}
      </p>
      <div className="flex-1 flex flex-col justify-around gap-2">
        {matches.map((m, i) => (
          <div key={i} className="bg-background rounded-md border border-border/40 px-2 py-1.5 text-[10px] leading-tight">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate">{m.home}</span>
              <span className="font-display tabular-nums">{m.hs ?? '-'}</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-white/50">
              <span className="truncate">{m.away}</span>
              <span className="font-display tabular-nums">{m.as ?? '-'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
