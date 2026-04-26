import type { Metadata } from 'next'
import {
  BarChart3,
  Calendar,
  Send,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { SectionHeading } from '@/components/marketing/section-heading'
import { FeatureCard } from '@/components/marketing/feature-card'
import { CTASection } from '@/components/marketing/cta-section'
import { PainSolutionRow } from '@/components/marketing/pain-solution-row'
import { CrossLinkRow } from '@/components/marketing/cross-link-row'
import { MockFixture } from '@/components/marketing/mock-fixture'
import { MockPlayerStats } from '@/components/marketing/mock-player-stats'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

export const metadata: Metadata = {
  title: 'LaPizarra para equipos — Stats, asistencia y finanzas en un solo lugar.',
  description:
    'Maneja tu equipo amateur sin Excel. Carga los partidos, mira las estadísticas, confirma quién va y cobra la cancha. Pensado para canchas reales.',
}

export default function ParaEquiposPage() {
  return (
    <>
      <MarketingHero
        size="standard"
        eyebrow="Para equipos"
        titleTop="EL VESTUARIO,"
        titleBottomAccent="ORDENADO"
        subtitle="Carga los partidos, mira las stats, organiza la asistencia y cobra la cancha. Sin Excel ni grupos paralelos."
        primary={{ href: '/onboarding/create-team', label: 'Crear equipo' }}
        secondary={{ href: '/onboarding/join-team', label: 'Tengo un código' }}
        waitlist={{ audience: 'equipos', source: '/para-equipos' }}
      />

      <div className="max-w-3xl mx-auto px-4">
        <section className="py-16 md:py-20">
          <SectionHeading
            eyebrow="Lo que pasa hoy"
            title="Si manejas un equipo, esto te suena."
          />
          <div className="mt-2">
            <PainSolutionRow
              pain="Las estadísticas las lleva uno en una libreta. Cuando se va, se pierden."
              solution="Cada partido queda guardado con goles, asistencias, tarjetas — minuto a minuto."
            />
            <PainSolutionRow
              pain="Antes del partido pregunto cinco veces 'quiénes van' en el grupo."
              solution="Cada jugador confirma asistencia desde su teléfono. Tú ves quién va y quién no."
            />
            <PainSolutionRow
              pain="La cancha se cobra de a poco, alguien siempre debe, alguien siempre paga de más."
              solution="Cargas el cobro, se distribuye entre los confirmados, cada uno ve cuánto debe."
            />
            <PainSolutionRow
              pain="Después de tres años no me acuerdo cuántos goles hizo Pancho."
              solution="Histórico completo por jugador. Por temporada, por torneo, por lo que quieras."
            />
          </div>
        </section>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <section className="py-12 md:py-20">
          <SectionHeading
            eyebrow="Lo que incluye"
            title="Todo lo que necesita el capitán."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Calendar}
              title="Registro de partidos"
              description="Goles, asistencias, autogoles, amarillas, rojas. Goles del rival también."
            />
            <FeatureCard
              icon={BarChart3}
              title="Estadísticas del equipo"
              description="Tabla por jugador, desglose por temporada, comparativa entre partidos."
            />
            <FeatureCard
              icon={UserCheck}
              title="Asistencia"
              description="Lista de confirmados antes de cada partido. Quién va, quién no, quién no respondió."
            />
            <FeatureCard
              icon={Wallet}
              title="Finanzas"
              description="Cobros de cancha, deudas, pagos. Distribución automática entre los confirmados."
            />
            <FeatureCard
              icon={Send}
              title="Invitaciones"
              description="Por código o por link. El jugador se une en 10 segundos. Sin email."
            />
            <FeatureCard
              icon={Users}
              title="Plantilla viva"
              description="Altas, bajas, cambios de número. Histórico completo del paso de cada jugador."
            />
          </div>
        </section>
      </div>

      <section className="bg-card border-y border-border/30 py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <SectionHeading
            eyebrow="Así se ve"
            title="El post-partido, terminado."
            subtitle="Una vez que cargas el partido, las stats viven solas. No vuelves a tocar Excel."
          />
          <div className="space-y-3">
            <MockFixture finished />
            <MockPlayerStats />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        <CTASection
          variant="accent"
          title="Empieza a registrar tu próximo partido."
          description="Te toma menos que armar el line-up."
          primary={{ href: '/onboarding/create-team', label: 'Crear equipo' }}
          secondary={{ href: '/onboarding/join-team', label: 'Tengo un código' }}
        />

        <section className="pb-12">
          <div className="max-w-md mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
              ¿Aún no te decides?
            </p>
            <h3 className="font-display text-xl mb-4">
              Anótate y te mandamos guías para arrancar.
            </h3>
            <div className="text-left">
              <WaitlistForm
                audience="equipos"
                source="/para-equipos#newsletter"
                successCopy="Listo. En unos días te llega la primera guía."
              />
            </div>
          </div>
        </section>

        <div className="pb-12">
          <CrossLinkRow
            items={[
              { href: '/para-ligas', label: 'Para ligas', description: '¿Tu equipo está en una liga?' },
              { href: '/para-jugadores', label: 'Para jugadores', description: '¿Eres jugador y quieres tu perfil?' },
            ]}
          />
        </div>
      </div>
    </>
  )
}
