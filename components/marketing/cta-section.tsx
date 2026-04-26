import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WaitlistForm } from './waitlist-form'

type CTA = { href: string; label: string }

export function CTASection({
  title,
  description,
  primary,
  secondary,
  variant = 'accent',
  waitlist,
  id,
}: {
  title: string
  description?: string
  primary?: CTA
  secondary?: CTA
  variant?: 'accent' | 'dark'
  waitlist?: { audience: 'ligas' | 'equipos' | 'jugadores' | 'general'; source: string; successCopy?: string }
  id?: string
}) {
  const isAccent = variant === 'accent'

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden',
        isAccent ? 'bg-[#D7FF00] text-black' : 'bg-card border border-border/30',
        'rounded-2xl my-12 md:my-16',
      )}
    >
      {isAccent && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,1) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
      )}
      <div className="relative px-6 md:px-10 py-10 md:py-14 max-w-3xl mx-auto text-center">
        <h2
          className={cn(
            'font-display text-3xl md:text-5xl leading-[1.05] text-balance',
            isAccent ? 'text-black' : 'text-white',
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'mt-4 text-sm md:text-base max-w-xl mx-auto leading-relaxed',
              isAccent ? 'text-black/75' : 'text-white/60',
            )}
          >
            {description}
          </p>
        )}

        {(primary || secondary) && (
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {primary && (
              <Link
                href={primary.href}
                className={cn(
                  'flex items-center justify-center px-6 md:px-8 py-3.5 rounded-xl font-display text-lg uppercase tracking-wide transition-all active:scale-[0.98]',
                  isAccent
                    ? 'bg-black text-white hover:bg-black/90'
                    : 'bg-[#D7FF00] text-black hover:bg-[#BFE600]',
                )}
              >
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className={cn(
                  'flex items-center justify-center px-6 md:px-8 py-3.5 rounded-xl font-display text-lg uppercase tracking-wide transition-all active:scale-[0.98] border',
                  isAccent
                    ? 'border-black/30 text-black hover:bg-black/5'
                    : 'border-white/15 text-white hover:border-white/30',
                )}
              >
                {secondary.label}
              </Link>
            )}
          </div>
        )}

        {waitlist && (
          <div className="mt-8 max-w-md mx-auto text-left">
            <WaitlistForm
              audience={waitlist.audience}
              source={waitlist.source}
              successCopy={waitlist.successCopy}
              variant={isAccent ? 'on-accent' : 'default'}
            />
          </div>
        )}
      </div>
    </section>
  )
}
