import type { ReactNode } from 'react'

export type BlogPost = {
  slug: string
  title: string
  summary: string
  publishedAt: string                  // ISO date (YYYY-MM-DD)
  author: string
  tags: string[]
  /** Body is plain JSX so we can compose freely without a markdown parser. */
  body: () => ReactNode
}

/**
 * Posts are intentionally hardcoded as TS data for V1: zero deps on a CMS or
 * markdown parser, and the team can iterate copy by editing this file. When
 * we hit ~10+ posts and need editorial workflow, migrate to Supabase or MDX.
 */
export const POSTS: BlogPost[] = [
  {
    slug: 'por-que-creamos-lapizarra',
    title: 'Por qué creamos LaPizarra',
    summary:
      'Una historia corta sobre fútbol amateur, libretas perdidas y demasiados grupos de WhatsApp.',
    publishedAt: '2026-04-26',
    author: 'Equipo LaPizarra',
    tags: ['producto'],
    body: () => (
      <>
        <p>
          Cualquiera que jugó al fútbol amateur conoce la escena: el capitán anota
          los goles en una libreta, el grupo de WhatsApp se llena de capturas de
          marcadores, alguien cobra la cancha y la mitad de los jugadores se olvida
          de pagar. La temporada termina y nadie recuerda quién fue el goleador.
        </p>
        <p>
          La memoria del equipo se pierde. Y con ella se pierden los datos que más
          nos importan: cuántos partidos jugamos, cuántos goles hicimos, quién no
          falla nunca, quién metió el gol del torneo.
        </p>
        <p>
          LaPizarra nace para que esos datos no se pierdan. Lo construimos
          mobile-first porque se usa en la cancha, no en una oficina. Lo hicimos
          gratis para los equipos porque el barrio entero tiene que poder entrar.
          Y lo abrimos a las ligas porque el organizador es el que más laburo se
          ahorra cuando todo está en un solo lugar.
        </p>
        <p>
          Esta es la versión 1. Hay mucho por hacer. Pero ya tenés equipos, partidos,
          stats, asistencia, finanzas y multi-equipo funcionando. Si organizás una
          liga, podés anotarte al waitlist de Pro Liga y te escribimos cuando se
          libere.
        </p>
        <p>
          Gracias por jugar.
        </p>
      </>
    ),
  },
  {
    slug: 'como-organizar-liga-amateur-sin-excel',
    title: 'Cómo organizar una liga amateur sin Excel',
    summary:
      'Una guía corta para organizadores que vienen del Excel, el WhatsApp y las capturas. Lo mínimo para arrancar bien una temporada.',
    publishedAt: '2026-04-26',
    author: 'Equipo LaPizarra',
    tags: ['guía', 'ligas'],
    body: () => (
      <>
        <p>
          Organizar una liga amateur cuesta horas que nadie ve. Armar el fixture,
          anotar resultados, calcular la tabla, comunicar todo. Si lo hacés en
          Excel y WhatsApp, esto te suena.
        </p>
        <h2>Lo mínimo para arrancar</h2>
        <ol>
          <li>
            <strong>Definí cuántos equipos van a participar.</strong> Para liga
            tradicional (todos contra todos), entre 6 y 12 equipos es manejable
            por temporada.
          </li>
          <li>
            <strong>Decidí el formato.</strong> Round-robin (todos contra todos),
            eliminación directa (bracket) o un mix de fase regular + playoffs.
            Cada uno tiene su lógica.
          </li>
          <li>
            <strong>Fijá las reglas de tabla.</strong> Puntos por victoria,
            empate y derrota. La mayoría usa 3-1-0, pero hay variantes.
          </li>
          <li>
            <strong>Compartí un calendario que todos vean.</strong> Si depende de
            que vos mandes capturas, vas a perder horas respondiendo a quién
            juega cuándo.
          </li>
        </ol>
        <h2>Por qué LaPizarra</h2>
        <p>
          Cuando creas una liga en LaPizarra, el flujo es así:
        </p>
        <ul>
          <li>Invitás equipos por link o código (sin email).</li>
          <li>Generás todas las fases del torneo en una sola acción (incluso las eliminatorias se autoconectan).</li>
          <li>Cada equipo carga su partido y la tabla se actualiza sola.</li>
          <li>Compartís la vista pública con un link y todos ven la liga sin loguearse.</li>
        </ul>
        <p>
          Eso reemplaza Excel + WhatsApp + capturas. Y libera tu domingo.
        </p>
        <h2>Una nota sobre Pro Liga</h2>
        <p>
          Hoy estamos en lista de espera. Cuando se abra, son $10.000 CLP/año por
          liga, con 30 días gratis. Anotate en la página{' '}
          <a href="/para-ligas">/para-ligas</a> y te avisamos.
        </p>
      </>
    ),
  },
  {
    slug: 'las-stats-que-importan',
    title: 'Las stats que importan en el fútbol amateur',
    summary:
      'Goles, asistencias, asistencia. Por qué medimos esas tres cosas — y qué dejamos afuera.',
    publishedAt: '2026-04-26',
    author: 'Equipo LaPizarra',
    tags: ['producto', 'stats'],
    body: () => (
      <>
        <p>
          Cuando arrancamos LaPizarra, una de las primeras decisiones fue qué medir.
          El fútbol profesional mide cien cosas: pases completados, expected goals,
          progresiones de balón, presión defensiva. En el amateur no se necesita
          eso. Se necesitan tres cosas:
        </p>
        <ol>
          <li><strong>Goles</strong> — quién mete y cuántos.</li>
          <li><strong>Asistencias</strong> — quién pasa el último pase.</li>
          <li><strong>Asistencia (al partido)</strong> — quién va y quién no.</li>
        </ol>
        <p>
          Con esas tres se cuenta toda la historia. El goleador del año, el jugador
          que falla, el equipo que tira más al arco, el manager que tiene que
          conseguir más gente para el sábado.
        </p>
        <h2>Lo que dejamos afuera (por ahora)</h2>
        <ul>
          <li>xG, mapas de calor, distancia recorrida — irrelevante en amateur.</li>
          <li>Promedios FIFA — el rating del jugador es subjetivo.</li>
          <li>Pases / posesión — no se mide bien sin video o tagging en vivo.</li>
        </ul>
        <h2>Tarjetas y autogoles</h2>
        <p>
          Sí los registramos porque afectan el partido y el histórico personal. Una
          roja que costó la final aparece en tu perfil. Un autogol también. La idea
          es que el dato sea verdadero, no maquillado.
        </p>
        <h2>Multi-equipo</h2>
        <p>
          Si jugás en dos equipos, tu perfil suma los números de ambos. Cuando
          cambies de equipo, tus stats van con vos. Es tu carrera amateur, no la del
          capitán que la anotaba en una libreta.
        </p>
      </>
    ),
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug)
}

export function getPostsSortedByDate(): BlogPost[] {
  return [...POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}
