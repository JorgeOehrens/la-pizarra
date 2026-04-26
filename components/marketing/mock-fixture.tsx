/**
 * Pure-UI mock of a finished fixture card. No data, no Supabase.
 * Replicates exactly the card pattern used in /league/[slug]/fixtures.
 */
export function MockFixture({
  finished = true,
}: {
  finished?: boolean
}) {
  return (
    <div className="bg-card rounded-xl border border-border/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          Sáb 14:00
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-accent">
          Cuartos
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          <span className="text-sm font-medium truncate">Real Maipú</span>
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-display shrink-0"
            style={{ backgroundColor: '#dc2626', color: '#fff' }}
          >
            R
          </div>
        </div>
        <div className="px-2 shrink-0">
          {finished ? (
            <span className="font-display text-base tabular-nums">3 – 1</span>
          ) : (
            <span className="text-xs uppercase tracking-widest text-white/40">vs</span>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-display shrink-0"
            style={{ backgroundColor: '#2563eb', color: '#fff' }}
          >
            A
          </div>
          <span className="text-sm font-medium truncate">Atlético Lo B.</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border/30 text-[10px] text-white/40">
        📍 Cancha 1 · Liga Maipú 2026
      </div>
    </div>
  )
}
