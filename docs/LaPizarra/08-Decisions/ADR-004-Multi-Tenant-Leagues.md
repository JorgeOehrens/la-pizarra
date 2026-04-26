# ADR-004: Multi-Tenant Workspaces — Ligas como tenants, equipos globales

> Architecture Decision Record
> Agente: Architecture
> Fecha: 2026-04-25
> Estado: ACEPTADO
> PRD: [/docs/prd/multi-tenant-rbac-leagues-teams.md](../../prd/multi-tenant-rbac-leagues-teams.md)

---

## Contexto

Hoy LaPizarra es **single-tenant por equipo**: el usuario tiene un `active_team_id` y todo el modelo (matches, finanzas, asistencia, plantilla) está acotado a `team_id`. El enum `team_role` es binario: `admin` o `player`.

Para escalar a:

1. **Ligas amateurs** que necesitan administrar varias temporadas y equipos participantes.
2. **Equipos que juegan en múltiples competiciones** simultáneas sin perder estadísticas globales.
3. **Roles diferenciados** (manager, coach, captain, referee, league admin) para delegar registro de partidos, finanzas y aprobaciones.

El modelo actual ya no alcanza:

- No hay entidad `liga` ni `season`.
- Un equipo no puede participar en dos ligas en paralelo.
- Un usuario no puede tener roles distintos en contextos distintos (p. ej. *League Admin* en Liga 1 y *Player* en Equipo X que juega en Liga 1).
- Cada RPC reimplementa su propia validación contra `team_members` — la regla "quién puede editar un partido" vive duplicada (y ya divergió: `lapizarra_v2.sql` exigía admin, `relax_match_edit_permissions.sql` lo bajó a "cualquier miembro activo").

---

## Decisión

**Adoptar un modelo *workspace-based multi-tenant RBAC* donde la liga es el workspace y el equipo es global.**

Concretamente:

1. La **liga** (`leagues`) es el tenant de primer nivel: `owner_id`, `slug`, branding, `visibility`, `join_mode`. Tiene sus propias `seasons` y `league_invitations`.
2. El **equipo** (`teams`) sigue siendo una entidad global e independiente. Un equipo puede existir sin liga (compatibilidad total con los flujos actuales).
3. La participación equipo↔liga se modela vía `league_teams` (M:N con `season_id` opcional), permitiendo que un equipo juegue en varias ligas a la vez y rejoin por temporada.
4. Las **membresías** se separan en dos tablas:
   - `league_members` con enum `league_role`: `league_owner`, `league_admin`, `league_referee`, `league_viewer`.
   - `team_members` (existente) con enum extendido: se agregan `team_manager`, `coach`, `captain`, `team_viewer`. El valor histórico `admin` se mantiene como alias de `team_manager` (los enums de Postgres no permiten quitar valores).
5. Se introduce un **resolver único de permisos** en Postgres: `public.has_permission(user, permission, league?, team?, match?)`. Toda escritura existente y futura pasa por este punto. La capa TypeScript (`lib/auth/permissions.ts`) es un wrapper delgado que delega en el RPC.
6. El **contexto activo** evoluciona de `profiles.active_team_id` a `(profiles.active_league_id, profiles.active_team_id)`. La pantalla `/team-select` se renombra a `/context-select`.
7. La feature se entrega detrás de **`NEXT_PUBLIC_FEATURE_LEAGUES`**, con migraciones aditivas (no destructivas) y refactor de RPCs internos antes de exponer cualquier UI de liga.

---

## Consecuencias Positivas

- Un usuario puede ser *League Admin* en Liga 1, *Player* en Equipo X, y *Coach* en Equipo Y — todos resueltos por contexto.
- Un equipo puede participar en N ligas sin duplicar plantilla, finanzas o asistencia.
- Una sola fuente de verdad para autorización (`has_permission`). Adiós a la divergencia entre RPCs.
- Onboarding de ligas amateur sin afectar a usuarios actuales: la ausencia de liga es un caso válido y soportado.
- El roadmap de **standings**, **fixtures con dos equipos**, **finanzas de liga** y **billing** queda desbloqueado, pero sin entrar al alcance V1.

## Consecuencias Negativas

- Más superficie en la base de datos (5–6 tablas nuevas) y en el frontend (un árbol completo `app/league/`).
- Los enums de Postgres no son reversibles. La estrategia *append-only* implica convivir con `admin` y `team_manager` como sinónimos hasta una migración de limpieza posterior.
- Cada RPC existente debe refactorizarse para pasar por `has_permission`. Es invisible para el usuario pero requiere disciplina y tests SQL.
- El resolver de contexto activo se ejecuta en cada request autenticado. Hay que memoizar.

---

## Alternativas Consideradas

| Alternativa | Descartada por |
| --- | --- |
| Tenant a nivel `team` (status quo) | No modela ligas, no permite cross-league, no diferencia roles. |
| Tenant a nivel `team` con `league_id` opcional pero sin `league_members` | No hay forma de que un usuario sea *league admin* sin pertenecer a un equipo de la liga. Reproduce el problema. |
| Subdominio por liga (`liga.lapizarra.app`) | Complica auth, certificados, y dev local. Postergada para post-V1; el path `/league/[slug]` cubre V1. |
| Roles como filas en una tabla `roles` con permisos arbitrarios (RBAC dinámico) | Sobrediseño para el alcance actual. Se prefiere enum + función de resolución, fácil de auditar. |
| Refactor big-bang (mover matches/finanzas a scope liga de una vez) | Riesgo alto de regresión. Se opta por aditivo + feature flag + checkpoints. |

---

## Reglas operativas derivadas de esta decisión

- Toda nueva tabla incluye `id uuid pk`, `created_at`, `updated_at` y `deleted_at` cuando aplica.
- Toda RPC de escritura es `SECURITY DEFINER`, retorna `jsonb`, y arranca con `has_permission(...)`.
- Las helpers de RLS (`is_team_member`, `is_team_admin`) siguen vigentes para *reads* por performance; los *writes* delegan en `has_permission`.
- Los slugs de `leagues` y `teams` viven en namespaces separados.
- El resolver TS solo delega: jamás replica reglas que no estén en el RPC.

---

## Migración futura (post-V1)

1. Convertir `team_role='admin'` → `team_manager` cuando ningún caller dependa del valor histórico.
2. Introducir `home_team_id`/`away_team_id` en `matches` para fixtures cruzados (alcance V2).
3. Standings/clasificaciones por temporada (vista o tabla materializada).
4. `league_charges` para cuotas de liga.
5. Subdominio por liga + SEO de páginas públicas.

---

*Architecture — LaPizarra Knowledge Base*
