import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WaitlistForm } from './waitlist-form'

type CTA = { href: string; label: string }

export function MarketingHero({
  eyebrow,
  titleTop,
  titleBottomAccent,
  subtitle,
  primary,
  secondary,
  textLink,
  size = 'standard',
  waitlist,
}: {
  eyebrow: string
  titleTop: string
  titleBottomAccent: string
  subtitle?: string
  primary: CTA
  secondary?: CTA
  textLink?: CTA
  size?: 'tall' | 'standard'
  waitlist?: { audience: 'ligas' | 'equipos' | 'jugadores' | 'general'; source: string; placeholder?: string }
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-black',
        size === 'tall' ? 'min-h-[100dvh]' : 'min-h-[78dvh] md:min-h-[80dvh]',
      )}
    >
      {/* Dot grid background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* Top accent haze */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#D7FF00]/[0.05] to-transparent pointer-events-none" />
      {/* Stadium green bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-emerald-950/30 to-transparent pointer-events-none" />

      <div
        className={cn(
          'relative z-10 max-w-5xl mx-auto px-6 flex flex-col',
          size === 'tall' ? 'pt-24 md:pt-28 pb-12' : 'pt-20 md:pt-24 pb-12',
        )}
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 font-sans mb-4">
          {eyebrow}
        </p>
        <h1 className="font-display text-[64px] md:text-[96px] leading-none text-white">
          {titleTop}
        </h1>
        <h1 className="font-display text-[64px] md:text-[96px] leading-none text-[#D7FF00] -mt-2">
          {titleBottomAccent}
        </h1>
        <div className="h-0.5 w-12 bg-[#D7FF00] mt-5 mb-6" />
        {subtitle && (
          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-[320px] md:max-w-[480px] font-sans mb-10">
            {subtitle}
          </p>
        )}

        <div className="flex flex-col md:flex-row gap-3 max-w-md md:max-w-2xl">
          <Link
            href={primary.href}
            className="flex items-center justify-center w-full md:w-auto md:px-8 bg-[#D7FF00] text-black py-[17px] rounded-xl font-display text-xl uppercase tracking-wide hover:bg-[#BFE600] active:scale-[0.98] transition-all"
          >
            {primary.label}
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="flex items-center justify-center w-full md:w-auto md:px-8 border border-white/15 text-white py-[17px] rounded-xl font-display text-xl uppercase tracking-wide hover:border-white/30 hover:text-white active:scale-[0.98] transition-all"
            >
              {secondary.label}
            </Link>
          )}
        </div>

        {textLink && (
          <div className="pt-5">
            <Link
              href={textLink.href}
              className="text-sm text-white/30 hover:text-white/60 transition-colors font-sans"
            >
              {textLink.label} →
            </Link>
          </div>
        )}

        {waitlist && (
          <div className="mt-10 max-w-md">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
              Anótate al boletín
            </p>
            <WaitlistForm
              audience={waitlist.audience}
              source={waitlist.source}
              placeholder={waitlist.placeholder}
              compact
            />
          </div>
        )}
      </div>
    </section>
  )
}
