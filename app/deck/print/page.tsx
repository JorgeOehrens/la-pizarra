import Link from 'next/link'
import { ChevronLeft, Check } from 'lucide-react'
import { MockStandings } from '@/components/marketing/mock-standings'
import { MockBracket } from '@/components/marketing/mock-bracket'
import { MockFixture } from '@/components/marketing/mock-fixture'
import { MockPlayerStats } from '@/components/marketing/mock-player-stats'
import {
  DECK_SOURCES,
  DECK_HEADLINE_STATS,
  DECK_PROBLEM,
  DECK_MARKET,
  DECK_SOLUTION,
  DECK_PRICING,
  DECK_GTM,
  DECK_COMPS,
  DECK_PLAN,
} from '@/lib/deck/data'

const TOTAL_PAGES = 15

const PRINT_CSS = `
:root {
  --bg: #0a0a0a;
  --fg: #ffffff;
  --muted: rgba(255,255,255,0.6);
  --dim: rgba(255,255,255,0.35);
  --border: rgba(255,255,255,0.14);
  --accent: #d2ff3a;
  --card: #141414;
}

.print-root {
  background: #1a1a1a;
  min-height: 100vh;
  padding: 24px 0;
}

.screen-toolbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(10,10,10,0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  padding: 10px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: var(--muted);
}

.print-page {
  width: 297mm;
  height: 210mm;
  background: var(--bg);
  color: var(--fg);
  margin: 0 auto 20px;
  padding: 12mm 16mm 11mm;
  box-sizing: border-box;
  box-shadow: 0 4px 30px rgba(0,0,0,0.5);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.45;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 7pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8mm;
  flex-shrink: 0;
}
.page-meta .rule { flex: 1; height: 1px; background: var(--border); }
.page-meta .label { color: var(--dim); }

.page-body { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.page-body.center { justify-content: center; }

.h1 { font-family: "Bebas Neue", "Oswald", "Inter", sans-serif; font-weight: 700; font-size: 44pt; line-height: 0.95; letter-spacing: -0.02em; }
.h1-accent { color: var(--accent); }
.h2 { font-family: "Bebas Neue", "Oswald", "Inter", sans-serif; font-weight: 700; font-size: 32pt; line-height: 0.95; letter-spacing: -0.02em; }
.h2 .muted { color: var(--dim); }
.lead { font-size: 11pt; color: var(--muted); margin-top: 6mm; max-width: 165mm; line-height: 1.5; }

.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 10mm; }
.stat { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 5mm 5mm; }
.stat.accent { border-color: rgba(210,255,58,0.45); }
.stat .num { font-family: "Bebas Neue", "Oswald", "Inter", sans-serif; font-size: 24pt; font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
.stat .num.accent { color: var(--accent); }
.stat .lbl { font-size: 8pt; color: var(--muted); margin-top: 1.5mm; line-height: 1.3; }

.problem-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 8mm; }
.problem-card { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 6mm; }
.problem-card .n { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 28pt; color: var(--accent); line-height: 1; font-weight: 700; }
.problem-card h3 { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 13pt; margin: 3mm 0 2mm; line-height: 1.1; }
.problem-card p { font-size: 9pt; color: var(--muted); line-height: 1.4; }

.tam-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 8mm; }
.tam-card { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 6mm; display: flex; flex-direction: column; }
.tam-card.accent { border-color: rgba(210,255,58,0.45); }
.tam-card .lbl { font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 3mm; }
.tam-card.accent .lbl { color: var(--accent); }
.tam-card .num { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 32pt; line-height: 1; font-weight: 700; letter-spacing: -0.02em; }
.tam-card.accent .num { color: var(--accent); }
.tam-card .desc { font-size: 9pt; color: var(--muted); margin-top: 3mm; line-height: 1.4; }

.regional-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; margin-top: 4mm; }
.regional .num { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 22pt; line-height: 1; font-weight: 700; }
.regional .lbl { font-size: 8.5pt; color: var(--muted); margin-top: 1.5mm; }

.solution-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 8mm; }
.sol-card { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 6mm; display: flex; flex-direction: column; }
.sol-card.accent { border-color: rgba(210,255,58,0.45); }
.sol-card h3 { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 16pt; line-height: 1.05; margin-bottom: 2.5mm; }
.sol-card .body { font-size: 9pt; color: var(--muted); line-height: 1.45; flex: 1; }
.sol-card .price { font-size: 8pt; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 4mm; color: var(--dim); }
.sol-card.accent .price { color: var(--accent); }

.fed-strip { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 5mm 6mm; margin-top: 5mm; display: flex; align-items: center; gap: 6mm; }
.fed-strip h3 { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 13pt; }
.fed-strip .body { font-size: 9pt; color: var(--muted); line-height: 1.4; flex: 1; }
.fed-strip .price { font-size: 8pt; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); white-space: nowrap; }

.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 10mm; }
.metric { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 6mm; }
.metric .lbl { font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 3mm; }
.metric .num { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 32pt; font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
.metric .desc { font-size: 9pt; color: var(--muted); margin-top: 3mm; line-height: 1.4; }

.price-table { width: 100%; border-collapse: collapse; margin-top: 8mm; background: var(--card); border: 1px solid var(--border); border-radius: 4mm; overflow: hidden; }
.price-table thead th { font-size: 7pt; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim); padding: 4mm 5mm; text-align: left; border-bottom: 1px solid var(--border); font-weight: 500; }
.price-table thead th.right { text-align: right; }
.price-table tbody td { padding: 4mm 5mm; font-size: 10pt; border-bottom: 1px solid rgba(255,255,255,0.06); }
.price-table tbody tr:last-child td { border-bottom: none; }
.price-table tbody td.right { text-align: right; font-variant-numeric: tabular-nums; }
.price-table tbody td.accent { color: var(--accent); }
.price-table tbody tr.muted td { color: var(--dim); }
.foot { font-size: 8pt; color: var(--dim); margin-top: 5mm; line-height: 1.5; }

.gtm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; margin-top: 8mm; }
.gtm-card { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 5mm 6mm; }
.gtm-card h3 { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 13pt; margin-bottom: 3mm; }
.gtm-card ul { list-style: none; margin: 0; padding: 0; }
.gtm-card li { font-size: 9pt; color: var(--muted); padding: 1.5mm 0; line-height: 1.4; display: flex; gap: 2mm; }
.gtm-card li::before { content: "✓"; color: var(--accent); flex-shrink: 0; font-weight: bold; }

.funnel { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3mm; margin-top: 8mm; }
.funnel-step { background: var(--card); border: 1px solid var(--border); border-radius: 3mm; padding: 4mm; }
.funnel-step.accent { border-color: rgba(210,255,58,0.45); }
.funnel-step .n { font-size: 7pt; color: var(--dim); }
.funnel-step.accent .n { color: var(--accent); }
.funnel-step h4 { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 11pt; margin: 2mm 0 1mm; line-height: 1.1; }
.funnel-step p { font-size: 8pt; color: var(--muted); line-height: 1.3; }

.whynow-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; margin-top: 8mm; }
.whynow-card { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 5mm 6mm; }
.whynow-card h3 { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 12pt; margin-bottom: 2mm; line-height: 1.15; }
.whynow-card p { font-size: 9pt; color: var(--muted); line-height: 1.45; }

.plan-rows { display: flex; flex-direction: column; gap: 3.5mm; margin-top: 8mm; }
.plan-row { background: var(--card); border: 1px solid var(--border); border-radius: 4mm; padding: 4mm 6mm; display: flex; align-items: flex-start; gap: 6mm; }
.plan-row.accent { border-color: rgba(210,255,58,0.45); }
.plan-row .yr { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 18pt; color: var(--accent); width: 22mm; flex-shrink: 0; line-height: 1; }
.plan-row .body h4 { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 12pt; line-height: 1.15; margin-bottom: 1.5mm; }
.plan-row .body h4 .accent { color: var(--accent); }
.plan-row .body p { font-size: 9pt; color: var(--muted); line-height: 1.4; }

.closing-band { background: var(--accent); color: #000; border-radius: 5mm; padding: 7mm 9mm; margin-top: 8mm; }
.closing-band .lbl { font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(0,0,0,0.6); margin-bottom: 3mm; }
.closing-band p { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 16pt; line-height: 1.2; max-width: 240mm; }

.product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 6mm; flex: 1; min-height: 0; }
.product-cell { display: flex; flex-direction: column; gap: 2mm; min-height: 0; }
.product-cell .label { font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); }
.product-cell .desc { font-size: 8.5pt; color: var(--muted); line-height: 1.4; margin-bottom: 1mm; }
.product-cell .mock-wrap { flex: 1; min-height: 0; display: flex; align-items: flex-start; transform-origin: top left; }
.product-cell .mock-wrap > * { width: 100%; }

.product-hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 8mm; margin-top: 4mm; flex: 1; min-height: 0; }
.product-hero .copy h3 { font-family: "Bebas Neue", "Oswald", sans-serif; font-size: 17pt; line-height: 1.1; margin-bottom: 3mm; }
.product-hero .copy p { font-size: 9.5pt; color: var(--muted); line-height: 1.5; margin-bottom: 4mm; }
.product-hero .copy ul { list-style: none; margin: 0; padding: 0; }
.product-hero .copy li { font-size: 9pt; color: var(--muted); padding: 1mm 0; line-height: 1.4; display: flex; gap: 2mm; }
.product-hero .copy li::before { content: "✓"; color: var(--accent); flex-shrink: 0; font-weight: bold; }
.product-hero .visual { display: flex; flex-direction: column; gap: 4mm; min-height: 0; justify-content: center; }
.product-hero .visual .label { font-size: 7pt; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); }

.sources-list { margin-top: 6mm; columns: 2; column-gap: 12mm; }
.sources-list li { font-size: 8.5pt; color: var(--muted); padding: 1.5mm 0; break-inside: avoid; line-height: 1.5; display: flex; gap: 3mm; }
.sources-list li .n { font-family: "Bebas Neue", "Oswald", sans-serif; color: var(--accent); width: 6mm; flex-shrink: 0; }
.sources-list li a { color: inherit; text-decoration: none; }
.sources-foot { margin-top: 8mm; font-size: 7.5pt; color: var(--dim); line-height: 1.5; max-width: 200mm; }

.page-num {
  position: absolute;
  bottom: 8mm;
  right: 16mm;
  font-size: 7pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--dim);
  font-variant-numeric: tabular-nums;
}

sup.fn {
  font-size: 6pt;
  color: var(--accent);
  margin-left: 1pt;
  vertical-align: super;
  font-variant-numeric: tabular-nums;
}

@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg) !important;
    color: var(--fg) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .print-root {
    background: var(--bg) !important;
    padding: 0 !important;
  }
  .no-print, .screen-toolbar { display: none !important; }
  .print-page {
    margin: 0 !important;
    box-shadow: none !important;
    page-break-after: always;
    page-break-inside: avoid;
    break-after: page;
    break-inside: avoid;
  }
  .print-page:last-of-type {
    page-break-after: auto;
    break-after: auto;
  }
}
`

