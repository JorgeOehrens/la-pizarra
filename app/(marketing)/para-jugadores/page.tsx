import type { Metadata } from 'next'
import {
  Calendar,
  Goal,
  Share2,
  Square,
  UserCheck,
  Users,
} from 'lucide-react'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { SectionHeading } from '@/components/marketing/section-heading'
import { FeatureCard } from '@/components/marketing/feature-card'
import { CTASection } from '@/components/marketing/cta-section'
import { PainSolutionRow } from '@/components/marketing/pain-solution-row'
import { CrossLinkRow } from '@/components/marketing/cross-link-row'
import { MockPlayerStats } from '@/components/marketing/mock-player-stats'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

export const metadata: Metadata = {
  title: 'LaPizarra para jugadores — Tu carrera amateur, guardada.',
  description:
    'Goles, asistencias, asistencia. Tu perfil junta los números de todos los equipos en los que juegas. Llévate tus stats para siempre.',
}

export default function ParaJugadoresPage() {
  return (
    <>
      <MarketingHero
        size="standard"
        eyebrow="Para jugadores"
        titleTop="TU CARRERA"
        titleBottomAccent="AMATEUR"
        subtitle="Cada gol, cada asistencia, cada partido. Tu perfil va contigo aunque cambies de equipo."
        primary={{ href: '/auth/signup', label: 'Crear cuenta' }}
        secondary={{ href: '/onboarding/join-team', label: 'Tengo un código' }}
        waitlist={{ audience: 'jugadores', source: '/para-jugadores' }}
      />

      <div className="max-w-3xl mx-auto px-4">
        <section className="py-16 md:py-20">
          <SectionHeading
            eyebrow="Lo que pasa hoy"
            title="Lo que hoy se pierde."
          />
          <div className="mt-2">
            <PainSolutionRow
              pain="Los goles del año pasado los recuerda solo el 9 que los hizo."
              solution="Cada gol queda registrado con minuto, asistencia y partido. Para siempre."
            />
            <PainSolutionRow
              pain="Cuando cambias de equipo, tus números se quedan en el otro lado."
              solution="Tu perfil es tuyo. Suma los números de todos los equipos en los que juegas."
            />
            <PainSolutionRow
              pain="No tienes un lugar serio donde mostrar lo que jugaste."
              solution="Perfil compartible, con estadísticas y partidos. Lo mandas por link."
            />
            <PainSolutionRow
              pain="Te invitan al partido por WhatsApp, te pierdes mensajes, llegas tarde."
              solution="Confirmas asistencia desde la app y la dirección de la cancha está ahí."
            />
          </div>
        </section>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <section className="py-12 md:py-20">
          <SectionHeading
            eyebrow="Tu perfil"
            title="Los números que importan."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Goal}
              title="Goles y asistencias"
              description="Por temporada, por equipo, por torneo. Promedio por partido."
            />
            <FeatureCard
              icon={UserCheck}
              title="Asistencia"
              description="Cuántos partidos jugaste, cuántos te perdiste, cuántos confirmaste a tiempo."
            />
            <FeatureCard
              icon={Square}
              title="Tarjetas"
              description="Amarillas, rojas, suspensiones. Histórico al día."
            />
            <FeatureCard
              icon={Users}
              title="Multi-equipo"
              description="¿Juegas en dos equipos? Tu perfil suma los números de los dos."
            />
            <FeatureCard
              icon={Calendar}
              title="Histórico"
              description="Cada partido que jugaste, por orden cronológico. No se borra."
            />
            <FeatureCard
              icon={Share2}
              title="Perfil portable"
              description="Lo compartes con un link. Sin que el otro tenga que crear cuenta."
            />
          </div>
        </section>
      </div>

      <section className="bg-card border-y border-border/30 py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4">
          <SectionHeading
            eyebrow="Así se ve"
            title="Tu pizarra."
            subtitle="Capturas reales de la app. Cada partido suma a tu histórico."
          />
          <MockPlayerStats />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        <CTASection
          variant="accent"
          title="Tus números, tus reglas."
          description="Crea tu cuenta o súmate al equipo de un amigo con un código."
          primary={{ href: '/auth/signup', label: 'Crear cuenta' }}
          secondary={{ href: '/onboarding/join-team', label: 'Tengo un código' }}
        />

        <section className="pb-12">
          <div className="max-w-md mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
              ¿Aún no tienes equipo?
            </p>
            <h3 className="font-display text-xl mb-4">
              Anótate y te avisamos cuando lleguen las novedades.
            </h3>
            <div className="text-left">
              <WaitlistForm
                audience="jugadores"
                source="/para-jugadores#newsletter"
                successCopy="Listo. Te avisamos cuando salga algo nuevo para jugadores."
              />
            </div>
          </div>
        </section>

        <div className="pb-12">
          <CrossLinkRow
            items={[
              { href: '/para-equipos', label: 'Para equipos', description: '¿Manejas el equipo?' },
              { href: '/para-ligas', label: 'Para ligas', description: '¿Organizas una liga?' },
            ]}
          />
        </div>
      </div>
    </>
  )
}
