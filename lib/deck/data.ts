/**
 * Single source of truth for the LaPizarra deck.
 * Edit numbers, prices, copy here — both the web view (/deck) and the
 * PDF version (/deck/print) consume from this file.
 */

export type DeckSource = {
  n: number
  label: string
  url: string
}

export const DECK_SOURCES: DeckSource[] = [
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

export const DECK_HEADLINE_STATS = {
  players: { value: '265M', label: 'Jugadores en el mundo', src: [1] },
  teams: { value: '300K+', label: 'Equipos formales registrados', src: [3, 4, 5] },
  target: { value: '100K', label: 'Ligas en LaPizarra · meta 2031' },
}

export const DECK_PROBLEM = {
  title: '265 millones juegan al fútbol.',
  subtitle: 'El 99% lo hace sin memoria.',
  body:
    'La info de cada equipo amateur vive entre WhatsApp, una libreta, una planilla de Excel y la memoria del capitán. Cuando alguien deja el equipo, los datos se van con él.',
  items: [
    {
      n: '01',
      title: 'Fixture en WhatsApp',
      body:
        'El calendario lo arma alguien en un grupo y nadie lo encuentra dos semanas después. Cada equipo manda resultados como puede: foto, audio, mensaje suelto.',
    },
    {
      n: '02',
      title: 'Tabla en Excel',
      body:
        'Alguien la calcula a mano. A la cuarta fecha hay errores. La tabla de goleadores casi nunca se mantiene. La liga termina sin saber quién metió cuántos goles.',
    },
    {
      n: '03',
      title: 'Sin historial',
      body:
        'El jugador cambia de equipo y empieza de cero. Las estadísticas de la temporada anterior se pierden. La continuidad entre temporadas no existe.',
    },
  ],
  closing:
    'El problema no es de software profesional — es de software existente. La mayoría de las ligas amateur del mundo nunca usaron una plataforma.',
}

export const DECK_MARKET = {
  title: 'Mercado de US$10B.',
  subtitle: 'Creciendo 8% anual.',
  body:
    'El segmento de "amateur leagues" como industria global mueve hoy unos US$10.000M, y proyecta US$20.000M al 2032 según FutureData. Casi todo ese gasto va a infraestructura física, no a software.',
  bodySrc: [7],
  tiers: [
    {
      label: 'TAM',
      value: 'US$56B',
      description:
        'Mercado global de fútbol (2024). Crece a 4% anual hasta US$77B en 2032.',
      src: [6],
      accent: false,
    },
    {
      label: 'SAM — Amateur leagues',
      value: 'US$10B',
      description:
        'Segmento de ligas amateur (2024). CAGR 8% hasta US$20B en 2032. Aquí jugamos.',
      src: [7],
      accent: true,
    },
    {
      label: 'SOM — Software para ligas',
      value: '~US$300M',
      description:
        'Estimación: 100K ligas × ARPU mixto LaPizarra (US$700/año). Esto es nuestro target SOM a 5 años.',
      src: [],
      accent: false,
    },
  ],
  regional: [
    { value: '650K+', label: 'Clubes en Europa (UEFA)', src: [3] },
    { value: '25K', label: 'Clubes en Alemania (DFB)', src: [5] },
    { value: '20K+', label: 'Clubes en Brasil (CBF)', src: [4] },
    { value: '14.1M', label: 'Jugadores en EE.UU.', src: [10] },
  ],
  regionalNote:
    'Y eso es solo lo formal. La várzea brasileña — el fútbol de barrio que hace vibrar a São Paulo — moviliza miles de equipos extra-oficiales que no figuran en ningún registro de la CBF.',
  regionalNoteSrc: [9, 12],
}

export const DECK_SOLUTION = {
  title: 'Tres capas.',
  subtitle: 'Un solo producto.',
  body:
    'Equipos y jugadores gratis (motor viral). Las ligas pagan porque ahí está el ahorro real de tiempo, y las federaciones pagan custom porque tienen requisitos formales.',
  tiers: [
    {
      title: 'Equipo · Jugador',
      body:
        'Plantilla, partidos, eventos, asistencia, finanzas del equipo, multi-equipo. Histórico portable del jugador.',
      price: 'Free para siempre',
      accent: false,
    },
    {
      title: 'Pro Liga',
      body:
        'Crear ligas, brackets, standings, top scorers, vista pública con marca, PDF, generador automático de torneo, soporte por email.',
      price: 'US$500 / año / liga',
      accent: true,
    },
    {
      title: 'Liga + Streaming',
      body:
        'Todo lo de Pro Liga + transmisión en vivo, on-demand, clips automáticos de goles, marca de agua y player embebido.',
      price: 'US$1.500 / año / liga',
      accent: false,
    },
  ],
  federation: {
    title: 'Federación',
    body:
      'Multi-liga, branding propio, dominio custom, boleta y factura, reportería, soporte SLA, streaming incluido. Pricing custom.',
    price: 'US$3.500+ / año',
  },
}

export const DECK_PRICING = {
  title: 'ARPU US$700.',
  subtitle: 'CAC bajo, margen alto.',
  body:
    'Mix proyectado al milestone de 100K ligas: 70% Pro Liga, 25% Liga + Streaming, 5% Federación. ARPU mixto cerca de US$700/año.',
  metrics: [
    {
      label: 'ARR target',
      value: 'US$70M',
      description: '100.000 ligas × ARPU US$700 mixto. SaaS, recurrente.',
    },
    {
      label: 'Margen bruto',
      value: '~78%',
      description:
        'Software puro alto margen; streaming infra (~15%) reduce el margen del tier alto pero queda saludable.',
    },
    {
      label: 'CAC objetivo',
      value: '<US$40',
      description:
        'Crecimiento orgánico (SEO + viral player loop) baja el CAC por debajo del promedio SaaS B2B (US$200+).',
    },
  ],
  table: [
    {
      plan: 'Free (Equipos + Jugadores)',
      clp: '$0',
      usd: '$0',
      mix: '— motor viral',
      muted: true,
    },
    {
      plan: 'Pro Liga',
      clp: '$499.000',
      usd: '~US$500',
      mix: '70.000 ligas',
      muted: false,
    },
    {
      plan: 'Liga + Streaming',
      clp: '$1.490.000',
      usd: '~US$1.500',
      mix: '25.000 ligas',
      muted: false,
    },
    {
      plan: 'Federación',
      clp: '$3.500.000+',
      usd: '~US$3.500+',
      mix: '5.000 orgs',
      muted: false,
    },
  ],
  footnote:
    'Conversiones referenciales a USD asumiendo CLP 1.000 = USD 1. Tipo de cambio real ajustable por país. La mezcla regional cambiará el ARPU absoluto pero no el orden de magnitud del ARR.',
}

export const DECK_GTM = {
  title: 'SEO. Instagram.',
  subtitle: 'Marketing por país.',
  body:
    'La adquisición no necesita ser cara. El fútbol amateur ya tiene tráfico orgánico en buscadores y comunidades activas en redes — el trabajo es estar en el lugar correcto, en el idioma correcto.',
  channels: [
    {
      title: 'SEO por intent',
      bullets: [
        '"tabla liga amateur 2026", "fixture liga barrio"',
        'Páginas públicas de liga generan SEO infinito (long-tail).',
        '1 liga = ~50 URLs indexables (perfiles, partidos, fixture).',
        '10K ligas activas = 500K URLs en Google.',
      ],
    },
    {
      title: 'Instagram & TikTok',
      bullets: [
        'Reels de stats y goles compartibles desde la app.',
        'Ligas postean clips automáticos = exposición de marca.',
        'Cada jugador comparte sus stats post-partido (viral player loop).',
        'Public league embed funciona como creator content.',
      ],
    },
    {
      title: 'Outreach directo (B2B sales-led)',
      bullets: [
        'WhatsApp directo a organizadores de liga ICP.',
        'Federaciones y ligas corporativas via mailing 1:1.',
        'Onboarding asistido para los primeros 200 contratos.',
      ],
    },
    {
      title: 'Expansión geográfica',
      bullets: [
        'Año 1: Chile + Argentina (CLP / ARS, MercadoPago).',
        'Año 2: Brasil (várzea), México, Perú.',
        'Año 3: España + UK Sunday League + EE.UU. amateur.',
        'Año 4–5: resto de Europa, Asia y África.',
      ],
    },
  ],
  funnel: [
    { n: 1, title: 'Equipo crea cuenta', sub: 'Free, sin email del jugador' },
    { n: 2, title: 'Jugadores se suman', sub: '~10 jugadores por equipo' },
    { n: 3, title: 'Comparten stats', sub: 'IG/TikTok, viral player loop' },
    { n: 4, title: 'Liga descubre', sub: 'Ya tiene equipos adentro' },
    { n: 5, title: 'Liga paga', sub: 'Pro Liga / Streaming', accent: true },
  ],
}

export const DECK_COMPS = {
  title: 'TeamSnap: 15M usuarios.',
  subtitle: 'LATAM no tiene su versión.',
  body:
    'La oportunidad no es construir software para ligas — la categoría existe. La oportunidad es construir el producto que LATAM, España y mercados emergentes todavía no tienen.',
  comps: [
    {
      label: 'TeamSnap (US)',
      headline: '15M usuarios',
      body:
        'US$57.7M ingresos · US$61.8M levantados · 214 empleados · enfoque en youth sports en EE.UU.',
      src: [8],
      accent: false,
    },
    {
      label: 'SportsEngine (NBC)',
      headline: 'Parte de NBC',
      body:
        'Parte de NBC Sports. Foco en clubes y federaciones youth en EE.UU. Sin presencia material en español.',
      src: [],
      accent: false,
    },
    {
      label: 'LaPizarra',
      headline: 'Mobile-first · LATAM',
      body:
        'En español, sin email para jugadores, mobile-first, con streaming integrado y diseñado para fútbol específicamente.',
      src: [],
      accent: true,
    },
  ],
  whyNow: [
    {
      title: 'Penetración móvil >80% en LATAM',
      body:
        'Cada jugador tiene smartphone. La barrera "el capitán es el único con la app" desapareció.',
    },
    {
      title: 'Streaming barato (Mux, Cloudflare)',
      body:
        'El costo de transmitir un partido de 90 min cayó a USD <1. Ingest RTMP es estándar.',
    },
    {
      title: 'Pagos digitales mainstream',
      body:
        'MercadoPago, Pix, Stripe LATAM. Cobrar SaaS en pesos chilenos o reales es plug-and-play en 2026.',
    },
    {
      title: 'Mujeres +34% en 4 años',
      body:
        'FIFA reporta +34% de equipos femeninos registrados 2020–2024. La base de usuarios se duplica antes que el mercado.',
    },
  ],
}

export const DECK_PLAN = {
  title: '100.000 ligas.',
  subtitle: '5 años.',
  body:
    'Hipótesis: si LaPizarra logra capturar el 1% del SAM amateur global a 5 años, llegamos a US$70M ARR con un equipo lean. Cada milestone validable contra ratio de conversión, ARPU efectivo y CAC.',
  milestones: [
    {
      year: 'Año 1',
      headline: '200 ligas pagas · CL + AR · ~US$140K ARR',
      body:
        'Lanzamiento Pro Liga. Pilotos manuales de Streaming. Stripe + MP en producción. Foco: validar conversión waitlist → pago.',
    },
    {
      year: 'Año 2',
      headline: '5.000 ligas pagas · BR + MX + Perú · ~US$3.5M ARR',
      body:
        'Brasil entra en producción con Pix. Streaming GA. Primeras 10 federaciones contratadas. Equipo a 8–10 personas.',
    },
    {
      year: 'Año 3',
      headline: '25.000 ligas · España + UK · ~US$17M ARR',
      body:
        'Expansión Europa hispano y Sunday League. Localización multi-moneda/idioma. Partnership cámaras (Veo, Pixellot) firmado.',
    },
    {
      year: 'Año 4',
      headline: '60.000 ligas · resto de Europa · ~US$42M ARR',
      body:
        'Italia, Francia, Alemania amateur. Producto for-women dedicado. Equipo dist. con hubs LATAM + Europa.',
    },
    {
      year: 'Año 5',
      headline: '100.000 ligas · global · ~US$70M ARR',
      body:
        'Asia (India, Japón amateur), África (Nigeria, Kenia), Oceanía. ~10M jugadores en plataforma. Ratio 1% del mercado addressable.',
      accent: true,
    },
  ],
  closing:
    'El fútbol amateur es el deporte más jugado del planeta y el peor documentado. LaPizarra cambia eso — un partido a la vez, una liga a la vez, hasta llegar a 100K.',
}
