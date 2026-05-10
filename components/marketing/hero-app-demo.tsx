import { BarChart3, Calendar, Goal, Trophy } from 'lucide-react'

const STATS = [
  { label: 'PJ', value: '38', Icon: Calendar },
  { label: 'Goles', value: '27', Icon: Goal },
  { label: 'Asist.', value: '14', Icon: BarChart3 },
  { label: 'Trofeos', value: '3', Icon: Trophy },
]

const RESULTS = [
  { date: 'Sáb 19', vs: 'Atl. Lo Barnechea', score: '3 – 1', tag: 'W' as const },
  { date: 'Mié 16', vs: 'Náutico FC', score: '2 – 2', tag: 'D' as const },
  { date: 'Dom 13', vs: 'Sur Unido', score: '0 – 1', tag: 'L' as const },
]

export function HeroAppDemo() {
  return (
    <div className="relative mx-auto w-full max-w-[300px] md:max-w-[320px]">
      {/* Soft accent glow behind the phone */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-[#D7FF00]/[0.06] blur-3xl"
      />

      {/* Phone bezel */}
      <div className="relative aspect-[9/19] rounded-[2.4rem] border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-2 shadow-2xl shadow-black/60">
        {/* Side button hint */}
        <div className="absolute top-24 -right-[3px] h-12 w-[3px] rounded-l-sm bg-white/10" />
        <div className="absolute top-20 -left-[3px] h-8 w-[3px] rounded-r-sm bg-white/10" />
        <div className="absolute top-32 -left-[3px] h-14 w-[3px] rounded-r-sm bg-white/10" />

        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-black">
          {/* Dot grid */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />
          {/* Stadium gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950/40 to-transparent pointer-events-none" />

          {/* Status bar */}
          <div className="relative flex items-center justify-between px-5 pt-3 text-[9px] text-white/70">
            <span className="font-display tabular-nums">19:42</span>
            <div className="absolute left-1/2 top-2 -translate-x-1/2 h-4 w-16 rounded-full bg-black" />
            <div className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span className="h-1.5 w-2.5 rounded-sm border border-white/50" />
            </div>
          </div>

          {/* App content */}
          <div className="relative px-3.5 pt-5 pb-2 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#D7FF00] grid place-items-center text-black font-display text-[11px]">
                LP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] leading-none">
                  Equipo
                </p>
                <p className="text-[11px] font-display leading-tight truncate">
                  Estudiantes FC
                </p>
              </div>
              <div className="h-6 w-6 rounded-full border border-white/15" />
            </div>

            {/* Next match card */}
            <div className="rounded-xl border border-[#D7FF00]/30 bg-[#D7FF00]/[0.04] p-3">
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#D7FF00] mb-1.5">
                Próximo partido · Sáb 26 · 19:30
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="h-7 w-7 rounded-full bg-[#D7FF00]" />
                  <span className="text-[10px] font-display">EST</span>
                </div>
                <span className="font-display text-base text-white/40">VS</span>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="h-7 w-7 rounded-full bg-orange-500" />
                  <span className="text-[10px] font-display">NAU</span>
                </div>
              </div>
              <p className="text-[8.5px] text-white/40 mt-2 text-center">
                Cancha 3 · Estadio Municipal
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-1.5 text-center"
                >
                  <p className="font-display text-sm tabular-nums leading-none">
                    {s.value}
                  </p>
                  <p className="text-[7.5px] text-white/40 uppercase tracking-[0.12em] mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent results */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <p className="px-2.5 py-1.5 border-b border-white/10 text-[8px] uppercase tracking-[0.2em] text-white/40">
                Últimos partidos
              </p>
              {RESULTS.map((r, i) => (
                <div
                  key={i}
                  className={
                    'flex items-center gap-2 px-2.5 py-1.5 ' +
                    (i < RESULTS.length - 1 ? 'border-b border-white/5' : '')
                  }
                >
                  <span
                    className={
                      'h-4 w-4 rounded text-[8px] font-display grid place-items-center ' +
                      (r.tag === 'W'
                        ? 'bg-[#D7FF00]/20 text-[#D7FF00]'
                        : r.tag === 'L'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-white/10 text-white/60')
                    }
                  >
                    {r.tag}
                  </span>
                  <span className="text-[8px] text-white/40 w-8 tabular-nums">
                    {r.date}
                  </span>
                  <span className="flex-1 text-[9px] truncate text-white/80">
                    vs {r.vs}
                  </span>
                  <span className="font-display text-[10px] tabular-nums">
                    {r.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 inset-x-0 px-3 pb-2 pt-2 border-t border-white/5 bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[8px] text-white/40">
              <div className="flex flex-col items-center gap-0.5 text-[#D7FF00]">
                <Calendar className="h-3 w-3" />
                <span>Hoy</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Trophy className="h-3 w-3" />
                <span>Liga</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <BarChart3 className="h-3 w-3" />
                <span>Stats</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Goal className="h-3 w-3" />
                <span>Perfil</span>
              </div>
            </div>
            <div className="mx-auto mt-1.5 h-[3px] w-20 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  )
}
