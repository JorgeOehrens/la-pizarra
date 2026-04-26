export function PainSolutionRow({
  pain,
  solution,
}: {
  pain: string
  solution: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 pb-6 md:pb-8 mb-6 md:mb-8 border-b border-border/30 last:mb-0 last:pb-0 last:border-b-0">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">Antes</p>
        <p className="text-sm md:text-base text-white/40 leading-relaxed">{pain}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
          Con LaPizarra
        </p>
        <p className="text-sm md:text-base text-white leading-relaxed">{solution}</p>
      </div>
    </div>
  )
}
