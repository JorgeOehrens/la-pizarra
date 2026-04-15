# Roadmap de Implementación — Por Fases

> Agente: Implementation Planner Agent
> Orden de desarrollo basado en dependencias y valor al usuario.

---

## Principio de Planificación

**Regla:** Cada fase debe producir algo funcional y usable. No hay fases que solo "preparan" sin valor visible.

---

## Fase 0: Setup Técnico (2-3 días)

**Objetivo:** Proyecto listo para desarrollar sin deuda técnica inicial.

### Tareas
- [ ] Configurar proyecto Supabase en la nube
- [ ] Ejecutar todas las migraciones (ver [[03-Database/Migrations]])
- [ ] Configurar variables de entorno en `.env.local`
- [ ] Instalar y configurar `@supabase/ssr` en Next.js
- [ ] Crear cliente de Supabase (server + client)
- [ ] Configurar middleware de auth
- [ ] Generar tipos TypeScript desde Supabase
- [ ] Configurar Supabase Storage buckets
- [ ] Deploy inicial a Vercel (sin features)

### Archivos a crear
```
lib/
  supabase/
    client.ts         ← createBrowserClient
    server.ts         ← createServerClient
    database.types.ts ← generado automáticamente
  auth/
    validation.ts
middleware.ts
```

### Criterio de Done
- App corre en local sin errores
- Deploy exitoso en Vercel
- Supabase conectado y tipos generados

---

## Fase 1: Auth + Perfil (3-4 días)

**Objetivo:** Un usuario puede registrarse y hacer login sin email.

### Tareas
- [ ] Página `/register` con username + contraseña
- [ ] Validación de username único (client-side + server-side)
- [ ] Página `/login`
- [ ] Middleware que protege rutas
- [ ] Trigger `handle_new_user` verificado
- [ ] Página de perfil básica `/profile`
- [ ] Botón de logout
- [ ] Loading states y error handling

### Componentes a crear
```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (app)/
    profile/page.tsx
components/
  auth/
    LoginForm.tsx
    RegisterForm.tsx
```

### Criterio de Done
- Flujo completo: registrarse → ver perfil → logout → login
- Sin errores en consola
- Funciona en mobile (375px)

---

## Fase 2: Equipos + Invitaciones (4-5 días)

**Objetivo:** Un admin puede crear un equipo e invitar jugadores.

### Tareas
- [ ] Crear equipo (nombre, colores)
- [ ] Subir logo a Supabase Storage
- [ ] Ver mis equipos
- [ ] Dashboard básico del equipo
- [ ] Generar invitación por link
- [ ] Generar código de 6 caracteres
- [ ] Página `/join/[token]` para aceptar invitaciones
- [ ] Ingresar código manual
- [ ] Ver plantilla del equipo
- [ ] Completar perfil de jugador (posición + número)

### Componentes a crear
```
app/
  (app)/
    teams/
      page.tsx           ← lista de mis equipos
      new/page.tsx       ← crear equipo
      [teamId]/
        page.tsx         ← dashboard del equipo
        squad/page.tsx   ← plantilla
        settings/page.tsx
    join/
      [token]/page.tsx   ← aceptar por link
      page.tsx           ← ingresar código
```

### Criterio de Done
- Flujo completo: crear equipo → generar link → jugador se une → aparece en plantilla
- El admin ve los jugadores en su plantilla

---

## Fase 3: Partidos (4-5 días)

**Objetivo:** Registrar partidos con resultado y eventos.

### Tareas
- [ ] Crear partido (formulario completo)
- [ ] Lista de partidos del equipo
- [ ] Detalle de partido
- [ ] Registrar resultado (goles a favor / en contra)
- [ ] Registrar goles (jugador + minuto)
- [ ] Registrar asistencias (vinculadas al gol)
- [ ] Registrar autogoles
- [ ] Eliminar evento

### Componentes a crear
```
app/
  (app)/
    teams/[teamId]/
      matches/
        page.tsx          ← historial
        new/page.tsx      ← crear partido
        [matchId]/
          page.tsx        ← detalle
          events/page.tsx ← registrar eventos
```

### Criterio de Done
- Crear partido → agregar gol con asistencia → ver en detalle del partido
- Las stats del jugador se actualizan

---

## Fase 4: Estadísticas (3-4 días)

**Objetivo:** Ver estadísticas completas de jugadores y equipo.

### Tareas
- [ ] Dashboard de stats del equipo
- [ ] Ranking de goleadores
- [ ] Perfil de jugador con historial
- [ ] Historial de partidos con resultados
- [ ] Forma reciente (últimos 5)
- [ ] Stats manuales (editar goles/asistencias directamente)

### Componentes a crear
```
app/
  (app)/
    teams/[teamId]/
      stats/page.tsx        ← stats del equipo
      players/[playerId]/
        page.tsx            ← perfil del jugador
```

### Criterio de Done
- Se puede ver el perfil de cualquier jugador con sus stats
- Se puede ver el ranking de goleadores del equipo
- Las stats manuales funcionan

---

## Fase 5: Pulido MVP (3-4 días)

**Objetivo:** MVP listo para usuarios reales.

### Tareas
- [ ] Responsive testing en múltiples dispositivos
- [ ] Estados vacíos (sin partidos, sin jugadores)
- [ ] Mensajes de error comprensibles
- [ ] Loading skeletons
- [ ] Confirmaciones para acciones destructivas
- [ ] SEO básico (meta tags)
- [ ] Favicon y PWA manifest básico
- [ ] Testing de flujos críticos end-to-end

### Criterio de Done
- El equipo de fútbol del dev puede usarlo en su próximo partido
- Sin errores críticos en producción

---

## Timeline Estimado

```
Semana 1: Fase 0 + Fase 1 (Setup + Auth)
Semana 2: Fase 2 (Equipos + Invitaciones)
Semana 3: Fase 3 (Partidos)
Semana 4: Fase 4 + Fase 5 (Stats + Pulido)
```

**Total MVP:** ~4 semanas de desarrollo

---

## Post-MVP (Backlog)

| Feature | Prioridad | Complejidad |
|---------|-----------|-------------|
| Email auth | Alta | Baja |
| Notificaciones | Alta | Media |
| Estadísticas por temporada | Alta | Media |
| Tarjetas amarillas/rojas | Media | Baja |
| Fotos de jugadores | Media | Baja |
| Modo árbitro / partido en vivo | Media | Alta |
| Gestión de ligas | Alta | Alta |
| App nativa | Alta | Muy alta |
| Exportar stats a PDF | Baja | Media |

---

*Implementation Planner Agent — LaPizarra Knowledge Base*
