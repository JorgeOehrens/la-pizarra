import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Mail } from 'lucide-react'
import { features } from '@/lib/features'
import { SectionHeading } from '@/components/marketing/section-heading'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

export const metadata: Metadata = {
  title: 'LaPizarra — Precios.',
  description:
    'Equipos y jugadores: gratis para siempre. Pro Liga desde $499.000 CLP/año. Liga con streaming en vivo desde $1.490.000 CLP/año. Federación: pricing custom.',
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

const STREAMING = [
  'Todo lo de Pro Liga',
  'Transmisión en vivo (RTMP / cámara compatible)',
  'On-demand: cada partido queda grabado',
  'Clips automáticos de goles y momentos clave',
  'Player embebido en la vista pública de la liga',
  'Marca de agua y branding de la liga',
  'Storage incluido por temporada',
  'Soporte prioritario',
]

const FEDERACION = [
  'Multi-liga y multi-temporada bajo una org',
  'Branding propio + dominio custom',
  'Reportería para federación / sponsors',
  'Boleta y factura electrónica',
  'Onboarding asistido + soporte SLA',
  'Streaming incluido (volumen acordado)',
]

const FAQ = [
  {
    q: '¿Por qué cobran a las ligas y no a los equipos?',
    a: 'Porque son las que más laburo se ahorran y las que mueven dinero (cuotas, sponsors, premios). Equipos y jugadores son el motor del producto, no tiene sentido cobrarles.',
  },
  {
    q: '¿Necesito una cámara especial para el streaming?',
    a: 'No. Cualquier cámara que emita por RTMP funciona — celular con app de streaming, GoPro Hero 11+, cámaras tipo Veo/Pixellot, o un encoder OBS desde una notebook. Te entregamos la URL y la stream key, y la liga decide qué cámara usar.',
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
    q: '¿Aceptan transferencia, Mercado Pago o factura?',
    a: 'Cuando se abra Pro Liga, sí. Federación incluye boleta y factura electrónica desde el día uno.',
  },
  {
    q: '¿Qué pasa si manejo más de una liga?',
    a: 'Cada liga paga por separado en Pro Liga y Liga con Streaming. Si manejás una federación con varias ligas, el plan Federación te conviene — escribinos para pricing custom.',
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
          Equipos gratis. Ligas con admin o streaming. Federación a medida.
        </h1>
        <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Estamos abriendo Pro Liga y Liga + Streaming de a poco. Equipos y jugadores siempre
          gratis. Federación: pricing custom según tamaño.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Free */}
        <div className="bg-card border border-border/30 rounded-2xl p-6 md:p-8 flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
            Equipos y jugadores
          </p>
          <h2 className="font-display text-3xl md:text-4xl leading-none">Free</h2>
          <p className="mt-3 text-sm text-white/60">
            Para siempre. Sin tarjeta, sin compromiso.
          </p>
          <p className="mt-5 font-display text-4xl md:text-5xl tabular-nums">$0</p>
          <p className="text-xs text-white/40 mt-1">CLP / siempre</p>

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
          <p className="mt-5 font-display text-4xl md:text-5xl tabular-nums">$499.000</p>
          <p className="text-xs text-white/50 mt-1">
            CLP / año / liga · facturación anual
          </p>
          <p className="text-[11px] text-white/35 mt-1">
            Equivale a ~$41.500 CLP/mes
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

        {/* Liga con Streaming */}
        <div className="relative bg-card border border-border/30 rounded-2xl p-6 md:p-8 flex flex-col">
          <span className="absolute -top-3 left-6 inline-flex items-center gap-1 bg-white/10 text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium">
            En lista de espera
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
            Liga con cámara o streaming
          </p>
          <h2 className="font-display text-3xl md:text-4xl leading-none">Liga + Streaming</h2>
          <p className="mt-3 text-sm text-white/60">
            Transmisión en vivo + clips on-demand para tu liga.
          </p>
          <p className="mt-5 font-display text-4xl md:text-5xl tabular-nums">$1.490.000</p>
          <p className="text-xs text-white/50 mt-1">
            CLP / año / liga · facturación anual
          </p>
          <p className="text-[11px] text-white/35 mt-1">
            Equivale a ~$124.000 CLP/mes
          </p>

          <ul className="mt-6 space-y-3 flex-1">
            {STREAMING.map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-white/80">{feat}</span>
              </li>
            ))}
          </ul>

          <Link
            href="#waitlist-streaming"
            className="mt-7 inline-flex items-center justify-center gap-2 border border-white/15 text-white py-3.5 rounded-xl font-display uppercase tracking-wide hover:border-white/30 active:scale-[0.98] transition-all"
          >
            Anotarme al waitlist
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Federación tier */}
      <div className="bg-card border border-border/30 rounded-2xl p-6 md:p-8 mb-16">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
              Federación / multi-liga
            </p>
            <h2 className="font-display text-2xl md:text-3xl leading-none mb-3">
              Federación
            </h2>
            <p className="text-sm text-white/60 mb-4 max-w-xl leading-relaxed">
              Para organizaciones con más de una liga, más de 50 equipos, o requisitos de
              facturación, branding y soporte propios. Pricing custom según volumen.
            </p>
            <p className="font-display text-3xl md:text-4xl tabular-nums">
              Custom
              <span className="text-sm text-white/50 ml-2 align-middle font-sans">
                contacto directo
              </span>
            </p>
          </div>

          <ul className="md:w-1/2 space-y-2.5">
            {FEDERACION.map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-white/80">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-6 border-t border-border/30">
          <Mail className="h-5 w-5 text-accent shrink-0" />
          <p className="text-xs text-white/60 flex-1">
            Escribinos a{' '}
            <a href="mailto:hola@lapizarra.app" className="text-accent underline">
              hola@lapizarra.app
            </a>{' '}
            con el detalle de tu federación (cantidad de ligas, equipos, temporadas) y te
            armamos una propuesta.
          </p>
          <a
            href="mailto:hola@lapizarra.app?subject=Federaci%C3%B3n%20%E2%80%94%20LaPizarra"
            className="inline-flex items-center justify-center gap-2 border border-white/15 text-white px-5 py-3 rounded-xl text-xs font-display uppercase tracking-wide hover:border-white/30 active:scale-[0.98] transition-all"
          >
            Contactar
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
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

      {/* Waitlists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {/* Pro Liga waitlist */}
        <section
          id="waitlist"
          className="bg-card border border-border/30 rounded-2xl p-6 md:p-8"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
            Waitlist Pro Liga
          </p>
          <h2 className="font-display text-xl md:text-2xl leading-tight mb-3">
            Avísame cuando se abra.
          </h2>
          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            Estamos abriendo accesos uno a uno. Déjanos tu email y te escribimos cuando puedas
            crear tu liga con 30 días gratis.
          </p>
          <WaitlistForm
            audience="ligas"
            source="/precios#waitlist"
            successCopy="Listo. Te mandamos un email apenas habilitemos tu acceso."
          />
        </section>

        {/* Streaming waitlist */}
        <section
          id="waitlist-streaming"
          className="bg-card border border-border/30 rounded-2xl p-6 md:p-8"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">
            Waitlist Liga + Streaming
          </p>
          <h2 className="font-display text-xl md:text-2xl leading-tight mb-3">
            Quiero transmitir mis partidos.
          </h2>
          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            Estamos cerrando los primeros pilotos. Anótate y coordinamos cómo conectar tu cámara
            o celular a la transmisión de tu liga.
          </p>
          <WaitlistForm
            audience="ligas"
            source="/precios#waitlist-streaming"
            successCopy="Listo. Te contactamos para coordinar el piloto de streaming."
          />
        </section>
      </div>
    </div>
  )
}
