import type { LucideIcon } from 'lucide-react'

export function FeatureCard({
  icon: Icon,
  title,
  description,
  tone = 'default',
}: {
  icon: LucideIcon
  title: string
  description: string
  tone?: 'default' | 'accent'
}) {
  return (
    <div className="bg-card rounded-xl border border-border/30 p-5 md:p-6 flex flex-col gap-3 hover:border-border transition-colors">
      <div
        className={
          tone === 'accent'
            ? 'w-10 h-10 rounded-lg bg-accent text-black flex items-center justify-center'
            : 'w-10 h-10 rounded-lg bg-white/5 text-accent flex items-center justify-center'
        }
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-lg uppercase tracking-wide">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{description}</p>
    </div>
  )
}
