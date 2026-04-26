import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PrintTrigger } from './print-trigger'

type Params = Promise<{ slug: string }>
type Search = Promise<{ season?: string }>

export const dynamic = 'force-dynamic'

const PRINT_CSS = `
  @page { size: A4; margin: 14mm 12mm; }
  @media print {
    /* Hide every element by default; reveal only the print container
       and its descendants. Robust against any layout wrapper. */
    body * { visibility: hidden !important; }
    .lapizarra-print-root, .lapizarra-print-root * { visibility: visible !important; }
    .lapizarra-print-root .no-print, .lapizarra-print-root .no-print * { visibility: hidden !important; }
    .lapizarra-print-root {
      position: absolute !important;
      left: 0; top: 0;
      width: 100%;
      background: white !important;
      color: #111 !important;
      padding: 0 !important;
    }
    html, body { background: white !important; }
  }
  .lapizarra-print-root {
    background: #fff;
    color: #111;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 100vh;
    padding: 16px;
  }
  .lapizarra-print-root .page { max-width: 720px; margin: 0 auto; padding: 12px 16px 60px; }
  .lapizarra-print-root .hero {
    display: flex; align-items: center; gap: 16px;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 18px;
  }
  .lapizarra-print-root .hero h1 { font-size: 28px; font-weight: 700; line-height: 1.05; margin: 0; }
  .lapizarra-print-root .hero p { font-size: 13px; opacity: .85; margin: 4px 0 0; max-width: 480px; }
  .lapizarra-print-root .meta { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: .7; margin-top: 4px; }
  .lapizarra-print-root .stage-title {
    font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.5px;
    color: #111; padding: 14px 0 6px;
    border-bottom: 1px solid #ddd; margin-bottom: 6px;
  }
  .lapizarra-print-root .row {
    display: grid; grid-template-columns: 78px 1fr 60px 1fr;
    gap: 12px; align-items: center;
    padding: 10px 0; border-bottom: 1px solid #eee;
    font-size: 13px;
  }
  .lapizarra-print-root .row .when { font-size: 11px; color: #555; line-height: 1.2; }
  .lapizarra-print-root .row .home { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
  .lapizarra-print-root .row .away { display: flex; align-items: center; gap: 8px; justify-content: flex-start; }
  .lapizarra-print-root .row .score { font-size: 18px; font-weight: 700; text-align: center; font-variant-numeric: tabular-nums; }
  .lapizarra-print-root .row .vs { font-size: 11px; text-transform: uppercase; color: #999; text-align: center; letter-spacing: 1.5px; }
  .lapizarra-print-root .badge {
    width: 22px; height: 22px; border-radius: 4px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; flex-shrink: 0;
  }
  .lapizarra-print-root .venue { grid-column: 2 / 5; font-size: 11px; color: #777; padding-left: 8px; padding-top: 2px; }
  .lapizarra-print-root .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .lapizarra-print-root .stat { text-align: center; padding: 10px; background: #f5f5f5; border-radius: 8px; }
  .lapizarra-print-root .stat .v { font-size: 22px; font-weight: 700; line-height: 1; }
  .lapizarra-print-root .stat .l { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-top: 4px; }
  .lapizarra-print-root .footer {
    margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd;
    font-size: 10px; color: #888; text-align: center;
  }
`

