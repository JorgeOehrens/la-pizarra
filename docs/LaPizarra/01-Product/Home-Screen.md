# Home Screen — Selector de Equipo

> Agente: Product Agent + Fintech UX Agent
> Objetivo: Documentar el diseño, lógica y decisiones de la pantalla principal de entrada de LaPizarra.
> **Fecha de implementación:** 2026-04-16

---

## Propósito

La pantalla de home es el **punto de entrada** a la app. No es un dashboard — es el selector de equipo. Su trabajo es llevar al usuario al contexto correcto (su equipo activo) lo más rápido posible.

---

## Los 3 Estados

### Estado 0 — Sin equipos (Discovery)

El usuario está autenticado pero no pertenece a ningún equipo.

**UX:** Pantalla de bienvenida con animación de ping + CTAs de acción:
- "CREAR EQUIPO" → `/onboarding/create-team`
- "UNIRME CON CÓDIGO" → `/onboarding/join-team`

**Diseño:** igual al selector pero con foco en la llamada a la acción. Sin grid de equipos.

---

### Estado 1 — Un solo equipo (Auto-redirect)

El usuario pertenece exactamente a un equipo.

**UX:** Sin UI visible. La página hace server-side auto-select:
1. Llama `set_active_team` RPC con el único `team_id`
2. Redirige a `/matches`

El usuario nunca ve la pantalla del selector — aterriza directamente en sus partidos.

---

### Estado 2 — Múltiples equipos (Selector FIFA)

El usuario pertenece a 2 o más equipos.

**UX:** Grid de 2 columnas con tarjetas de equipo. El usuario toca la tarjeta del equipo con el que quiere entrar.

Al tocar:
1. Spinner sobre la tarjeta seleccionada (feedback inmediato)
2. Llama `selectTeam(teamId)` → `set_active_team` RPC → redirect `/matches`

---

## Diseño Visual

### Referencia
FIFA / Premier League team selector — sensación de "elegir a quién juegas".

### Paleta y tipografía
- Background: `#000000` puro
- Display: `Bebas Neue` — "SELECCIONA / TU EQUIPO" en 64-72px
- Acento: `#D7FF00` para la línea inferior del título y todos los detalles
- Muted text: `rgba(255,255,255,0.35)`

### Efectos de fondo
- **Dot grid:** `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)` @ 22px
- **Stadium glow:** gradiente desde `#064e3b/25` (verde) hacia arriba, 288px desde el fondo
- **Accent haze:** gradiente desde `#D7FF00/4%` hacia abajo, 208px desde el top

### Tarjetas de equipo
- **Relación de aspecto:** 3:4 (portrait)
- **Fondo:** `radial-gradient` centrado en el `primary_color` del equipo — da personalidad visual a cada tarjeta sin logos forzados
- **Borde:** `1px solid rgba(255,255,255,0.07)` en reposo → `rgba(215,255,0,0.35)` en hover
- **Hover:** `scale(1.025)` + `box-shadow: 0 8px 32px rgba(215,255,0,0.12)` sobre el button
- **Entrada:** animación `homeCardIn` (fade + slide up + scale) con 70ms de delay por índice
- **Barra inferior:** línea de 2px en `#D7FF00`, `scaleX(0)` → `scaleX(1)` en hover
- **Badge "Admin":** pill pequeño en esquina superior derecha, solo si `role === 'admin'`
- **Logo:** si existe, 80×80px `object-contain`. Si no, letra inicial en `primary_color`
- **Nombre:** Bebas Neue 17px, truncado. Número de jugadores en 11px / 30% opacity

### Barra de búsqueda
Solo visible cuando el usuario pertenece a **más de 3 equipos**.

### CTAs fijos (bottom)
Siempre visibles, por encima del área de contenido:
- "CREAR EQUIPO" — `bg-[#D7FF00]`, texto negro, Bebas Neue
- "UNIRME CON CÓDIGO" — `border border-white/15`, texto blanco/70

---

## Flujo de navegación

```
Raíz / 
  → (auth) /home
       ↓
   0 equipos → EmptyState (CTAs onboarding)
   1 equipo  → set_active_team → /matches
   N equipos → FIFA Selector → [toca tarjeta] → set_active_team → /matches
```

El tab "Inicio" en MobileNav (`/home`) lleva al selector. Para usuarios de 1 equipo, el tap siempre rebota a `/matches`. Para multi-equipo, muestra el selector (útil para cambiar de contexto).

---

## Archivos implementados

```
app/home/
├── page.tsx          ← Server: 3-state logic + member count query
├── home-view.tsx     ← Client: FIFA selector UI + EmptyState
├── actions.ts        ← Server action: selectTeam → set_active_team + redirect /matches
└── loading.tsx       ← Spinner sobre fondo negro (consistente con la pantalla)

app/globals.css       ← @keyframes homeCardIn (fadeSlideUp + scale)
```

---

## Decisiones clave

### ¿Por qué el home es el selector y no el dashboard?
El equipo activo es el **contexto de toda la app**. Tenerlo como primer paso hace la arquitectura más clara: el usuario siempre sabe con qué equipo está trabajando porque lo eligió explícitamente.

### ¿Por qué redirigir a `/matches` y no a `/team`?
`/matches` es donde está la mayor parte de la actividad diaria. `/team` es gestión (plantilla, configuración) — es menos frecuente.

### ¿Por qué FIFA y no dashboard directo?
Equipos de fútbol amateur tienen múltiples equipos (varios torneos, equipos de distintas ligas). La selección de equipo tiene que ser lo suficientemente deliciosa para que el usuario la haga con ganas, no como un trámite.

### ¿Por qué auto-redirect para 1 equipo?
Un usuario con 1 equipo no necesita elegir. Añadir fricción innecesaria va contra los principios del producto.

---

## Deuda técnica

| Item | Impacto | Prioridad |
|---|---|---|
| `/team-select` aún existe como ruta separada — puede quedar obsoleta | Bajo — no causa conflictos | Baja — eliminar en limpieza |
| `setActiveTeam` en `/team-select/actions.ts` redirige a `/home` → que para multi-equipo vuelve a mostrar el selector | Medio — UX extraño si llegan por esa ruta | Media — cambiar redirect a `/matches` |
| `getActiveTeamMembership` en `lib/team.ts` redirige a `/team-select` cuando no hay active_team_id — debería redirigir a `/home` | Bajo — mismo resultado final | Media |
| Botón "continuar con [equipo activo]" para multi-equipo que ya está en la app | UX de confort | Fase 2 |

---

*Product Agent — LaPizarra Knowledge Base*
