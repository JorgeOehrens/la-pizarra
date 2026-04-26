type Row = {
  pos: number
  name: string
  pj: number
  pts: number
  color: string
}

const ROWS: Row[] = [
  { pos: 1, name: 'Real Maipú',       pj: 8, pts: 22, color: '#dc2626' },
  { pos: 2, name: 'Atlético Lo B.',   pj: 8, pts: 18, color: '#2563eb' },
  { pos: 3, name: 'Deportivo Sur',    pj: 8, pts: 16, color: '#16a34a' },
  { pos: 4, name: 'Náutico FC',       pj: 8, pts: 14, color: '#9333ea' },
  { pos: 5, name: 'Barrio Norte',     pj: 8, pts: 12, color: '#ea580c' },
]

export function MockStandings() {
  return (
    <div className="bg-card rounded-xl border border-border/30 overflow-hidden">
      <div className="px-3 py-2 border-b border-border/30 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          Tabla
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-accent">
          Apertura 2026
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-white/40 border-b border-border/30">
            <th className="text-left py-2 px-3 w-8">#</th>
            <th className="text-left py-2 px-1">Equipo</th>
            <th className="text-center py-2 px-2">PJ</th>
            <th className="text-right py-2 px-3">Pts</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.pos} className="border-b border-border/20 last:border-0">
              <td className="py-2 px-3 text-xs text-white/40">{r.pos}</td>
              <td className="py-2 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-display"
                    style={{ backgroundColor: r.color, color: '#fff' }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <span className="text-xs">{r.name}</span>
                </div>
              </td>
              <td className="py-2 px-2 text-center text-xs tabular-nums text-white/60">{r.pj}</td>
              <td className="py-2 px-3 text-right font-display text-base tabular-nums">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