function Fn({ n }: { n?: number[] }) {
  if (!n || n.length === 0) return null
  return <sup className="fn">{n.join(',')}</sup>
}

function PageMeta({ label, n }: { label: string; n: number }) {
  return (
    <div className="page-meta">
      <span>{String(n).padStart(2, '0')} / {String(TOTAL_PAGES).padStart(2, '0')}</span>
      <span className="rule" />
      <span className="label">{label}</span>
    </div>
  )
}

function PageNum({ n }: { n: number }) {
  return <div className="page-num">{String(n).padStart(2, '0')} · LaPizarra Deck</div>
}

export default function DeckPrintPage() {
  return (
    <div className="print-root">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="screen-toolbar no-print">
        <Link href="/deck" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff', textDecoration: 'none' }}>
          <ChevronLeft size={14} /> Volver al deck
        </Link>
        <span>Versión PDF · A4 landscape · 15 páginas</span>
        <span style={{ color: 'var(--accent)' }}>Cmd/Ctrl + P para reimprimir</span>
      </div>

      {/* PAGE 1 — Cover */}
      <div className="print-page">
        <PageMeta label="Cover" n={1} />
        <div className="page-body center">
          <p style={{ fontSize: '7.5pt', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '4mm' }}>
            Fútbol amateur · 2026
          </p>
          <h1 className="h1" style={{ fontSize: '78pt' }}>
            LA<br />
            <span className="h1-accent">PIZARRA</span>
          </h1>
          <p className="lead" style={{ fontSize: '14pt', maxWidth: '160mm', marginTop: '8mm' }}>
            La cancha tiene memoria. Cada partido, cada gol, cada plantilla — en un solo lugar.
          </p>
          <div className="stat-row" style={{ maxWidth: '170mm' }}>
            <div className="stat">
              <p className="num">{DECK_HEADLINE_STATS.players.value}</p>
              <p className="lbl">{DECK_HEADLINE_STATS.players.label}<Fn n={DECK_HEADLINE_STATS.players.src} /></p>
            </div>
            <div className="stat">
              <p className="num">{DECK_HEADLINE_STATS.teams.value}</p>
              <p className="lbl">{DECK_HEADLINE_STATS.teams.label}<Fn n={DECK_HEADLINE_STATS.teams.src} /></p>
            </div>
            <div className="stat accent">
              <p className="num accent">{DECK_HEADLINE_STATS.target.value}</p>
              <p className="lbl">{DECK_HEADLINE_STATS.target.label}</p>
            </div>
          </div>
        </div>
        <PageNum n={1} />
      </div>

      {/* PAGE 2 — Problem */}
      <div className="print-page">
        <PageMeta label="El problema" n={2} />
        <div className="page-body">
          <h2 className="h2">
            {DECK_PROBLEM.title}<br />
            <span className="muted">{DECK_PROBLEM.subtitle}</span>
          </h2>
          <p className="lead">{DECK_PROBLEM.body}</p>
          <div className="problem-grid">
            {DECK_PROBLEM.items.map((it) => (
              <div key={it.n} className="problem-card">
                <span className="n">{it.n}</span>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
          <p className="foot" style={{ marginTop: '6mm' }}>{DECK_PROBLEM.closing}</p>
        </div>
        <PageNum n={2} />
      </div>

      {/* PAGE 3 — Market: TAM / SAM / SOM */}
      <div className="print-page">
        <PageMeta label="El mercado" n={3} />
        <div className="page-body">
          <h2 className="h2">
            {DECK_MARKET.title}<br />
            <span style={{ color: 'var(--accent)' }}>{DECK_MARKET.subtitle}</span>
          </h2>
          <p className="lead">
            {DECK_MARKET.body}
            <Fn n={DECK_MARKET.bodySrc} />
          </p>
          <div className="tam-grid">
            {DECK_MARKET.tiers.map((t) => (
              <div key={t.label} className={`tam-card${t.accent ? ' accent' : ''}`}>
                <p className="lbl">{t.label}</p>
                <p className="num">{t.value}</p>
                <p className="desc">{t.description}<Fn n={t.src} /></p>
              </div>
            ))}
          </div>
        </div>
        <PageNum n={3} />
      </div>

      {/* PAGE 4 — Market: regional breakdown */}
      <div className="print-page">
        <PageMeta label="El mercado · regional" n={4} />
        <div className="page-body">
          <h2 className="h2">Equipos formales registrados.</h2>
          <p className="lead">Una muestra de los registros más sólidos a nivel global. Lo "informal" excede ampliamente estos números.</p>
          <div className="regional-grid">
            {DECK_MARKET.regional.map((r) => (
              <div key={r.label} className="stat regional">
                <p className="num">{r.value}</p>
                <p className="lbl">{r.label}<Fn n={r.src} /></p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '8mm', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4mm', padding: '6mm 7mm' }}>
            <p style={{ fontSize: '10pt', color: 'var(--muted)', lineHeight: 1.55 }}>
              {DECK_MARKET.regionalNote}
              <Fn n={DECK_MARKET.regionalNoteSrc} />
            </p>
          </div>
        </div>
        <PageNum n={4} />
      </div>

      {/* PAGE 5 — Solution */}
      <div className="print-page">
        <PageMeta label="La solución" n={5} />
        <div className="page-body">
          <h2 className="h2">
            {DECK_SOLUTION.title}<br />
            <span className="muted">{DECK_SOLUTION.subtitle}</span>
          </h2>
          <p className="lead">{DECK_SOLUTION.body}</p>
          <div className="solution-grid">
            {DECK_SOLUTION.tiers.map((t) => (
              <div key={t.title} className={`sol-card${t.accent ? ' accent' : ''}`}>
                <h3>{t.title}</h3>
                <p className="body">{t.body}</p>
                <p className="price">{t.price}</p>
              </div>
            ))}
          </div>
          <div className="fed-strip">
            <div style={{ flex: 1 }}>
              <h3>{DECK_SOLUTION.federation.title}</h3>
              <p className="body">{DECK_SOLUTION.federation.body}</p>
            </div>
            <p className="price">{DECK_SOLUTION.federation.price}</p>
          </div>
        </div>
        <PageNum n={5} />
      </div>

      {/* PAGE 6 — Producto · Equipo & Jugador */}
      <div className="print-page">
        <PageMeta label="Producto · equipo & jugador" n={6} />
        <div className="page-body">
          <h2 className="h2">
            La carrera del jugador,<br />
            <span style={{ color: 'var(--accent)' }}>guardada en serio.</span>
          </h2>
          <p className="lead">
            El equipo carga partidos en segundos. Cada jugador acumula goles,
            asistencias y asistencia que viajan con él entre temporadas y
            equipos.
          </p>
          <div className="product-hero">
            <div className="copy">
              <h3>Equipo · plantilla viva</h3>
              <p>
                Un capitán arma el equipo, invita por link sin pedir email a los
                jugadores, y empieza a registrar partidos el mismo día.
              </p>
              <ul>
                <li>Plantilla con foto, dorsal y posición</li>
                <li>Goles, asistencias, autogoles, amarillas y rojas por minuto</li>
                <li>Asistencia confirmada por jugador en cada partido</li>
                <li>Finanzas del equipo: cobros con distribución automática</li>
              </ul>
            </div>
            <div className="visual">
              <p className="label">Mi carrera · MockPlayerStats</p>
              <MockPlayerStats />
              <p className="label" style={{ marginTop: '1mm' }}>Próximo partido</p>
              <MockFixture />
            </div>
          </div>
        </div>
        <PageNum n={6} />
      </div>

      {/* PAGE 7 — Producto · Liga */}
      <div className="print-page">
        <PageMeta label="Producto · liga" n={7} />
        <div className="page-body">
          <h2 className="h2">
            La liga, sin Excel<br />
            <span className="muted">y sin grupos de WhatsApp paralelos.</span>
          </h2>
          <p className="lead">
            La tabla y el bracket se calculan solos cada vez que un equipo
            cierra un partido. La vista pública es un link compartible —
            sin login, sin instalar nada.
          </p>
          <div className="product-hero">
            <div className="visual">
              <p className="label">Tabla en vivo</p>
              <MockStandings />
            </div>
            <div className="visual">
              <p className="label">Llave eliminatoria</p>
              <MockBracket />
            </div>
          </div>
        </div>
        <PageNum n={7} />
      </div>

      {/* PAGE 8 — Pricing metrics */}
      <div className="print-page">
        <PageMeta label="Pricing & Unit Economics" n={8} />
        <div className="page-body">
          <h2 className="h2">
            {DECK_PRICING.title}<br />
            <span style={{ color: 'var(--accent)' }}>{DECK_PRICING.subtitle}</span>
          </h2>
          <p className="lead">{DECK_PRICING.body}</p>
          <div className="metric-grid">
            {DECK_PRICING.metrics.map((m) => (
              <div key={m.label} className="metric">
                <p className="lbl">{m.label}</p>
                <p className="num">{m.value}</p>
                <p className="desc">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
        <PageNum n={8} />
      </div>

      {/* PAGE 7 — Pricing table */}
      <div className="print-page">
        <PageMeta label="Pricing · tabla detallada" n={9} />
        <div className="page-body">
          <h2 className="h2">El detalle por plan.</h2>
          <p className="lead">Mix proyectado al milestone de 100K ligas. Conversiones referenciales — el ARPU absoluto se ajusta por país.</p>
          <table className="price-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th className="right">Precio CLP/año</th>
                <th className="right">Precio USD/año</th>
                <th className="right">Mix @ 100K</th>
              </tr>
            </thead>
            <tbody>
              {DECK_PRICING.table.map((row) => (
                <tr key={row.plan} className={row.muted ? 'muted' : ''}>
                  <td>{row.plan}</td>
                  <td className="right">{row.clp}</td>
                  <td className="right">{row.usd}</td>
                  <td className={`right${row.muted ? '' : ' accent'}`}>{row.mix}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="foot">{DECK_PRICING.footnote}</p>
        </div>
        <PageNum n={9} />
      </div>

      {/* PAGE 8 — GTM channels */}
      <div className="print-page">
        <PageMeta label="Go-to-Market · canales" n={10} />
        <div className="page-body">
          <h2 className="h2">
            {DECK_GTM.title}<br />
            <span style={{ color: 'var(--accent)' }}>{DECK_GTM.subtitle}</span>
          </h2>
          <p className="lead">{DECK_GTM.body}</p>
          <div className="gtm-grid">
            {DECK_GTM.channels.map((c) => (
              <div key={c.title} className="gtm-card">
                <h3>{c.title}</h3>
                <ul>
                  {c.bullets.map((b, i) => (
                    <li key={i}><span>{b}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <PageNum n={10} />
      </div>

      {/* PAGE 9 — GTM funnel */}
      <div className="print-page">
        <PageMeta label="Go-to-Market · funnel orgánico" n={11} />
        <div className="page-body">
          <h2 className="h2">
            Del equipo gratis<br />
            <span style={{ color: 'var(--accent)' }}>a la liga que paga.</span>
          </h2>
          <p className="lead">El motor viral arranca en el equipo, recorre al jugador y termina en la liga. Cinco pasos, sin ad spend.</p>
          <div className="funnel">
            {DECK_GTM.funnel.map((f) => (
              <div key={f.n} className={`funnel-step${f.accent ? ' accent' : ''}`}>
                <p className="n">{String(f.n).padStart(2, '0')}</p>
                <h4>{f.title}</h4>
                <p>{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
        <PageNum n={11} />
      </div>

      {/* PAGE 10 — Comparables */}
      <div className="print-page">
        <PageMeta label="Comparables" n={12} />
        <div className="page-body">
          <h2 className="h2">
            {DECK_COMPS.title}<br />
            <span className="muted">{DECK_COMPS.subtitle}</span>
          </h2>
          <p className="lead">{DECK_COMPS.body}</p>
          <div className="solution-grid">
            {DECK_COMPS.comps.map((c) => (
              <div key={c.label} className={`sol-card${c.accent ? ' accent' : ''}`}>
                <p className="price" style={{ marginTop: 0, marginBottom: '2mm' }}>{c.label}</p>
                <h3>{c.headline}</h3>
                <p className="body">{c.body}<Fn n={c.src} /></p>
              </div>
            ))}
          </div>
        </div>
        <PageNum n={12} />
      </div>

      {/* PAGE 11 — Why now */}
      <div className="print-page">
        <PageMeta label="Why now" n={13} />
        <div className="page-body">
          <h2 className="h2">Las cuatro razones de timing.</h2>
          <p className="lead">El producto ya no requiere apuestas tecnológicas: cada componente clave está commoditizado en 2026. La oportunidad es de ejecución y distribución.</p>
          <div className="whynow-grid">
            {DECK_COMPS.whyNow.map((w) => (
              <div key={w.title} className="whynow-card">
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
        <PageNum n={13} />
      </div>

      {/* PAGE 12 — Plan */}
      <div className="print-page">
        <PageMeta label="El plan · 100K ligas" n={14} />
        <div className="page-body">
          <h2 className="h2">
            {DECK_PLAN.title}<br />
            <span style={{ color: 'var(--accent)' }}>{DECK_PLAN.subtitle}</span>
          </h2>
          <p className="lead">{DECK_PLAN.body}</p>
          <div className="plan-rows">
            {DECK_PLAN.milestones.map((m) => (
              <div key={m.year} className={`plan-row${m.accent ? ' accent' : ''}`}>
                <span className="yr">{m.year}</span>
                <div className="body">
                  <h4>{m.headline}</h4>
                  <p>{m.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <PageNum n={14} />
      </div>

      {/* PAGE 13 — Sources */}
      <div className="print-page">
        <PageMeta label="Fuentes" n={15} />
        <div className="page-body">
          <h2 className="h2">Fuentes & disclaimer.</h2>
          <ol className="sources-list">
            {DECK_SOURCES.map((s) => (
              <li key={s.n}>
                <span className="n">{String(s.n).padStart(2, '0')}</span>
                <a href={s.url}>{s.label}</a>
              </li>
            ))}
          </ol>
          <p className="sources-foot">
            Cifras de TAM/SAM y proyecciones provienen de reportes de terceros (IMARC, FutureData, Statista, FIFA Big Count, asociaciones nacionales). Las proyecciones internas (mix de planes, ARR target, CAC) son asunciones del equipo, ajustables conforme avancen los pilotos. Documento interno — no para distribución pública.
          </p>
        </div>
        <PageNum n={15} />
      </div>
    </div>
  )
}
