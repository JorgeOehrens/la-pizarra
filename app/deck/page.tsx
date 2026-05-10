import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  Globe2,
  Goal,
  Hash,
  Instagram,
  Megaphone,
  Radio,
  Search,
  Smartphone,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'
import { DownloadDeckButton } from './download-button'

const PRINT_STYLES = `
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }

  html, body {
    background: #0a0a0a !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .no-print {
    display: none !important;
  }

  .deck-slide {
    page-break-after: always;
    page-break-inside: avoid;
    min-height: auto !important;
    height: 100vh;
    padding: 1.4cm 2cm !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
  }

  .deck-slide:last-of-type {
    page-break-after: auto;
  }

  /* Hide footnote anchor underlines in print */
  .deck-slide a {
    color: inherit !important;
    text-decoration: none !important;
  }

  /* Sources keep their own page */
  .deck-sources {
    page-break-before: always;
    padding: 1.4cm 2cm !important;
  }

  /* Container resets so flex centering still works on print page size */
  .deck-root, .deck-root > div, .deck-root section {
    max-width: none !important;
  }
}
`

const SOURCES = [
  {
    n: 1,
    label: 'FIFA — 265M jugadores en el mundo (Big Count)',
    url: 'https://condorperformance.com/wp-content/uploads/2020/02/emaga_9384_10704.pdf',
  },
  {
    n: 2,
    label: 'FIFA — 211 federaciones nacionales',
    url: 'https://www.statista.com/statistics/1283917/fifa-member-associations-region/',
  },
  {
    n: 3,
    label: 'UEFA — 650.000+ clubes registrados en Europa',
    url: 'https://sportssurge.alibaba.com/football/how-many-football-teams-is-there',
  },
  {
    n: 4,
    label: 'CBF Brasil — 20.000+ clubes registrados',
    url: 'https://sportssurge.alibaba.com/football/how-many-football-teams-is-there',
  },
  {
    n: 5,
    label: 'DFB Alemania — 25.000+ clubes',
    url: 'https://sportssurge.alibaba.com/football/how-many-football-teams-is-there',
  },
  {
    n: 6,
    label: 'IMARC — Soccer market US$56B (2024)',
    url: 'https://www.imarcgroup.com/football-market',
  },
  {
    n: 7,
    label: 'FutureData — Amateur League market US$10B → US$20B 2032 (CAGR 8%)',
    url: 'https://www.futuredatastats.com/amateur-league-market',
  },
  {
    n: 8,
    label: 'TeamSnap — 15M usuarios, US$57.7M ingresos',
    url: 'https://growjo.com/company/TeamSnap',
  },
  {
    n: 9,
    label: 'Pesquisa FAPESP — Várzea brasileña, fútbol amateur urbano',
    url: 'https://revistapesquisa.fapesp.br/en/how-urban-changes-are-redefining-amateur-soccer/',
  },
  {
    n: 10,
    label: 'US Soccer / SFIA — 14.1M jugadores 6+ años en EEUU (2023)',
    url: 'https://www.futuredatastats.com/soccer-market',
  },
  {
    n: 11,
    label: 'Wikipedia — Estructura del fútbol amateur en Argentina',
    url: 'https://en.wikipedia.org/wiki/Argentine_football_league_system',
  },
  {
    n: 12,
    label: 'VárzeaPédia — Enciclopedia de fútbol amateur de Brasil',
    url: 'https://www.varzeapedia.com.br/',
  },
]

function Footnote({ n }: { n: number | number[] }) {
  const arr = Array.isArray(n) ? n : [n]
  return (
    <sup className="text-[10px] text-accent ml-0.5 tabular-nums tracking-tight">
      {arr.map((x, i) => (
        <span key={x}>
          {i > 0 && ','}
          <a href={`#fuente-${x}`} className="hover:underline">
            {x}
          </a>
        </span>
      ))}
    </sup>
  )
}

