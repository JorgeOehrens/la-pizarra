# Dudas Abiertas — Open Questions

> Agente: Documentation Agent
> Preguntas que requieren decisión antes de implementar o que se irán respondiendo en el proceso.

---

## Formato

Cada pregunta tiene:
- **Estado:** Abierta / En discusión / Resuelta
- **Bloqueante:** ¿Impide implementar algo?
- **Propuesta:** Una respuesta inicial para discutir

---

## Q-001: ¿Cómo maneja un usuario múltiples equipos?
**Estado:** En discusión
**Bloqueante:** Fase 2 (UI de equipos)

**Contexto:** El modelo de datos soporta múltiples equipos por usuario. Pero la UI del MVP, ¿muestra todos los equipos o tiene un "equipo activo"?

**Propuesta:**
- MVP: pantalla `/teams` lista todos los equipos del usuario. El usuario elige a cuál entrar.
- No hay "equipo activo" global; el contexto es siempre por ruta (`/teams/[teamId]/...`).
- Botón "Cambiar equipo" en el header cuando estás en el contexto de un equipo.

---

## Q-002: ¿Pueden los jugadores (no admin) registrar eventos?
**Estado:** Abierta
**Bloqueante:** No (afecta UX pero no el modelo)

**Contexto:** El RFC original dice que solo admins pueden crear eventos. Pero en la práctica, el capitán podría querer delegar el registro del partido.

**Propuesta:**
- MVP: solo admins registran eventos.
- Futuro: agregar rol `editor` o permitir que cualquier miembro registre eventos si el admin lo habilita.

---

## Q-003: ¿Qué pasa cuando el número de camiseta está ocupado?
**Estado:** Resuelta
**Resolución:** Error de validación con mensaje claro. El DB tiene `unique(team_id, jersey_number)`. La UI debe mostrar los números disponibles o avisar antes de intentar guardar.

---

## Q-004: ¿El slug del equipo puede cambiar?
**Estado:** Abierta
**Bloqueante:** No

**Contexto:** El slug se genera desde el nombre del equipo al crearlo. ¿Puede el admin cambiar el nombre sin cambiar el slug? ¿O el slug es inmutable?

**Propuesta:**
- El nombre del equipo es editable en cualquier momento.
- El slug NO cambia (es la URL permanente del equipo).
- Si el nombre cambia, el slug queda como está (como Slack, GitHub, etc.).

---

## Q-005: ¿Cómo se maneja la "temporada"?
**Estado:** Abierta
**Bloqueante:** Afecta stats pero se puede postergar

**Contexto:** Las stats actuales son históricas (toda la vida del equipo). En el fútbol, las temporadas reinician las clasificaciones.

**Propuesta:**
- MVP: sin concepto de temporada. Todas las stats son históricas.
- Fase 2: agregar campo `season` (year o string) a `matches`.
- Filtro de temporada en la UI de stats.
- Las vistas de stats se pueden filtrar por `match.season`.

---

## Q-006: ¿Qué tan detallado es el "perfil" del usuario vs. el "perfil en el equipo"?
**Estado:** Resuelta
**Resolución:** 
- `profiles` = identidad global: username, display_name, avatar_url
- `team_members` = datos por equipo: posición, número de camiseta
- Un jugador puede tener diferentes posiciones en diferentes equipos (ej: portero en uno, delantero en otro)

---

## Q-007: ¿Los invites son de un solo uso o de múltiples usos?
**Estado:** Resuelta
**Resolución:**
- Los links (token) son de un solo uso. Después de usarse, status = 'accepted'.
- Si el admin quiere invitar a más jugadores, genera un nuevo link.
- Alternativa futura: links reutilizables con `max_uses` y `uses_count`.

---

## Q-008: ¿Qué pasa si el admin se va del equipo?
**Estado:** Abierta
**Bloqueante:** No para MVP, pero necesita diseño

**Contexto:** Si el único admin deja el equipo, nadie puede gestionar el equipo.

**Propuesta:**
- MVP: no se puede eliminar el último admin del equipo (validación en la API).
- El admin puede promover a otro jugador a admin antes de irse.
- Futuro: si no hay admins, el jugador más antiguo se puede auto-promover.

---

## Q-009: ¿Las stats de un partido cancelado se revierten?
**Estado:** Resuelta
**Resolución:** Las stats solo cuentan partidos con `status = 'finished'`. Si un partido se cancela (`status = 'cancelled'`), no aparece en las stats aunque tenga eventos registrados.

---

## Q-010: ¿Cómo se manejan los colores del equipo?
**Estado:** Abierta
**Bloqueante:** No para MVP

**Contexto:** El deck sugiere que los equipos tienen colores. ¿Es un color picker libre o una paleta predefinida?

**Propuesta:**
- MVP: color picker libre (hex), con colores sugeridos comunes en fútbol amateur.
- Los colores se usan para personalizar el header/cards del equipo en la app.

---

## Q-011: ¿Cómo se importan datos históricos (antes de usar la app)?
**Estado:** En discusión
**Bloqueante:** No

**Contexto:** Un equipo puede tener temporadas previas con datos en hojas de cálculo.

**Propuesta:**
- MVP: stats manuales via `manual_stat_adjustments` — el admin suma goles/asistencias directamente.
- Futuro: importación via CSV o Google Sheets.

---

## Q-012: ¿Supabase MCP — cuándo y cómo se conecta?
**Estado:** Abierta
**Bloqueante:** No para MVP

**Contexto:** El brief menciona "conexión futura vía MCP". Supabase tiene servidor MCP oficial.

**Propuesta:**
- Post-MVP, cuando la base de datos tenga datos reales.
- Conectar `@supabase/mcp-server-supabase` para que Claude pueda consultar stats, generar reportes y hacer análisis tácticos.

---

*Documentation Agent — LaPizarra Knowledge Base*
