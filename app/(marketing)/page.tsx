import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  Goal,
  Mail,
  Plus,
  Radio,
  Smartphone,
  Trophy,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MarketingHero } from '@/components/marketing/marketing-hero'
import { SectionHeading } from '@/components/marketing/section-heading'
import { AudienceTile } from '@/components/marketing/audience-tile'
import { FeatureCard } from '@/components/marketing/feature-card'
import { CTASection } from '@/components/marketing/cta-section'
import { MockFixture } from '@/components/marketing/mock-fixture'
import { MockStandings } from '@/components/marketing/mock-standings'
import { MockBracket } from '@/components/marketing/mock-bracket'
import { HeroAppDemo } from '@/components/marketing/hero-app-demo'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

export const metadata: Metadata = {
  title: 'LaPizarra — Fútbol amateur, sin perder un partido.',
  description:
    'Equipos y jugadores gratis. Pro Liga $499K CLP/año. Liga + Streaming en vivo $1,49M CLP/año. Federación: pricing custom. Estadísticas, fixtures, asistencia y plata en un solo lugar.',
}

export default async function LandingPage() {
  // Logged-in users go straight to the app — no marketing noise.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/home')

  return (
    <>
      <MarketingHero
        size="tall"
        eyebrow="Fútbol amateur · 2026"
        titleTop="LA"
        titleBottomAccent="PIZARRA"
        subtitle="La cancha tiene memoria. Cada partido, cada gol, cada plantilla — en un solo lugar."
        primary={{ href: '/onboarding/create-team', label: 'Crear equipo' }}
        secondary={{ href: '/auth/login', label: 'Iniciar sesión' }}
        textLink={{ href: '/onboarding/join-team', label: 'Tengo un código de invitación' }}
        demo={<HeroAppDemo />}
      />

      <div className="max-w-5xl mx-auto px-4">
        {/* Audience tiles */}
        <section className="py-16 md:py-24">
          <SectionHeading
            eyebrow="¿Quién eres?"
            title="Elige por dónde empezar."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AudienceTile
              eyebrow="Organizadores"
              title="Manejo una liga"
              description="Fixtures, brackets, tabla y vista pública. Streaming en vivo opcional. Pro Liga desde $499.000 CLP/año."
              href="/para-ligas"
              icon={Trophy}
              tag={{ label: 'Lista de espera', tone: 'waitlist' }}
            />
            <AudienceTile
              eyebrow="Managers y capitanes"
              title="Manejo un equipo"
              description="Carga los partidos, mira las stats, organiza la lista. El vestuario, ordenado."
              href="/para-equipos"
              icon={Users}
              tag={{ label: 'Gratis', tone: 'free' }}
            />
            <AudienceTile
              eyebrow="Jugadores"
              title="Solo quiero mis números"
              description="Goles, asistencias, asistencia. Tu carrera amateur, guardada de verdad."
              href="/para-jugadores"
              icon={Goal}
              tag={{ label: 'Gratis', tone: 'free' }}
            />
          </div>
        </section>

        {/* Features grid */}
        <section className="py-12 md:py-20">
          <SectionHeading
            eyebrow="Lo que puedes hacer"
            title="Todo lo que pasa en la cancha, anotado."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Plus}
              title="Crear equipo en 1 minuto"
              description="Invita a tus jugadores por código o por link. Sin email, sin formularios largos."
            />
            <FeatureCard
              icon={Calendar}
              title="Registrar partidos"
              description="Goles, asistencias, autogoles, amarillas y rojas. Por minuto, por jugador."
            />
            <FeatureCard
              icon={BarChart3}
              title="Estadísticas automáticas"
              description="Las stats se calculan solas. Tabla, top scorers, top asistidores."
            />
            <FeatureCard
              icon={UserCheck}
              title="Asistencia"
              description="Confirma quién va al partido. Sin grupos de WhatsApp paralelos."
            />
            <FeatureCard
              icon={Users}
              title="Multi-equipo"
              description="¿Juegas en dos equipos? Tu perfil junta los números de los dos."
            />
            <FeatureCard
              icon={Wallet}
              title="Finanzas del equipo"
              description="Cobros de cancha, distribución por jugador, pagos. Sin planillas."
            />
            <FeatureCard
              icon={Trophy}
              title="Ligas con bracket"
              description="Llave eliminatoria que avanza sola. Vista pública compartible. Pro Liga $499K/año."
            />
            <FeatureCard
              icon={Radio}
              title="Streaming en vivo"
              description="Conecta tu cámara o celular y transmite cada partido. On-demand y clips de goles incluidos."
            />
            <FeatureCard
              icon={Smartphone}
              title="Mobile-first"
              description="Pensado para usar al lado de la cancha, no en una oficina."
            />
          </div>
        </section>
      </div>

      {/* Live mocks */}
      <section className="bg-card border-y border-border/30 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeading
            eyebrow="Ejemplo real"
            title="Así se ve una liga en vivo."
            subtitle="La vista pública es un link. Compártelo por WhatsApp y todos ven la tabla, los próximos partidos y los goleadores."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MockFixture />
            <MockStandings />
            <MockBracket />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        {/* Pricing teaser */}
        <section className="py-16 md:py-24">
          <SectionHeading
            eyebrow="Planes"
            title="Equipos gratis. Las ligas pagan por ahorrarse el trabajo."
            subtitle="Tres tiers: admin, admin + streaming, y federación a medida. Equipos y jugadores siempre gratis."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free */}
            <div className="bg-card border border-border/30 rounded-2xl p-6 flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
                Equipos y jugadores
              </p>
              <h3 className="font-display text-2xl leading-none">Free</h3>
              <p className="mt-3 font-display text-3xl tabular-nums">$0</p>
              <p className="text-[11px] text-white/40 mt-1">CLP / siempre</p>
              <ul className="mt-4 space-y-2 flex-1 text-xs">
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Equipos, partidos, stats</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Asistencia + finanzas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Multi-equipo</span>
                </li>
              </ul>
            </div>

            {/* Pro Liga */}
            <div className="relative bg-card border border-accent/40 rounded-2xl p-6 flex flex-col">
              <span className="absolute -top-3 left-5 inline-flex items-center bg-accent text-black px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium">
                Lista de espera
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
                Pro Liga
              </p>
              <h3 className="font-display text-2xl leading-none">Admin de liga</h3>
              <p className="mt-3 font-display text-3xl tabular-nums">$499.000</p>
              <p className="text-[11px] text-white/50 mt-1">
                CLP / año / liga · ~$41.500/mes
              </p>
              <ul className="mt-4 space-y-2 flex-1 text-xs">
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Brackets + standings + goleadores</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Vista pública con marca</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Auto-generador de torneo</span>
                </li>
              </ul>
            </div>

            {/* Liga + Streaming */}
            <div className="relative bg-card border border-border/30 rounded-2xl p-6 flex flex-col">
              <span className="absolute -top-3 left-5 inline-flex items-center bg-white/10 text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium">
                Lista de espera
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
                Liga + Streaming
              </p>
              <h3 className="font-display text-2xl leading-none">Liga en vivo</h3>
              <p className="mt-3 font-display text-3xl tabular-nums">$1.490.000</p>
              <p className="text-[11px] text-white/50 mt-1">
                CLP / año / liga · ~$124.000/mes
              </p>
              <ul className="mt-4 space-y-2 flex-1 text-xs">
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Todo lo de Pro Liga</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Transmisión en vivo + on-demand</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-white/75">Clips automáticos de goles</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Federación strip */}
          <div className="mt-4 bg-card border border-dashed border-border/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Mail className="h-5 w-5 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Federación, multi-liga o &gt;50 equipos</p>
              <p className="text-xs text-white/60 mt-0.5">
                Branding propio, boleta y factura, soporte SLA. Pricing custom según volumen.
              </p>
            </div>
            <a
              href="mailto:hola@lapizarra.app?subject=Federaci%C3%B3n%20%E2%80%94%20LaPizarra"
              className="text-xs text-accent underline whitespace-nowrap"
            >
              Escribinos →
            </a>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/precios"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white border border-white/15 hover:border-white/30 px-5 py-3 rounded-xl font-display uppercase tracking-wide transition-colors"
            >
              Ver todos los planes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <CTASection
          variant="accent"
          title="Empieza hoy. Crear equipo es gratis."
          description="Sin tarjeta, sin compromiso. Crea tu equipo, invita jugadores y empieza a anotar."
          primary={{ href: '/onboarding/create-team', label: 'Crear equipo' }}
          secondary={{ href: '/onboarding/join-team', label: 'Tengo un código' }}
        />

        {/* General newsletter waitlist */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-md mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
              Boletín
            </p>
            <h3 className="font-display text-xl mb-3">Sigue lo que estamos construyendo.</h3>
            <p className="text-sm text-white/60 mb-5">
              Avances de producto, novedades de Pro Liga y notas para canchas reales.
            </p>
            <WaitlistForm
              audience="general"
              source="/"
              compact
              successCopy="Anotado. Te escribimos cuando haya novedades."
              placeholder="tu@email.com"
            />
          </div>
        </section>

        {/* Quick links */}
        <section className="border-t border-border/30 pt-10 pb-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Conoce más
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/para-ligas"
              className="bg-card rounded-xl border border-border/30 p-4 hover:border-accent/30 transition-colors text-center"
            >
              <Trophy className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-xs text-white/80">Para ligas</p>
            </Link>
            <Link
              href="/para-equipos"
              className="bg-card rounded-xl border border-border/30 p-4 hover:border-accent/30 transition-colors text-center"
            >
              <Users className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-xs text-white/80">Para equipos</p>
            </Link>
            <Link
              href="/para-jugadores"
              className="bg-card rounded-xl border border-border/30 p-4 hover:border-accent/30 transition-colors text-center"
            >
              <Goal className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-xs text-white/80">Para jugadores</p>
            </Link>
            <Link
              href="/precios"
              className="bg-card rounded-xl border border-border/30 p-4 hover:border-accent/30 transition-colors text-center"
            >
              <Wallet className="h-5 w-5 text-accent mx-auto mb-2" />
              <p className="text-xs text-white/80">Precios</p>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