function SlideTag({ index, total, eyebrow }: { index: number; total: number; eyebrow: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-[10px] uppercase tracking-[0.22em] text-accent font-medium tabular-nums">
        {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <span className="h-px flex-1 bg-border/40" />
      <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">{eyebrow}</span>
    </div>
  )
}

const TOTAL = 8

export default function DeckPage() {
  return (
    <div className="deck-root min-h-screen bg-background text-white">
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      {/* Floating header with brand + nav */}
      <header className="no-print sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="font-display text-lg tracking-tight whitespace-nowrap">
            LA<span className="text-accent">·</span>PIZARRA
          </Link>
          <div className="hidden md:flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
            <span>Deck</span>
            <span className="text-white/20">·</span>
            <span>2026</span>
          </div>
          <div className="flex items-center gap-2">
            <DownloadDeckButton />
            <Link
              href="/precios"
              className="hidden sm:inline text-[11px] uppercase tracking-[0.18em] text-white/70 hover:text-white"
            >
              Precios →
            </Link>
          </div>
        </div>
      </header>

      {/* SLIDE 01 — Cover */}
      <section className="deck-slide min-h-[92vh] flex flex-col justify-center px-4 md:px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <SlideTag index={1} total={TOTAL} eyebrow="Cover" />
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/40 mb-4">
          Fútbol amateur · 2026
        </p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.92] tracking-tight">
          LA
          <br />
          <span className="text-accent">PIZARRA</span>
        </h1>
        <p className="mt-8 text-xl md:text-2xl text-white/75 max-w-2xl leading-relaxed">
          La cancha tiene memoria. Cada partido, cada gol, cada plantilla — en un solo
          lugar.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <div className="bg-card border border-border/30 rounded-xl p-5">
            <p className="font-display text-3xl tabular-nums">265M</p>
            <p className="text-xs text-white/60 mt-1">
              Jugadores en el mundo
              <Footnote n={1} />
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-xl p-5">
            <p className="font-display text-3xl tabular-nums">300K+</p>
            <p className="text-xs text-white/60 mt-1">
              Equipos formales registrados
              <Footnote n={[3, 4, 5]} />
            </p>
          </div>
          <div className="bg-card border border-accent/40 rounded-xl p-5">
            <p className="font-display text-3xl tabular-nums text-accent">100K</p>
            <p className="text-xs text-white/80 mt-1">
              Ligas en LaPizarra · meta 2031
            </p>
          </div>
        </div>
      </section>

      <div className="no-print border-t border-border/30" />

      {/* SLIDE 02 — Problem */}
      <section className="deck-slide min-h-[92vh] flex flex-col justify-center px-4 md:px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <SlideTag index={2} total={TOTAL} eyebrow="El problema" />
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl">
          265 millones juegan al fútbol.<br />
          <span className="text-white/40">El 99% lo hace sin memoria.</span>
        </h2>
        <p className="mt-8 text-lg md:text-xl text-white/65 max-w-3xl leading-relaxed">
          La info de cada equipo amateur vive entre WhatsApp, una libreta, una planilla
          de Excel y la memoria del capitán. Cuando alguien deja el equipo, los datos
          se van con él.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <span className="font-display text-5xl text-accent tabular-nums">01</span>
            <h3 className="font-display text-xl mt-3 mb-2">Fixture en WhatsApp</h3>
            <p className="text-sm text-white/65 leading-relaxed">
              El calendario lo arma alguien en un grupo y nadie lo encuentra dos
              semanas después. Cada equipo manda resultados como puede: foto, audio,
              mensaje suelto.
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <span className="font-display text-5xl text-accent tabular-nums">02</span>
            <h3 className="font-display text-xl mt-3 mb-2">Tabla en Excel</h3>
            <p className="text-sm text-white/65 leading-relaxed">
              Alguien la calcula a mano. A la cuarta fecha hay errores. La tabla de
              goleadores casi nunca se mantiene. La liga termina sin saber quién metió
              cuántos goles.
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <span className="font-display text-5xl text-accent tabular-nums">03</span>
            <h3 className="font-display text-xl mt-3 mb-2">Sin historial</h3>
            <p className="text-sm text-white/65 leading-relaxed">
              El jugador cambia de equipo y empieza de cero. Las estadísticas de la
              temporada anterior se pierden. La continuidad entre temporadas no
              existe.
            </p>
          </div>
        </div>

        <p className="mt-10 text-sm text-white/50 max-w-2xl">
          El problema no es de software profesional —{' '}
          <span className="text-white">es de software <em>existente</em></span>. La
          mayoría de las ligas amateur del mundo nunca usaron una plataforma.
        </p>
      </section>

      <div className="no-print border-t border-border/30" />

      {/* SLIDE 03 — Market */}
      <section className="deck-slide min-h-[92vh] flex flex-col justify-center px-4 md:px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <SlideTag index={3} total={TOTAL} eyebrow="El mercado" />
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl">
          Mercado de US$10B.<br />
          <span className="text-accent">Creciendo 8% anual.</span>
        </h2>
        <p className="mt-8 text-lg md:text-xl text-white/65 max-w-3xl leading-relaxed">
          El segmento de "amateur leagues" como industria global mueve hoy unos
          US$10.000M, y proyecta US$20.000M al 2032 según FutureData
          <Footnote n={7} />. Casi todo ese gasto va a infraestructura física, no a
          software.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/30 rounded-2xl p-6 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">
              TAM
            </p>
            <p className="font-display text-5xl tabular-nums">US$56B</p>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              Mercado global de fútbol (2024). Crece a 4% anual hasta US$77B en 2032.
              <Footnote n={6} />
            </p>
          </div>
          <div className="bg-card border border-accent/40 rounded-2xl p-6 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent mb-2">
              SAM — Amateur leagues
            </p>
            <p className="font-display text-5xl tabular-nums text-accent">US$10B</p>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              Segmento de ligas amateur (2024). CAGR 8% hasta US$20B en 2032. Aquí
              jugamos.
              <Footnote n={7} />
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-6 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">
              SOM — Software para ligas
            </p>
            <p className="font-display text-5xl tabular-nums">~US$300M</p>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              Estimación: 100K ligas × ARPU mixto LaPizarra (US$700/año). Esto es
              nuestro target SOM a 5 años.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-card border border-border/30 rounded-2xl p-6 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-4">
            Equipos formales registrados (selección)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="font-display text-3xl tabular-nums">650K+</p>
              <p className="text-xs text-white/60 mt-1">
                Clubes en Europa (UEFA)
                <Footnote n={3} />
              </p>
            </div>
            <div>
              <p className="font-display text-3xl tabular-nums">25K</p>
              <p className="text-xs text-white/60 mt-1">
                Clubes en Alemania (DFB)
                <Footnote n={5} />
              </p>
            </div>
            <div>
              <p className="font-display text-3xl tabular-nums">20K+</p>
              <p className="text-xs text-white/60 mt-1">
                Clubes en Brasil (CBF)
                <Footnote n={4} />
              </p>
            </div>
            <div>
              <p className="font-display text-3xl tabular-nums">14.1M</p>
              <p className="text-xs text-white/60 mt-1">
                Jugadores en EE.UU.
                <Footnote n={10} />
              </p>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-5 leading-relaxed">
            Y eso es solo lo <em>formal</em>. La várzea brasileña — el fútbol de barrio
            que hace vibrar a São Paulo — moviliza miles de equipos extra-oficiales que
            no figuran en ningún registro de la CBF.
            <Footnote n={[9, 12]} />
          </p>
        </div>
      </section>

      <div className="no-print border-t border-border/30" />

      {/* SLIDE 04 — Solution */}
      <section className="deck-slide min-h-[92vh] flex flex-col justify-center px-4 md:px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <SlideTag index={4} total={TOTAL} eyebrow="La solución" />
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl">
          Tres capas.<br />
          <span className="text-white/40">Un solo producto.</span>
        </h2>
        <p className="mt-8 text-lg md:text-xl text-white/65 max-w-3xl leading-relaxed">
          Equipos y jugadores gratis (motor viral). Las ligas pagan porque ahí está el
          ahorro real de tiempo, y las federaciones pagan custom porque tienen
          requisitos formales.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <Users className="h-7 w-7 text-accent mb-4" />
            <h3 className="font-display text-2xl mb-2">Equipo · Jugador</h3>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              Plantilla, partidos, eventos, asistencia, finanzas del equipo,
              multi-equipo. Histórico portable del jugador.
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Free para siempre
            </p>
          </div>

          <div className="bg-card border border-accent/40 rounded-2xl p-6">
            <Trophy className="h-7 w-7 text-accent mb-4" />
            <h3 className="font-display text-2xl mb-2">Pro Liga</h3>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              Crear ligas, brackets, standings, top scorers, vista pública con marca,
              PDF, generador automático de torneo, soporte por email.
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
              US$500 / año / liga
            </p>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <Radio className="h-7 w-7 text-accent mb-4" />
            <h3 className="font-display text-2xl mb-2">Liga + Streaming</h3>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">
              Todo lo de Pro Liga + transmisión en vivo, on-demand, clips automáticos
              de goles, marca de agua y player embebido.
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">
              US$1.500 / año / liga
            </p>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-6 lg:col-span-3">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Sparkles className="h-7 w-7 text-accent shrink-0" />
              <div className="flex-1">
                <h3 className="font-display text-2xl mb-1">Federación</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Multi-liga, branding propio, dominio custom, boleta y factura,
                  reportería, soporte SLA, streaming incluido. Pricing custom.
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/60 md:text-right">
                US$3.500+ / año
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="no-print border-t border-border/30" />

      {/* SLIDE 05 — Pricing & Unit Economics */}
      <section className="deck-slide min-h-[92vh] flex flex-col justify-center px-4 md:px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <SlideTag index={5} total={TOTAL} eyebrow="Pricing & Unit Economics" />
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl">
          ARPU US$700.<br />
          <span className="text-accent">CAC bajo, margen alto.</span>
        </h2>
        <p className="mt-8 text-lg md:text-xl text-white/65 max-w-3xl leading-relaxed">
          Mix proyectado al milestone de 100K ligas: 70% Pro Liga, 25% Liga +
          Streaming, 5% Federación. ARPU mixto cerca de US$700/año.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">
              ARR target
            </p>
            <p className="font-display text-5xl tabular-nums">US$70M</p>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              100.000 ligas × ARPU US$700 mixto. SaaS, recurrente.
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">
              Margen bruto
            </p>
            <p className="font-display text-5xl tabular-nums">~78%</p>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              Software puro alto margen; streaming infra (~15%) reduce el margen del
              tier alto pero queda saludable.
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">
              CAC objetivo
            </p>
            <p className="font-display text-5xl tabular-nums">&lt;US$40</p>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              Crecimiento orgánico (SEO + viral player loop) baja el CAC por debajo del
              promedio SaaS B2B (US$200+).
            </p>
          </div>
        </div>

        <div className="mt-10 bg-card border border-border/30 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 text-[10px] uppercase tracking-[0.18em] text-white/40 px-6 py-3 border-b border-border/30">
            <div className="col-span-2">Plan</div>
            <div className="text-right">Precio CLP/año</div>
            <div className="text-right">Precio USD/año</div>
            <div className="text-right">Mix @ 100K</div>
          </div>
          <div className="grid grid-cols-5 px-6 py-4 text-sm border-b border-border/20">
            <div className="col-span-2 text-white/80">Free (Equipos + Jugadores)</div>
            <div className="text-right tabular-nums text-white/50">$0</div>
            <div className="text-right tabular-nums text-white/50">$0</div>
            <div className="text-right tabular-nums text-white/50">— motor viral</div>
          </div>
          <div className="grid grid-cols-5 px-6 py-4 text-sm border-b border-border/20">
            <div className="col-span-2 text-white">Pro Liga</div>
            <div className="text-right tabular-nums">$499.000</div>
            <div className="text-right tabular-nums text-white/70">~US$500</div>
            <div className="text-right tabular-nums text-accent">70.000 ligas</div>
          </div>
          <div className="grid grid-cols-5 px-6 py-4 text-sm border-b border-border/20">
            <div className="col-span-2 text-white">Liga + Streaming</div>
            <div className="text-right tabular-nums">$1.490.000</div>
            <div className="text-right tabular-nums text-white/70">~US$1.500</div>
            <div className="text-right tabular-nums text-accent">25.000 ligas</div>
          </div>
          <div className="grid grid-cols-5 px-6 py-4 text-sm">
            <div className="col-span-2 text-white">Federación</div>
            <div className="text-right tabular-nums">$3.500.000+</div>
            <div className="text-right tabular-nums text-white/70">~US$3.500+</div>
            <div className="text-right tabular-nums text-accent">5.000 orgs</div>
          </div>
        </div>

        <p className="mt-6 text-xs text-white/50 leading-relaxed">
          Conversiones referenciales a USD asumiendo CLP 1.000 = USD 1. Tipo de cambio
          real ajustable por país. La mezcla regional cambiará el ARPU absoluto pero no
          el orden de magnitud del ARR.
        </p>
      </section>

      <div className="no-print border-t border-border/30" />

      {/* SLIDE 06 — GTM */}
      <section className="deck-slide min-h-[92vh] flex flex-col justify-center px-4 md:px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <SlideTag index={6} total={TOTAL} eyebrow="Go-to-Market" />
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl">
          SEO. Instagram.<br />
          <span className="text-accent">Marketing por país.</span>
        </h2>
        <p className="mt-8 text-lg md:text-xl text-white/65 max-w-3xl leading-relaxed">
          La adquisición no necesita ser cara. El fútbol amateur ya tiene tráfico
          orgánico en buscadores y comunidades activas en redes — el trabajo es estar
          en el lugar correcto, en el idioma correcto.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <Search className="h-7 w-7 text-accent mb-4" />
            <h3 className="font-display text-xl mb-2">SEO por intent</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>"tabla liga amateur 2026", "fixture liga barrio"</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Páginas públicas de liga generan SEO infinito (long-tail).</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>1 liga = ~50 URLs indexables (perfiles, partidos, fixture).</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>10K ligas activas = 500K URLs en Google.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <Instagram className="h-7 w-7 text-accent mb-4" />
            <h3 className="font-display text-xl mb-2">Instagram & TikTok</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Reels de stats y goles compartibles desde la app.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Ligas postean clips automáticos = exposición de marca.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Cada jugador comparte sus stats post-partido (viral player loop).</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Public league embed funciona como creator content.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <Megaphone className="h-7 w-7 text-accent mb-4" />
            <h3 className="font-display text-xl mb-2">Outreach directo (B2B sales-led)</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>WhatsApp directo a organizadores de liga ICP.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Federaciones y ligas corporativas via mailing 1:1.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Onboarding asistido para los primeros 200 contratos.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <Globe2 className="h-7 w-7 text-accent mb-4" />
            <h3 className="font-display text-xl mb-2">Expansión geográfica</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Año 1: Chile + Argentina (CLP / ARS, MercadoPago).</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Año 2: Brasil (várzea), México, Perú.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Año 3: España + UK Sunday League + EE.UU. amateur.</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Año 4–5: resto de Europa, Asia y África.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 bg-card border border-accent/30 rounded-2xl p-6 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-accent mb-3">
            Funnel orgánico
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs text-white/70">
            <div className="bg-background border border-border/30 rounded-lg px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/40">1</p>
              <p className="text-sm font-medium text-white">Equipo crea cuenta</p>
              <p className="text-[10px] text-white/50">Free, sin email del jugador</p>
            </div>
            <div className="bg-background border border-border/30 rounded-lg px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/40">2</p>
              <p className="text-sm font-medium text-white">Jugadores se suman</p>
              <p className="text-[10px] text-white/50">~10 jugadores por equipo</p>
            </div>
            <div className="bg-background border border-border/30 rounded-lg px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/40">3</p>
              <p className="text-sm font-medium text-white">Comparten stats</p>
              <p className="text-[10px] text-white/50">IG/TikTok, viral player loop</p>
            </div>
            <div className="bg-background border border-border/30 rounded-lg px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/40">4</p>
              <p className="text-sm font-medium text-white">Liga descubre</p>
              <p className="text-[10px] text-white/50">Ya tiene equipos adentro</p>
            </div>
            <div className="bg-background border border-accent/40 rounded-lg px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-accent">5</p>
              <p className="text-sm font-medium text-white">Liga paga</p>
              <p className="text-[10px] text-white/50">Pro Liga / Streaming</p>
            </div>
          </div>
        </div>
      </section>

      <div className="no-print border-t border-border/30" />

      {/* SLIDE 07 — Comps & Why now */}
      <section className="deck-slide min-h-[92vh] flex flex-col justify-center px-4 md:px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <SlideTag index={7} total={TOTAL} eyebrow="Comparables · Why now" />
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl">
          TeamSnap: 15M usuarios.<br />
          <span className="text-white/40">LATAM no tiene su versión.</span>
        </h2>
        <p className="mt-8 text-lg md:text-xl text-white/65 max-w-3xl leading-relaxed">
          La oportunidad no es construir software para ligas — la categoría existe. La
          oportunidad es construir el producto que LATAM, España y mercados emergentes
          todavía no tienen.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">
              TeamSnap (US)
            </p>
            <p className="font-display text-3xl">15M usuarios</p>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              US$57.7M ingresos · US$61.8M levantados · 214 empleados · enfoque en
              youth sports en EE.UU.
              <Footnote n={8} />
            </p>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">
              SportsEngine (NBC)
            </p>
            <p className="font-display text-3xl">Parte de NBC</p>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              Parte de NBC Sports. Foco en clubes y federaciones youth en EE.UU. Sin
              presencia material en español.
            </p>
          </div>
          <div className="bg-card border border-accent/40 rounded-2xl p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent mb-2">
              LaPizarra
            </p>
            <p className="font-display text-3xl text-accent">Mobile-first · LATAM</p>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              En español, sin email para jugadores, mobile-first, con streaming
              integrado y diseñado para fútbol específicamente.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-4">
            Por qué ahora
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border/30 rounded-xl p-5 flex gap-4">
              <Smartphone className="h-6 w-6 text-accent shrink-0" />
              <div>
                <p className="font-medium text-sm">Penetración móvil &gt;80% en LATAM</p>
                <p className="text-xs text-white/60 mt-1">
                  Cada jugador tiene smartphone. La barrera "el capitán es el único
                  con la app" desapareció.
                </p>
              </div>
            </div>
            <div className="bg-card border border-border/30 rounded-xl p-5 flex gap-4">
              <Radio className="h-6 w-6 text-accent shrink-0" />
              <div>
                <p className="font-medium text-sm">Streaming barato (Mux, Cloudflare)</p>
                <p className="text-xs text-white/60 mt-1">
                  El costo de transmitir un partido de 90 min cayó a USD &lt;1. Ingest
                  RTMP es estándar.
                </p>
              </div>
            </div>
            <div className="bg-card border border-border/30 rounded-xl p-5 flex gap-4">
              <Wallet className="h-6 w-6 text-accent shrink-0" />
              <div>
                <p className="font-medium text-sm">Pagos digitales mainstream</p>
                <p className="text-xs text-white/60 mt-1">
                  MercadoPago, Pix, Stripe LATAM. Cobrar SaaS en pesos chilenos o
                  reales es plug-and-play en 2026.
                </p>
              </div>
            </div>
            <div className="bg-card border border-border/30 rounded-xl p-5 flex gap-4">
              <Sparkles className="h-6 w-6 text-accent shrink-0" />
              <div>
                <p className="font-medium text-sm">Mujeres +34% en 4 años</p>
                <p className="text-xs text-white/60 mt-1">
                  FIFA reporta +34% de equipos femeninos registrados 2020–2024. La
                  base de usuarios se duplica antes que el mercado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="no-print border-t border-border/30" />

      {/* SLIDE 08 — Plan */}
      <section className="deck-slide min-h-[92vh] flex flex-col justify-center px-4 md:px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <SlideTag index={8} total={TOTAL} eyebrow="El plan · 100K ligas" />
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl">
          100.000 ligas.<br />
          <span className="text-accent">5 años.</span>
        </h2>
        <p className="mt-8 text-lg md:text-xl text-white/65 max-w-3xl leading-relaxed">
          Hipótesis: si LaPizarra logra capturar el 1% del SAM amateur global a 5
          años, llegamos a US$70M ARR con un equipo lean. Cada milestone validable
          contra ratio de conversión, ARPU efectivo y CAC.
        </p>

        <div className="mt-12 space-y-3">
          <div className="bg-card border border-border/30 rounded-2xl p-5 flex items-start gap-5">
            <span className="font-display text-3xl text-accent tabular-nums shrink-0 w-20">
              Año 1
            </span>
            <div className="flex-1">
              <p className="font-medium">200 ligas pagas · CL + AR · ~US$140K ARR</p>
              <p className="text-sm text-white/60 mt-1">
                Lanzamiento Pro Liga. Pilotos manuales de Streaming. Stripe + MP en
                producción. Foco: validar conversión waitlist → pago.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-5 flex items-start gap-5">
            <span className="font-display text-3xl text-accent tabular-nums shrink-0 w-20">
              Año 2
            </span>
            <div className="flex-1">
              <p className="font-medium">5.000 ligas pagas · BR + MX + Perú · ~US$3.5M ARR</p>
              <p className="text-sm text-white/60 mt-1">
                Brasil entra en producción con Pix. Streaming GA. Primeras 10
                federaciones contratadas. Equipo a 8–10 personas.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-5 flex items-start gap-5">
            <span className="font-display text-3xl text-accent tabular-nums shrink-0 w-20">
              Año 3
            </span>
            <div className="flex-1">
              <p className="font-medium">25.000 ligas · España + UK · ~US$17M ARR</p>
              <p className="text-sm text-white/60 mt-1">
                Expansión Europa hispano y Sunday League. Localización
                multi-moneda/idioma. Partnership cámaras (Veo, Pixellot) firmado.
              </p>
            </div>
          </div>
          <div className="bg-card border border-border/30 rounded-2xl p-5 flex items-start gap-5">
            <span className="font-display text-3xl text-accent tabular-nums shrink-0 w-20">
              Año 4
            </span>
            <div className="flex-1">
              <p className="font-medium">60.000 ligas · resto de Europa · ~US$42M ARR</p>
              <p className="text-sm text-white/60 mt-1">
                Italia, Francia, Alemania amateur. Producto for-women dedicado.
                Equipo dist. con hubs LATAM + Europa.
              </p>
            </div>
          </div>
          <div className="bg-card border border-accent/40 rounded-2xl p-5 flex items-start gap-5">
            <span className="font-display text-3xl text-accent tabular-nums shrink-0 w-20">
              Año 5
            </span>
            <div className="flex-1">
              <p className="font-medium">
                <span className="text-accent">100.000 ligas</span> · global · ~US$70M ARR
              </p>
              <p className="text-sm text-white/60 mt-1">
                Asia (India, Japón amateur), África (Nigeria, Kenia), Oceanía. ~10M
                jugadores en plataforma. Ratio 1% del mercado addressable.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-accent text-accent-foreground rounded-2xl p-6 md:p-10">
          <p className="text-[10px] uppercase tracking-[0.22em] text-black/60 mb-3">
            La apuesta
          </p>
          <h3 className="font-display text-2xl md:text-4xl leading-tight max-w-3xl">
            El fútbol amateur es el deporte más jugado del planeta y el peor
            documentado. LaPizarra cambia eso — un partido a la vez, una liga a la
            vez, hasta llegar a 100K.
          </h3>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/precios"
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-display uppercase tracking-wide text-sm hover:bg-black/80 transition-colors"
            >
              Ver pricing detallado
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:hola@lapizarra.app?subject=LaPizarra%20%E2%80%94%20Inversi%C3%B3n%2FPartnership"
              className="inline-flex items-center justify-center gap-2 border border-black/20 text-black px-6 py-3 rounded-xl font-display uppercase tracking-wide text-sm hover:border-black/40 transition-colors"
            >
              Hablar con founders
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="deck-sources border-t border-border/30 px-4 md:px-6 py-16 max-w-6xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-6">
          Fuentes
        </p>
        <ol className="space-y-2 text-xs text-white/60">
          {SOURCES.map((s) => (
            <li key={s.n} id={`fuente-${s.n}`} className="flex gap-3 leading-relaxed">
              <span className="font-display text-accent tabular-nums shrink-0 w-6">
                {String(s.n).padStart(2, '0')}
              </span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white underline-offset-2 hover:underline"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-[10px] text-white/40 leading-relaxed max-w-2xl">
          Las cifras de TAM/SAM y proyecciones del mercado provienen de reportes de
          terceros (IMARC, FutureData, Statista, FIFA Big Count, asociaciones
          nacionales). Las proyecciones internas (mix de planes, ARR target, CAC) son
          asunciones del equipo, ajustables conforme avancen los pilotos. Documento
          interno — no para distribución pública.
        </p>
      </section>

      <footer className="no-print border-t border-border/30 px-4 md:px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
          LaPizarra · Deck 2026 · Confidencial
        </p>
        <div className="flex gap-4 text-[10px] uppercase tracking-[0.22em] text-white/50">
          <Link href="/" className="hover:text-white">
            Sitio
          </Link>
          <Link href="/precios" className="hover:text-white">
            Precios
          </Link>
          <a href="mailto:hola@lapizarra.app" className="hover:text-white">
            hola@lapizarra.app
          </a>
        </div>
      </footer>
    </div>
  )
}
