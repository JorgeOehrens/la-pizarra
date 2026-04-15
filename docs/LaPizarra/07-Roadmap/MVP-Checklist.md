# MVP Checklist — Lista de Verificación Completa

> Agente: Implementation Planner Agent
> Checklist accionable para llegar al MVP. Una tarea a la vez.

---

## Fase 0: Setup

### Supabase
- [ ] Crear proyecto en supabase.com
- [ ] Guardar `SUPABASE_URL` y `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Ejecutar migración 001 (extensiones + update_updated_at)
- [ ] Ejecutar migración 002 (profiles + triggers)
- [ ] Ejecutar migración 003 (teams)
- [ ] Ejecutar migración 004 (team_members)
- [ ] Ejecutar migración 005 (invitations)
- [ ] Ejecutar migración 006 (venues)
- [ ] Ejecutar migración 007 (matches)
- [ ] Ejecutar migración 008 (match_events)
- [ ] Ejecutar migración 009 (manual_stat_adjustments)
- [ ] Ejecutar migración 010 (views: player_stats, team_stats)
- [ ] Ejecutar migración 011 (RLS policies)
- [ ] Ejecutar migración 012 (storage buckets)
- [ ] Ejecutar migración 013 (seed de venues)
- [ ] Desactivar confirmación de email en Supabase Auth

### Next.js
- [ ] Instalar `@supabase/supabase-js @supabase/ssr`
- [ ] Crear `lib/supabase/client.ts`
- [ ] Crear `lib/supabase/server.ts`
- [ ] Ejecutar `supabase gen types typescript --linked > lib/supabase/database.types.ts`
- [ ] Crear `middleware.ts` con protección de rutas
- [ ] Configurar `.env.local` con variables de Supabase
- [ ] Configurar variables en Vercel

---

## Fase 1: Auth

### Registro
- [ ] Formulario de registro (username + password + nombre opcional)
- [ ] Validación de formato de username
- [ ] Check de username único (query a profiles antes de registrar)
- [ ] Llamada a `supabase.auth.signUp()` con email ficticio interno
- [ ] Redirect a `/dashboard` tras registro exitoso
- [ ] Error handling: username tomado, password débil

### Login
- [ ] Formulario de login (username + password)
- [ ] Llamada a `supabase.auth.signInWithPassword()`
- [ ] Redirect a `/dashboard` si ya está autenticado
- [ ] Error handling: credenciales incorrectas

### Sesión
- [ ] Middleware que redirige no-auth a `/login`
- [ ] Botón de logout en header
- [ ] Persistencia de sesión entre recargas

---

## Fase 2: Equipos e Invitaciones

### Crear Equipo
- [ ] Formulario: nombre + colores
- [ ] Generación de slug único desde el nombre
- [ ] Subida de logo a Supabase Storage (opcional)
- [ ] Insertar en `teams` + insertar en `team_members` como admin
- [ ] Redirect al dashboard del equipo creado
- [ ] Crear invitación automática al crear el equipo

### Ver Equipos
- [ ] Listado de mis equipos (query a `team_members` JOIN `teams`)
- [ ] Estado vacío: "Crea tu primer equipo"
- [ ] Card de equipo con nombre, logo, número de jugadores

### Plantilla
- [ ] Lista de jugadores del equipo
- [ ] Posición y número de camiseta
- [ ] Completar mi perfil dentro del equipo

### Invitaciones
- [ ] Generar link de invitación (token UUID)
- [ ] Generar código de 6 caracteres
- [ ] Copiar link al portapapeles (navigator.clipboard)
- [ ] Página `/join/[token]`: mostrar equipo + botón aceptar
- [ ] Formulario de código manual `/join`
- [ ] API para validar y aceptar invitación
- [ ] Manejo de invitación expirada o ya usada
- [ ] Verificar que el usuario no sea ya miembro

---

## Fase 3: Partidos

### Crear Partido
- [ ] Formulario: rival, fecha, hora, tipo, lugar
- [ ] Selector de venue (predefinidos + custom)
- [ ] Insert en `matches` con status `scheduled`

### Registrar Resultado
- [ ] Input de goles a favor y en contra
- [ ] Update de `goals_for`, `goals_against`, `status = 'finished'`

### Eventos
- [ ] Seleccionar jugador de la plantilla (dropdown)
- [ ] Input de minuto (opcional)
- [ ] Toggle de asistencia
- [ ] Toggle de autogol
- [ ] Insert en `match_events` (goal + assist si aplica)
- [ ] Eliminar evento con confirmación
- [ ] Lista de eventos del partido ordenada por minuto

---

## Fase 4: Estadísticas

### Perfil de Jugador
- [ ] Goles, asistencias, partidos jugados, autogoles
- [ ] Posición y número de camiseta
- [ ] Historial de los últimos 10 partidos donde participó

### Stats del Equipo
- [ ] PJ, V, E, D, GF, GC, GD
- [ ] Forma reciente (últimos 5)
- [ ] Ranking de goleadores
- [ ] Ranking de asistencias

### Stats Manuales
- [ ] Formulario de ajuste en el perfil del jugador (solo admin)
- [ ] Campo delta (positivo o negativo)
- [ ] Campo razón (texto libre)
- [ ] Historial de ajustes

---

## Fase 5: Pulido

### UX
- [ ] Estados vacíos en todas las listas
- [ ] Loading skeletons en todas las listas
- [ ] Confirmación antes de eliminar (partido, evento, jugador)
- [ ] Toasts de éxito/error en todas las acciones

### Mobile
- [ ] Probado en iPhone SE (375px)
- [ ] Probado en iPhone 14 (390px)
- [ ] Probado en Android genérico (360px)
- [ ] Elementos tocables ≥ 44px de altura

### Production
- [ ] Variables de entorno configuradas en Vercel
- [ ] RLS verificada manualmente (usuario de prueba sin acceso a equipo ajeno)
- [ ] Error boundary en `layout.tsx`
- [ ] 404 y error pages configuradas

---

## Criterio Final de MVP

> El MVP está completo cuando:

1. ✅ Admin crea equipo e invita por código
2. ✅ Jugador se une sin email
3. ✅ Se registra un partido con goles y asistencias
4. ✅ Las stats del jugador se muestran correctamente
5. ✅ Funciona desde el teléfono sin errores visibles

---

*Implementation Planner Agent — LaPizarra Knowledge Base*
