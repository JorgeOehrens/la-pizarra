import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Calendar,
  Globe,
  Goal,
  ListOrdered,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react'
import { features } from '@/lib/features'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { SectionHeading } from '@/components/marketing/section-heading'
import { FeatureCard } from '@/components/marketing/feature-card'
import { CTASection } from '@/components/marketing/cta-section'
import { PainSolutionRow } from '@/components/marketing/pain-solution-row'
import { CrossLinkRow } from '@/components/marketing/cross-link-row'
import { MockFixture } from '@/components/marketing/mock-fixture'
import { MockStandings } from '@/components/marketing/mock-standings'
import { MockBracket } from '@/components/marketing/mock-bracket'

export const metadata: Metadata = {
  title: 'LaPizarra para ligas — Fixtures, brackets y standings sin planillas.',
  description:
    '¿Liga amateur con varios equipos? Maneja fixtures, llaves eliminatorias, tabla y goleadores. Comparte la vista pública con un link.',
}

export default function ParaLigasPage() {
  const leaguesEnabled = features.leagues
  const demoSlug = process.env.NEXT_PUBLIC_DEMO_LEAGUE_SLUG

  // Primary CTA depends on the feature flag. With leagues OFF we send the user
  // to #waitlist (anchor on the same page); with leagues ON, straight to the
  // wizard. The waitlist form is shown either way to capture warm leads.
  const primary = leaguesEnabled
    ? { href: '/onboarding/create-league', label: 'Crear liga' }
    : { href: '#waitlist', label: 'Pedir acceso' }

  const secondary = demoSlug
    ? { href: `/public/league/${demoSlug}`, label: 'Ver liga de ejemplo' }
    : { href: '/auth/login', label: 'Iniciar sesión' }

  return (
    <>
      <MarketingHero
        size="standard"
        eyebrow="Para ligas"
        titleTop="MANEJA TU"
        titleBottomAccent="LIGA"
        subtitle="Fixtures, brackets y la tabla, sin planillas. Tus equipos cargan los partidos, tú compartes la liga con un link."
        primary={primary}
        secondary={secondary}
        waitlist={{ audience: 'ligas', source: '/para-ligas' }}
      />

      <div className="max-w-3xl mx-auto px-4">
        {/* Pain → Solución */}
        <section className="py-16 md:py-20">
          <SectionHeading
            eyebrow="El problema"
            title="Lo que hoy te come el domingo."
          />
          <div className="mt-2">
            <PainSolutionRow
              pain="El fixture lo arma uno en un grupo de WhatsApp y nadie lo encuentra dos semanas después."
              solution="Un calendario que ven todos los equipos, con resultados que se actualizan solos."
            />
            <PainSolutionRow
              pain="La tabla la calcula alguien con Excel, y a la cuarta fecha ya hay errores."
              solution="La tabla se calcula sola con cada partido cargado. Goleadores y asistidores también."
            />
            <PainSolutionRow
              pain="Cada equipo manda los resultados como puede: foto, audio, mensaje."
              solution="Cada equipo carga su partido en la app. Los eventos quedan auditables."
            />
            <PainSolutionRow
              pain="Compartir la liga con la gente del barrio es un lío de capturas."
              solution="Una URL pública con tabla, fixture y bracket. Mandas el link y listo."
            />
          </div>
        </section>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4">
        <section className="py-12 md:py-20">
          <SectionHeading
            eyebrow="Lo que tiene"
            title="Todo lo que necesita un torneo."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Calendar}
              title="Fixtures"
              description="Generador de calendario con sedes, fechas y horarios. Round-robin o partidos sueltos."
            />
            <FeatureCard
              icon={Swords}
              title="Brackets eliminatorios"
              description="Octavos, cuartos, semis y final. Avanzan solos según los resultados."
            />
            <FeatureCard
              icon={ListOrdered}
              title="Standings en vivo"
              description="Tabla calculada con cada partido finalizado. PJ, PG, PE, PP, GF, GC, DG, PTS."
            />
            <FeatureCard
              icon={Goal}
              title="Goleadores y asistidores"
              description="Top 5 de cada categoría, con foto del jugador y equipo."
            />
            <FeatureCard
              icon={Globe}
              title="Vista pública compartible"
              description="Una URL para los hinchas. Sin login, sin instalar nada."
            />
            <FeatureCard
              icon={Trophy}
              title="Multi-temporada"
              description="Apertura, Clausura, 2025, 2026. Histórico que no se borra."
            />
          </div>
        </section>
      </div>

      {/* Mocks */}
      <section className="bg-card border-y border-border/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeading
            eyebrow="Así se ve"
            title="La liga, en un vistazo."
            subtitle="Capturas de la app real. La vista pública se comparte con un link."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MockStandings />
            <MockBracket />
            <MockFixture />
          </div>
        </div>
      </section>

      {/* CTA + waitlist */}
      <div className="max-w-5xl mx-auto px-4">
        <CTASection
          id="waitlist"
          variant="accent"
          title={leaguesEnabled ? '¿Listo para armar tu liga?' : 'Ligas en lista de espera. Anótate.'}
          description={
            leaguesEnabled
              ? 'Crea tu liga y mándale el link a tus equipos. 30 días gratis.'
              : 'Estamos abriendo Pro Liga de a poco. Déjanos tu email y te escribimos cuando puedas crear la tuya.'
          }
          primary={leaguesEnabled ? { href: '/onboarding/create-league', label: 'Crear liga' } : undefined}
          secondary={leaguesEnabled ? { href: '/auth/login', label: 'Iniciar sesión' } : undefined}
          waitlist={
            leaguesEnabled
              ? undefined
              : {
                  audience: 'ligas',
                  source: '/para-ligas#waitlist',
                  successCopy: 'Listo. Te mandamos un email apenas habilitemos tu acceso.',
                }
          }
        />

        {!leaguesEnabled && (
          <div className="text-center pb-10">
            <Link href="/onboarding/create-team" className="text-sm text-white/50 hover:text-white">
              Mientras tanto, crea tu equipo →
            </Link>
          </div>
        )}

        <div className="pb-12">
          <CrossLinkRow
            items={[
              { href: '/para-equipos', label: 'Para equipos', description: '¿Manejas un equipo dentro de la liga?' },
              { href: '/para-jugadores', label: 'Para jugadores', description: 'Tu carrera amateur, guardada.' },
            ]}
          />
        </div>
      </div>
    </>
  )
}