export default async function PrintFixturesPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  if (!features.leagues) redirect('/home')

  const [{ slug }, search] = await Promise.all([params, searchParams])
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, slug, logo_url, primary_color, secondary_color, description')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()
  if (!league) notFound()

  let seasonId: string | null = search.season ?? null
  let seasonName: string | null = null

  if (!seasonId) {
    const { data: currentSeason } = await supabase
      .from('seasons')
      .select('id, name')
      .eq('league_id', league.id)
      .eq('is_current', true)
      .maybeSingle()
    seasonId = currentSeason?.id ?? null
    seasonName = currentSeason?.name ?? null
  } else {
    const { data: s } = await supabase
      .from('seasons')
      .select('name')
      .eq('id', seasonId)
      .maybeSingle()
    seasonName = s?.name ?? null
  }

  const { data: rows } = await supabase.rpc('list_league_fixtures', {
    p_league_id: league.id,
    p_season_id: seasonId,
  })

  type FixtureRow = {
    id: string
    match_date: string
    status: string
    goals_for: number | null
    goals_against: number | null
    venue_custom: string | null
    stage_id: string | null
    stage_name: string | null
    stage_kind: string | null
    stage_sort: number | null
    home_id: string | null
    home_name: string | null
    home_logo: string | null
    home_primary: string | null
    home_secondary: string | null
    away_id: string | null
    away_name: string | null
    away_logo: string | null
    away_primary: string | null
    away_secondary: string | null
  }

  const fixtures = (rows ?? []) as FixtureRow[]

  const grouped = new Map<string, { name: string; sort: number; rows: FixtureRow[] }>()
  for (const r of fixtures) {
    const key = r.stage_id ?? '__none'
    const name = r.stage_name ?? 'Partidos sin fase'
    const sort = r.stage_sort ?? 9999
    if (!grouped.has(key)) grouped.set(key, { name, sort, rows: [] })
    grouped.get(key)!.rows.push(r)
  }
  const groups = Array.from(grouped.values()).sort((a, b) => a.sort - b.sort)

  const generatedAt = new Date()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="lapizarra-print-root">
        <PrintTrigger leagueName={league.name} />

        <div className="page">
          <div
            className="hero"
            style={{
              backgroundColor: league.primary_color || '#16a34a',
              color: league.secondary_color || '#ffffff',
            }}
          >
            {league.logo_url ? (
              <Image
                src={league.logo_url}
                alt={league.name}
                width={56}
                height={56}
                style={{ borderRadius: 12 }}
                unoptimized
              />
            ) : (
              <div
                style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: league.secondary_color || '#fff',
                  color: league.primary_color || '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700,
                }}
              >
                {league.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="meta">Fixture {seasonName ?? 'completo'}</p>
              <h1>{league.name}</h1>
              {league.description && <p>{league.description}</p>}
            </div>
          </div>

          <div className="summary">
            <div className="stat">
              <div className="v">{fixtures.length}</div>
              <div className="l">Partidos</div>
            </div>
            <div className="stat">
              <div className="v">{groups.length}</div>
              <div className="l">Fases</div>
            </div>
            <div className="stat">
              <div className="v">{fixtures.filter((f) => f.status === 'finished').length}</div>
              <div className="l">Jugados</div>
            </div>
          </div>

          {fixtures.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '40px 0', fontSize: 14 }}>
              No hay partidos en esta temporada.
            </p>
          ) : (
            groups.map((g, gi) => (
              <section key={gi} style={{ marginTop: gi === 0 ? 0 : 16 }}>
                <h2 className="stage-title">{g.name}</h2>
                {g.rows.map((f) => {
                  const dt = format(new Date(f.match_date), "EEE d MMM yyyy", { locale: es })
                  const time = format(new Date(f.match_date), 'HH:mm', { locale: es })
                  const isFinished = f.status === 'finished'
                  return (
                    <div key={f.id} className="row">
                      <div className="when">
                        <div>{dt}</div>
                        <div>{time}</div>
                      </div>
                      <div className="home">
                        <span style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>
                          {f.home_name ?? '—'}
                        </span>
                        {f.home_name && !f.home_logo && (
                          <span
                            className="badge"
                            style={{
                              background: f.home_primary ?? '#D7FF00',
                              color: f.home_secondary ?? '#000',
                            }}
                          >
                            {f.home_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        {f.home_logo && (
                          <Image src={f.home_logo} alt={f.home_name ?? ''} width={22} height={22} style={{ borderRadius: 4 }} unoptimized />
                        )}
                      </div>
                      <div>
                        {isFinished && f.goals_for != null && f.goals_against != null ? (
                          <span className="score">{f.goals_for} – {f.goals_against}</span>
                        ) : (
                          <span className="vs">vs</span>
                        )}
                      </div>
                      <div className="away">
                        {f.away_logo && (
                          <Image src={f.away_logo} alt={f.away_name ?? ''} width={22} height={22} style={{ borderRadius: 4 }} unoptimized />
                        )}
                        {f.away_name && !f.away_logo && (
                          <span
                            className="badge"
                            style={{
                              background: f.away_primary ?? '#D7FF00',
                              color: f.away_secondary ?? '#000',
                            }}
                          >
                            {f.away_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span style={{ flex: 1, fontWeight: 600 }}>{f.away_name ?? '—'}</span>
                      </div>
                      {f.venue_custom && (
                        <div className="venue">📍 {f.venue_custom}</div>
                      )}
                    </div>
                  )
                })}
              </section>
            ))
          )}

          <div className="footer">
            Generado el {format(generatedAt, "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })} · LaPizarra
          </div>
        </div>
      </div>
    </>
  )
}
