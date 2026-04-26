import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'

export function AudienceTile({
  eyebrow,
  title,
  description,
  href,
  icon: Icon,
  tag,
}: {
  eyebrow: string
  title: string
  description: string
  href: string
  icon: LucideIcon
  /** Small chip rendered next to the eyebrow, e.g. "GRATIS" or "WAITLIST". */
  tag?: { label: string; tone: 'free' | 'waitlist' }
}) {
  const tagClass =
    tag?.tone === 'free'
      ? 'bg-accent/15 text-accent'
      : 'bg-white/10 text-white/70'

  return (
    <Link
      href={href}
      className="group block bg-card border border-border/30 rounded-2xl p-6 md:p-7 hover:border-accent/30 active:scale-[0.99] transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        {tag && (
          <span
            className={`text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded ${tagClass}`}
          >
            {tag.label}
          </span>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
        {eyebrow}
      </p>
      <h3 className="font-display text-2xl md:text-3xl leading-[1.05] mb-3">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed mb-6">{description}</p>
      <div className="flex items-center gap-1.5 text-accent text-xs uppercase tracking-[0.18em]">
        Conocer más
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  )
}
