import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/30 bg-black mt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="font-display text-2xl tracking-wide block mb-3">
              LA<span className="text-accent"> PIZARRA</span>
            </Link>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-2">
              Fútbol amateur · 2026
            </p>
            <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
              Hecho para canchas reales. Equipos, ligas y la carrera del jugador en un solo lugar.
            </p>
          </div>

          {/* Audience */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">
              Audiencia
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/para-ligas" className="text-white/70 hover:text-white">
                  Ligas
                </Link>
              </li>
              <li>
                <Link href="/para-equipos" className="text-white/70 hover:text-white">
                  Equipos
                </Link>
              </li>
              <li>
                <Link href="/para-jugadores" className="text-white/70 hover:text-white">
                  Jugadores
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">
              Recursos
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/precios" className="text-white/70 hover:text-white">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/70 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-white/70 hover:text-white">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-white/70 hover:text-white">
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-white/50 hover:text-white text-xs">
                  Términos
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-white/50 hover:text-white text-xs">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
          <p>© 2026 LaPizarra · Hecho con cariño para el fútbol de barrio.</p>
          <p className="font-sans uppercase tracking-[0.18em]">v1</p>
        </div>
      </div>
    </footer>
  )
}
