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
| Fintech UX Agent | [[11-Finance/13-payment-ux]] | UX de cobros y pagos |
| Payments Logic Agent | [[11-Finance/14-distribution-rules]] | Lógica de distribución y reparto |
| Documentation Agent | [[00-Overview/Index]] | Esta knowledge base |

---

## Navegación

- [[01-Product/MVP-Scope]] — Qué construimos en el MVP
- [[01-Product/User-Stories]] — Flujos de usuario concretos
- [[01-Product/Home-Screen]] — Selector de equipo: 3 estados, diseño FIFA, decisiones
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
- [[10-Integrations/Index]] — Integraciones externas (wearables, salud)
- [[10-Integrations/Health-Wearables]] — Apple Health, Google Fit, Garmin y otros
- [[11-Finance/10-feature-overview]] — Finanzas del equipo: qué es y alcance MVP
- [[11-Finance/11-use-cases]] — Casos de uso: cancha, cuota, asado, poleras
- [[11-Finance/12-finance-data-model]] — Modelo de datos Supabase para finanzas
- [[11-Finance/13-payment-ux]] — UX de pagos estilo wallet / payment sheet
- [[11-Finance/14-distribution-rules]] — Reglas de distribución y reparto de cobros
- [[11-Finance/15-finance-roadmap]] — Roadmap: MVP, Fase 2, integración real
- [[11-Finance/16-open-questions]] — Preguntas abiertas del módulo
- [[11-Finance/17-decisions-log]] — Log de decisiones y tradeoffs
- [[11-Finance/18-implementation-notes]] — Referencia técnica post-implementación (FK names, rutas, tipos)

---

## Estado del Proyecto

- **Fase actual:** Módulo de Finanzas implementado y en producción
- **Fecha de inicio:** 2026-04-14
- **Última actualización:** 2026-04-16 (Home Screen FIFA selector implementado)

### Módulos en producción

| Módulo | Estado | Notas |
|---|---|---|
| Auth (email + username) | ✅ Producción | Sin email opcional |
| Equipos y miembros | ✅ Producción | Multi-equipo, roles admin/player |
| Invitaciones | ✅ Producción | Link + código de 6 caracteres |
| Partidos y eventos | ✅ Producción | Goles, asistencias, tarjetas |
| Estadísticas | ✅ Producción | Vista calculada player_stats |
| **Finanzas del equipo** | ✅ **Producción** | MVP completo — ver [[11-Finance/10-feature-overview]] |
| **Home / Selector de equipo** | ✅ **Producción** | FIFA-style, 3 estados — ver [[01-Product/Home-Screen]] |
| Analytics avanzado | 🔜 Fase 2 | Tab temporalmente reemplazado por Finanzas |

---

*Generado por el sistema multi-agente LaPizarra — Documentation Agent*
