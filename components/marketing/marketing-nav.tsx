import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MarketingNavLinks } from './marketing-nav-links'
import { MarketingNavMobile } from './marketing-nav-mobile'

export async function MarketingNav() {
  // Server-side session check so we can flip the right CTA without
  // hydration flicker. `getUser()` is cheap (cookie-backed).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const rightCta = user
    ? { href: '/home', label: 'Ir a la app' }
    : { href: '/auth/login', label: 'Iniciar sesión' }

  return (
    <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-border/30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-wide">
          LA<span className="text-accent"> PIZARRA</span>
        </Link>

        <div className="hidden md:block">
          <MarketingNavLinks />
        </div>

        <div className="hidden md:block">
          <Link
            href={rightCta.href}
            className="inline-flex items-center justify-center text-xs uppercase tracking-[0.18em] border border-white/15 text-white px-4 py-2 rounded-lg hover:border-white/30"
          >
            {rightCta.label}
          </Link>
        </div>

        <MarketingNavMobile rightCta={rightCta} />
      </div>
    </header>
  )
}
