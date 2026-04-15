# LaPizarra — Knowledge Base

> Sistema de planificación e implementación para LaPizarra, web app mobile-first para equipos de fútbol amateur.

---

## Qué es LaPizarra

LaPizarra resuelve un problema real en el fútbol amateur: **la información de los equipos está fragmentada** entre WhatsApp, planillas de papel y la memoria de los jugadores. No hay historial, no hay estadísticas, no hay continuidad entre temporadas.

**Propuesta de valor:** Una plataforma centralizada, simple e intuitiva, pensada para la cancha — que permite registrar equipos, partidos, goles y construir el historial de cada jugador.

---

## Principios de Producto

1. **Mobile-first, siempre** — Diseñado para usarse en el vestuario, en el banco, en la cancha.
2. **Simple sobre completo** — Mejor hacer pocas cosas bien que muchas a medias.
3. **Sin fricción de onboarding** — No se requiere email. Registro mínimo.
4. **Datos que perduran** — El historial es el activo principal del producto.
5. **Escalable hacia liga** — El MVP es por equipo; el futuro es gestión de ligas completas.

---

## Agentes del Sistema

| Agente | Archivo | Responsabilidad |
|--------|---------|-----------------|
| Product Agent | [[01-Product/MVP-Scope]] | Alcance, prioridades, user stories |
| System Architect Agent | [[02-Architecture/System-Architecture]] | Stack, módulos, relaciones |
| Database Agent | [[03-Database/Schema]] | Supabase schema completo |
| Auth & Flow Agent | [[04-Auth/Auth-Flow]] | Registro, invitaciones, roles |
| Match & Stats Agent | [[05-Matches/Match-Model]] | Partidos, eventos, estadísticas |
| Implementation Planner | [[07-Roadmap/Phases]] | Fases, orden, prioridades |
| Documentation Agent | [[00-Overview/Index]] | Esta knowledge base |

---

## Navegación

- [[01-Product/MVP-Scope]] — Qué construimos en el MVP
- [[01-Product/User-Stories]] — Flujos de usuario concretos
- [[02-Architecture/System-Architecture]] — Cómo está construido
- [[02-Architecture/Tech-Stack]] — Decisiones de tecnología
- [[03-Database/Schema]] — Modelo de datos completo
- [[03-Database/RLS-Policies]] — Seguridad a nivel de fila
- [[04-Auth/Auth-Flow]] — Cómo se registran los usuarios
- [[04-Auth/Invitations]] — Sistema de invitaciones
- [[05-Matches/Match-Model]] — Modelo de partidos
- [[05-Matches/Events-Model]] — Goles, asistencias, autogoles
- [[06-Stats/Stats-Model]] — Estadísticas por jugador y equipo
- [[06-Stats/Calculations]] — Cómo se calculan las stats
- [[07-Roadmap/Phases]] — Fases de implementación
- [[07-Roadmap/MVP-Checklist]] — Checklist de MVP
- [[08-Decisions/ADR-001-Auth]] — Decisión: sin email auth
- [[08-Decisions/ADR-002-Database]] — Decisión: Supabase
- [[08-Decisions/ADR-003-Stack]] — Decisión: Next.js + Supabase
- [[09-Open-Questions/Questions]] — Dudas abiertas

---

## Estado del Proyecto

- **Fase actual:** Planificación y diseño de base de datos
- **Próximo hito:** Schema de Supabase listo para migrar
- **Fecha de inicio:** 2026-04-14

---

*Generado por el sistema multi-agente LaPizarra — Documentation Agent*
