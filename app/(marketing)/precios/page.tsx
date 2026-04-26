import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Mail } from 'lucide-react'
import { features } from '@/lib/features'
import { SectionHeading } from '@/components/marketing/section-heading'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

export const metadata: Metadata = {
  title: 'LaPizarra — Precios.',
  description:
    'Equipos y jugadores: gratis para siempre. Ligas: $10.000 CLP/año por liga, en lista de espera durante la beta.',
}

const FREE = [
  'Equipos ilimitados',
  'Plantilla, partidos y eventos',
  'Estadísticas automáticas por jugador',
  'Asistencia',
  'Finanzas del equipo (cobros + distribución)',
  'Multi-equipo (un perfil, varios equipos)',
  'Unirse a una liga (cuando te invitan)',
]

const PRO = [
  'Todo lo de Free',
  'Crear liga (workspace propio)',
  'Brackets eliminatorios + auto-advance',
  'Standings + top scorers + asistidores',
  'Vista pública compartible',
  'PDF de fixtures',
  'Generador de torneo completo',
  'Soporte por email',
]

const FAQ = [
  {
    q: '¿Por qué solo cobran a las ligas?',
    a: 'Porque son las que más laburo se ahorran. Equipos y jugadores son el motor del producto, no tiene sentido cobrarles.',
  },
  {
    q: '¿Qué pasa cuando se abra Pro Liga?',
    a: 'Te mandamos email a los que estén en la lista de espera. 30 días gratis para probar antes de cobrar. Sin tarjeta de crédito durante el trial.',
  },
  {
    q: '¿Mis datos se borran si no pago?',
    a: 'No. La liga queda en read-only y los datos están a la vista. Podés volver a activar cuando quieras.',
  },
  {
    q: '¿Aceptan transferencia o Mercado Pago?',
    a: 'Cuando se abra Pro Liga, sí. Hoy estamos validando — anótate y te avisamos.',
  },
  {
    q: '¿Qué pasa si manejo más de una liga?',
    a: 'Cada liga se cobra por separado. Si tienes federación con varias ligas, escríbenos para pricing custom.',
  },
]

export default function PreciosPage() {
  const leaguesEnabled = features.leagues
  const proCta = leaguesEnabled
    ? { href: '/onboarding/create-league', label: 'Probar 30 días gratis' }
    : { href: '#waitlist', label: 'Anotarme al waitlist' }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3">
          Precios
        </p>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-4">
          Hoy los equipos juegan gratis. Las ligas se anotan.
        </h1>
        <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Estamos abriendo Pro Liga de a poco. Mientras, todo lo demás está abierto y sin compromiso.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {/* Free */}
        <div className="bg-card border border-border/30 rounded-2xl p-6 md:p-8 flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
            Equipos y jugadores
          </p>
          <h2 className="font-display text-3xl md:text-4xl leading-none">Free</h2>
          <p className="mt-3 text-sm text-white/60">
            Para siempre. Sin tarjeta, sin compromiso.
          </p>
          <p className="mt-5 font-display text-5xl tabular-nums">$0</p>

          <ul className="mt-6 space-y-3 flex-1">
            {FREE.map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-white/80">{feat}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/onboarding/create-team"
            className="mt-7 inline-flex items-center justify-center gap-2 border border-white/15 text-white py-3.5 rounded-xl font-display uppercase tracking-wide hover:border-white/30 active:scale-[0.98] transition-all"
          >
            Crear equipo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Pro Liga */}
        <div className="relative bg-card border border-accent/40 rounded-2xl p-6 md:p-8 flex flex-col">
          <span className="absolute -top-3 left-6 inline-flex items-center gap-1 bg-accent text-black px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium">
            {leaguesEnabled ? 'Trial 30 días' : 'En lista de espera'}
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
            Organizadores de liga
          </p>
          <h2 className="font-display text-3xl md:text-4xl leading-none">Pro Liga</h2>
          <p className="mt-3 text-sm text-white/60">
            Para ligas amateur con varios equipos y temporadas.
          </p>
          <p className="mt-5 font-display text-5xl tabular-nums">
            $10.000
            <span className="text-sm text-white/50 ml-2 align-middle">CLP / año / liga</span>
          </p>

          <ul className="mt-6 space-y-3 flex-1">
            {PRO.map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-white/80">{feat}</span>
              </li>
            ))}
          </ul>

          <Link
            href={proCta.href}
            className="mt-7 inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3.5 rounded-xl font-display uppercase tracking-wide hover:bg-[#BFE600] active:scale-[0.98] transition-all"
          >
            {proCta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Federation strip */}
      <div className="bg-card border border-dashed border-border/60 rounded-xl p-5 md:p-6 mb-16 flex flex-col md:flex-row items-start md:items-center gap-4">
        <Mail className="h-6 w-6 text-accent shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">¿Federación con más de 50 equipos?</p>
          <p className="text-xs text-white/60 mt-1">
            Pricing custom y onboarding asistido. Escríbenos a{' '}
            <a href="mailto:hola@lapizarra.app" className="text-accent underline">
              hola@lapizarra.app
            </a>
            .
          </p>
        </div>
      </div>

      {/* Why free for teams */}
      <section className="mb-16">
        <SectionHeading
          eyebrow="Por qué free para equipos"
          title="El barrio entero entra primero."
        />
        <p className="text-white/60 text-base leading-relaxed max-w-2xl">
          Los equipos amateur ya pagan cancha, indumentaria y arbitraje. Lo último que necesitan es otra
          suscripción. LaPizarra es gratis para que todo el barrio pueda usarla — ahí es donde el producto
          gana memoria. Las ligas, en cambio, son las que ahorran horas de trabajo administrativo cada
          fin de semana, y por eso son las que pagan.
        </p>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <SectionHeading title="Preguntas frecuentes" />
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group bg-card border border-border/30 rounded-xl p-5 cursor-pointer"
            >
              <summary className="flex items-center justify-between gap-3 text-sm font-medium list-none">
                {item.q}
                <span className="text-white/40 group-open:rotate-45 transition-transform text-lg leading-none">
                  +
                </span>
              </summary>
              <p className="text-sm text-white/60 mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Pro Liga waitlist (always visible) */}
      <section id="waitlist" className="bg-card border border-border/30 rounded-2xl p-6 md:p-10 max-w-2xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
          Lista de espera Pro Liga
        </p>
        <h2 className="font-display text-2xl md:text-3xl leading-tight mb-3">
          Avísame cuando se abra.
        </h2>
        <p className="text-sm text-white/60 mb-6 leading-relaxed">
          Estamos abriendo accesos uno a uno. Déjanos tu email y te escribimos cuando podás crear tu liga
          con 30 días gratis.
        </p>
        <WaitlistForm
          audience="ligas"
          source="/precios#waitlist"
          successCopy="Listo. Te mandamos un email apenas habilitemos tu acceso."
        />
      </section>
    </div>
  )
}
