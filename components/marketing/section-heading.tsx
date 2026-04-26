import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={cn(
        'mb-6 md:mb-8',
        align === 'center' && 'text-center',
      )}
    >
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl md:text-4xl leading-[1.05]">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-sm md:text-base text-white/60 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
