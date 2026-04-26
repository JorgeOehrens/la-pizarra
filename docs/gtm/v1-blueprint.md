# La Pizarra — V1 GTM & Execution Blueprint

> Owner: Founders + Tech lead
> Estado: Draft v1 — 2026-04-26
> Fuente única para el lanzamiento V1. Pragmático, no académico.

---

## 0. Estado actual (snapshot del codebase)

| Pieza | Estado | Notas |
| --- | --- | --- |
| Auth (username + password) | LIVE | Sin email; alias `username@lapizarra.app`. |
| Multi-team RBAC | LIVE | Ver PRD `docs/prd/multi-tenant-rbac-leagues-teams.md`. |
| Crear equipo / unirse / invitaciones | LIVE | Por código de 6 chars o link. |
| Partidos + eventos (gol/asist./tarjetas) | LIVE | Stats automáticas. |
| Asistencia | LIVE | Por jugador, por partido. |
| Finanzas del equipo | LIVE | Cobros, distribución, pagos. |
| Multi-equipo (un user en varios teams) | LIVE | Switcher `/context-select`. |
| Ligas: dashboard, fixtures, brackets, standings, top scorers | LIVE detrás de `NEXT_PUBLIC_FEATURE_LEAGUES`. | Auto-advance del bracket implementado. |
| Vista pública de liga `/public/league/[slug]` | LIVE | Sin sesión. |
| Pagos / Stripe | NO IMPLEMENTADO para ligas. | Stripe + Fintoc instalados pero usados sólo para finance del equipo. |
| Landing | minimalista en `app/page.tsx` | Sin segmentación, sin features. |
| Páginas de marketing | NO EXISTEN | Plan escrito en `~/.claude/plans/necesito-crear-una-landing-tidy-glade.md`. |
| Waitlist | NO IMPLEMENTADO | Diseñado en el plan. |
| Tracking de eventos / analytics | NO IMPLEMENTADO | Solo `@vercel/analytics` para pageviews. |
| Email transaccional | NO IMPLEMENTADO | Sin Resend / Postmark. |

**Fase de producto:** validación. Hipótesis clave a probar = "las ligas amateur están dispuestas a pagar **$10.000 CLP/año** por administrar su torneo en LaPizarra." Antes de cobrar, capturamos intención (waitlist).

---

## 1. GTM en una página

### 1.1 Concepto
**League-driven SaaS con teams freemium y crecimiento viral por jugadores.**

### 1.2 Hipótesis de negocio (a validar en V1)
1. Las **ligas pagan** porque les ahorra horas semanales y profesionaliza su torneo.
2. Los **equipos** son free para siempre porque son el lead generator + memoria del jugador.
3. Los **jugadores** crecen virales: cada jugador rota a otros equipos y trae a sus amigos.
4. Hay upsells futuros para teams premium (Instagram CM tools, stats avanzadas, video). **Out of V1.**

### 1.3 Funnel de adquisición (prevista)
1. Manager crea equipo gratis → invita jugadores → activa equipo (3+ jugadores, 1+ partido).
2. Jugadores tocan la app, se enganchan, traen a otros equipos (viral player loop).
3. Una liga local descubre LaPizarra (vía un equipo o por marketing) → se anota al waitlist.
4. La liga organiza temporada → invita N equipos → todos los teams ya estaban en LaPizarra → fricción cero.
5. Cuando V2: la liga paga $10k al año, recibe brackets/standings/vista pública.

### 1.4 Posicionamiento

> **La Pizarra: tu liga, tu equipo, tu carrera amateur — en un solo lugar.**

Entre el WhatsApp informal (gratis, caos) y el software profesional caro (FIFA, federaciones). Para fútbol amateur de barrio, empresarial y colegial.

---

## 2. Target Market

### 2.1 Quién paga (Liga — ICP)

- Organizadores de ligas amateur con **8–30 equipos** y **2+ temporadas/año**.
- Tipologías:
  - Liga de barrio / amistosa con calendario fijo.
  - Liga corporativa / interempresas.
  - Liga colegial / universitaria.
  - Federación micro (8–16 equipos).
- **Geo V1**: Chile (CLP) + Argentina (ARS, follow-up).
- **Pain principal**: el organizador hoy maneja tabla en Excel, fixture en WhatsApp, resultados por capturas.

### 2.2 Audiencias de growth (Team + Player)

- **Equipos amateurs recurrentes** (jueves/sábado/domingo fijo). Capitán o admin que quiere dejar de pelear con la libreta.
- **Jugadores** que quieren su histórico (goles, asistencias). Más jóvenes (16–35) son los más virales.

---

## 3. Value Propositions

### 3.1 Liga
- **Standings + goleadores + asistidores automáticos.** Sin Excel.
- **Brackets eliminatorios** que avanzan solos al cargar resultados.
- **Vista pública compartible** (`/public/league/<slug>`). Un link y todos ven la liga.
- **Marca de la liga visible** en cada partido (logo/colores).
- **Auto-generador de torneos completos** (selecciona equipos + fecha → crea Cuartos/Semis/Final linkeados).
- **PDF descargable** del fixture completo (printable).
- **Ahorra ~4–6 h/semana** de admin manual.

### 3.2 Team
- Plantilla viva, sin email para los jugadores.
- Stats por jugador automáticas (calculadas desde eventos).
- Asistencia organizada y visible.
- Finanzas: cobros con distribución automática.
- Multi-equipo: un jugador puede estar en varios teams sin duplicar identidad.

### 3.3 Player
- Historial portable: cambias de equipo, tus números van contigo.
- Goles + asistencias + asistencia + tarjetas verificadas (los carga el admin).
- Perfil compartible (futuro).

---

## 4. Pricing Strategy

### 4.1 Plan estructura

| Tier | Audiencia | Precio | Estado V1 |
| --- | --- | --- | --- |
| **Free** | Teams + Players | $0 — para siempre | LIVE |
| **Pro Liga** | Organizadores de liga | **$10.000 CLP/año por liga** | Waitlist (sin cobro) |
| **Federación** | >50 equipos / >3 ligas en una org | Custom (contacto) | Out of V1 |
| **Team Premium** (futuro) | Teams que quieren CM tools, video, etc. | TBD | Out of V1 |

### 4.2 Lo que incluye **Pro Liga**

- Crear ligas (hoy gated por flag → sin pago).
- Brackets, standings, top scorers, top assists.
- Vista pública con marca.
- PDF de fixtures.
- Auto-generador de torneo completo.
- Soporte por email.

### 4.3 Lo que NO incluye Pro Liga (V1)
- Pagos directos por la app a los equipos miembros (out of scope).
- Notificaciones automáticas a equipos.
- Streaming / video.
- Custom domain.

### 4.4 Trial
- **30 días free** al activar pago. No se cobra hasta confirmar (no charge upfront).
- Si la liga no convierte: queda en read-only. Datos no se borran.

### 4.5 V1 actual: **NO se cobra**
- `/precios` muestra los planes con claridad.
- Botón "Pro Liga" → **abre formulario de waitlist** (no checkout).
- Cuando lleguemos a **50+ ligas** en waitlist, prendemos Stripe Subscription.

---

## 5. Gap Analysis (qué falta para shipping V1)

### 5.1 Product gaps
- [ ] Branch "leagues OFF" en `/onboarding/create-league`: hoy redirige a `/onboarding`. **Debería redirigir a `/para-ligas#waitlist`** y registrar la intención.
- [ ] Push desde el dashboard del equipo hacia liga: hoy no hay un CTA visible "¿Tu equipo está en una liga? Anótate.".
- [ ] Página de confirmación post-waitlist (`/waitlist/gracias`).
- [ ] Logo/branding de cada equipo en el dashboard de liga (existe pero a medias en algunos cards).

### 5.2 Backend gaps
- [ ] Tabla `marketing_waitlist` + RPC `submit_marketing_waitlist` (diseñada en el plan, no aplicada).
- [ ] Email transaccional para confirmar waitlist. **Recomendación**: Resend (gratis hasta 3.000/mes, sin tarjeta).
- [ ] Rate limit en el formulario de waitlist (Postgres `(email, audience)` unique + chequeo by-IP en RPC).
- [ ] Tracking de eventos (PostHog / Vercel Analytics events).
- [ ] Unsubscribe de waitlist (link público con token).
- [ ] Stripe: NO TOCAR todavía.

### 5.3 Frontend gaps
- [ ] Landing actual sin segmentación / sin features.
- [ ] Páginas `/para-ligas`, `/para-equipos`, `/para-jugadores`.
- [ ] Página `/precios` (con waitlist embebido).
- [ ] Páginas `/terminos` y `/privacidad`.
- [ ] `/blog` + `/blog/[slug]` con 2–3 posts iniciales.
- [ ] Componentes marketing: nav compartida, hero parametrizable, feature cards, mocks UI, waitlist form.
- [ ] Banner "Anótate al waitlist Pro Liga" en el dashboard de la liga (si flag ON pero sin pago).

### 5.4 UX gaps
- [ ] Mensajería clara: "Equipos = gratis. Ligas = en lista de espera." en cada CTA.
- [ ] Estados de éxito en formularios (toast + email de confirmación).
- [ ] Logueado vs deslogueado: el nav de marketing tiene que mostrar "Ir a la app" o "Iniciar sesión" sin flickear.
- [ ] Empty state del dashboard de equipo: si el equipo no tiene matches/jugadores, debe sugerir el primer paso ("Crea tu primer partido").

### 5.5 Growth / GTM gaps
- [ ] No hay copy diferenciado por audiencia.
- [ ] No hay UTM tagging en CTAs.
- [ ] Falta link de "Compartir vista pública" en el flow del organizador (existe el botón, falta el push didáctico).
- [ ] No hay "imagen para compartir resultado" (ej: Instagram story con marcador, fecha, equipos). **Out of V1** pero es el primer upsell de team premium.
- [ ] No hay referral / invite credits.

### 5.6 Data / tracking gaps
- [ ] No hay PostHog ni event analytics. Sin esto no podemos medir activación ni funnel.
- [ ] Falta saber cuántos teams están "activos" (1+ partido en últimos 30 días) vs "dormidos".
- [ ] Falta funnel: visita landing → waitlist → conversión.
- [ ] No hay cohort analysis básica.

---

## 6. V1 Scope (estricto)

### 6.1 INCLUIR en V1

**Marketing surface**
- Landing nueva en `/`.
- Audience pages: `/para-ligas`, `/para-equipos`, `/para-jugadores`.
- `/precios`, `/terminos`, `/privacidad`.
- `/blog` + `/blog/[slug]` con 2–3 posts iniciales.
- Componentes shared en `components/marketing/`.

**Waitlist**
- Tabla `marketing_waitlist` + RPC.
- Form en cada audience page + `/precios` + landing + blog.
- Segmentación por audiencia (`ligas / equipos / jugadores / general`).
- Email de confirmación (Resend).
- Unsubscribe básico.

**Onboarding gating**
- `/onboarding/create-league` redirige a `/para-ligas#waitlist` cuando flag OFF.
- Banner en dashboard de liga (si ya está creada): "Esto es preview. Tu liga estará 100% gratis hasta el lanzamiento oficial."

**Tracking**
- Vercel Analytics (built-in, gratis) para pageviews.
- PostHog (free tier) para eventos: signup, team_created, match_created, league_intent, waitlist_submit.
- UTMs en todos los CTAs externos (cuando hagamos campañas).

**Push hacia liga**
- En `/team` admin tab: card sutil "¿Manejas una liga? Anótate."
- En el dashboard del equipo: solo si el equipo NO está en ninguna liga.

### 6.2 NO INCLUIR en V1 (out of scope)

- Stripe / payments / facturación.
- Notificaciones in-app / email transaccional para flujos de equipo (invitaciones, próximos partidos).
- Premium tiers para teams (Instagram CM, video).
- Native app / PWA install prompt.
- Internacionalización (i18n).
- Custom domains para ligas.
- A/B testing infra.
- Más de 2–3 posts de blog (los redactamos cuando haya tracción).
- Dashboard de admin/operaciones para nosotros (usamos SQL directo para V1).

---

## 7. Waitlist System Design

### 7.1 DB

```sql
create table public.marketing_waitlist (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null,
  audience    text not null check (audience in ('ligas','equipos','jugadores','general')),
  source      text,                           -- /para-ligas, /precios, /, etc.
  utm         jsonb,                          -- { utm_source, utm_medium, utm_campaign }
  user_agent  text,
  status      text not null default 'pending' check (status in ('pending','contacted','converted','unsubscribed')),
  notes       text,                           -- notas internas (ej. "Liga de Maipú, ~16 equipos")
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  contacted_at timestamptz,
  converted_at timestamptz,
  unique (email, audience)
);

create index idx_waitlist_audience on public.marketing_waitlist(audience);
create index idx_waitlist_status   on public.marketing_waitlist(status);
create index idx_waitlist_created  on public.marketing_waitlist(created_at desc);

alter table public.marketing_waitlist enable row level security;
-- Sin policies: solo accesible vía RPC.
```

### 7.2 RPCs

- `submit_marketing_waitlist(email, audience, source, utm)` → inserta. SECURITY DEFINER. Granted a `anon`.
- `unsubscribe_waitlist(token)` → marca `status='unsubscribed'`. SECURITY DEFINER. Granted a `anon`.

### 7.3 API endpoints / Server actions

- `lib/marketing/waitlist.ts` → `submitWaitlist(audience, email, source, utm)` server action que llama el RPC + dispara email transaccional.
- `app/waitlist/unsubscribe/[token]/page.tsx` → page que llama unsubscribe RPC.

### 7.4 Email transaccional

Usar **Resend** (free tier 3.000 emails/mes, sin tarjeta).
- API key en env: `RESEND_API_KEY`.
- Template inline (no Handlebars, no MJML, plain HTML):
  - Subject: "Anotado en LaPizarra · Te avisamos cuando se abra."
  - Body: agradecimiento + qué esperar + link unsubscribe.

### 7.5 Priorización (manual V1)

- Vemos waitlist via SQL (`select * from marketing_waitlist where audience='ligas' order by created_at`).
- Priorizamos por: `audience='ligas'` primero, luego por timestamp.
- Mandamos correos manuales con onboarding personal (5–10 ligas iniciales).
- A los 50+ ligas: prendemos Stripe + lanzamos.

### 7.6 UI states del form

```
[idle]    →  input email + botón "Anotarme"
[loading] →  botón en estado pending, input disabled
[success] →  reemplaza el form con check + "Listo. Te mandamos un email."
[error]   →  mensaje rojo debajo del input ("Email inválido", etc.)
```

Variantes:
- `compact`: input + botón inline (header de hero).
- `default`: bloque con eyebrow + título + form (CTA bands).

---

## 8. Onboarding Flows

### 8.1 Team (live, ajustes mínimos)

```
/onboarding (hub)
  → "Crear equipo" → /onboarding/create-team
      Step 1: nombre + logo
      Step 2: colores
      → redirect /home
  → "Unirme a equipo" → /onboarding/join-team
      Input código de 6 chars / link
      → /onboarding/setup-player (jersey + posición)
      → /home
  → "Crear liga" → /onboarding/create-league   [features.leagues ? wizard : redirect /para-ligas#waitlist]
```

**First value moment del team**:
- Crear equipo en <60 seg.
- Invitar al primer jugador (link compartible por WhatsApp).
- Cargar el primer partido (form rápido).

**Push para mejorar la activación**:
- Después de crear team, mostrar prominent CTA "Invita a tus jugadores ahora" (botón nativo Web Share / WhatsApp deep link).
- Si pasan 24h sin partido cargado, banner sutil en /home: "Crea tu primer partido y la app se llena de stats."

### 8.2 Liga (waitlist V1)

```
Click "Crear liga" en /onboarding o en /para-ligas
   ├─ features.leagues == true: wizard normal → /league/<slug>
   └─ features.leagues == false:
        → /para-ligas#waitlist (anchor scroll)
        → form de waitlist con audience='ligas'
        → success state + email de confirmación
        → cross-sell: "Mientras tanto, crea tu equipo →"
```

**Conversion hook (cuando salga del waitlist):**
1. Email manual del founder a las primeras 10–20 ligas: "Vi tu interés en LaPizarra Pro Liga. Estoy abriendo accesos uno a uno. ¿Cuántos equipos manejas?"
2. Si responden → enable feature flag para su user (override) → onboarding personal en una llamada de 20 min.
3. Pasados 1–2 ciclos de feedback → activamos para todos + lanzamos Stripe.

### 8.3 Mensajería de waitlist

- En `/para-ligas` con flag OFF: hero CTA "Pedir acceso" (no "Crear liga"). Subtítulo del waitlist: "Estamos abriendo Pro Liga de a poco. Anótate y te escribimos cuando se libere."
- Confirmación: "Anotado. Te avisamos por email cuando podás crear tu liga."
- Email: voz humana ("Soy [Founder], gracias por anotarte. Te escribo en un par de semanas con detalles…").

---

## 9. Landing + Pricing — Mejores CTAs

### 9.1 Landing (`/`)

**Hero**
- Eyebrow: `Fútbol amateur · 2026`.
- Title split: `LA / PIZARRA`.
- Subtitle: `La cancha tiene memoria. Cada partido, cada gol, cada plantilla — en un solo lugar.`
- **CTA primario**: `Crear equipo (gratis)` → `/onboarding/create-team`.
- **CTA secundario**: `Iniciar sesión` → `/auth/login`.
- **Microcopy debajo**: `¿Vas a organizar una liga? Anótate al waitlist →` → `/para-ligas`.

**Audience tiles** (3 cards)
- Cada tile claramente etiqueta: "GRATIS" o "EN LISTA DE ESPERA".

**Feature grid**
- 8 cards sin cambios respecto al plan original.

**CTA band final**
- Título: `Empieza hoy. Crear equipo es gratis.`
- Primario: `Crear equipo` → `/onboarding/create-team`.
- Secundario: `Anótame al waitlist Pro Liga` → `/para-ligas#waitlist`.

### 9.2 `/precios`

```
┌─ Free (Teams + Players) ──────┐  ┌─ Pro Liga ─────────────────┐
│ $0 / para siempre              │  │ $10.000 CLP / año / liga   │
│                                │  │ ── EN LISTA DE ESPERA ──   │
│ ✓ Equipos ilimitados           │  │                            │
│ ✓ Partidos + stats             │  │ Todo lo de Free +          │
│ ✓ Asistencia                   │  │ ✓ Crear liga               │
│ ✓ Finanzas equipo              │  │ ✓ Brackets + standings     │
│ ✓ Multi-equipo                 │  │ ✓ Vista pública            │
│                                │  │ ✓ PDF de fixtures          │
│  Crear equipo →                │  │ ✓ Generador automático     │
│                                │  │  Anotarme al waitlist →    │
└────────────────────────────────┘  └────────────────────────────┘

¿Federación o >50 equipos? Pricing custom — escríbenos.
```

**FAQ debajo**:
- ¿Por qué gratis los equipos? → "Porque queremos que el barrio entero entre."
- ¿Qué pasa cuando se abra Pro Liga? → "Te mandamos email. 30 días free para probar antes de cobrar."
- ¿Mis datos se borran si no pago? → "No. La liga queda en read-only y los datos están a la vista."
- ¿Aceptan transferencia / Mercado Pago? → "Cuando se abra, sí. Hoy estamos en lista de espera."

### 9.3 CTAs por audiencia

| Audiencia | CTA primario | CTA secundario |
| --- | --- | --- |
| `/para-ligas` (flag OFF) | `Anotarme al waitlist` (scroll a #waitlist) | `Ver liga de ejemplo` (si demo slug ON) |
| `/para-ligas` (flag ON) | `Crear liga` → `/onboarding/create-league` | `Anotarme al waitlist` (visitantes que dudan) |
| `/para-equipos` | `Crear equipo` → `/onboarding/create-team` | `Tengo un código` |
| `/para-jugadores` | `Crear cuenta` → `/auth/signup` | `Tengo un código` |

Cada audience page incluye además su `<WaitlistForm audience="…">` para capturar emails de visitantes que aún no convierten al CTA principal.

---

## 10. Dashboard Experience

### 10.1 Lo que ve un team manager hoy en `/home`

- Header con nombre + logo del equipo.
- Próximo partido + asistencia widget.
- Últimos resultados.
- Stats rápidas (3 tiles).
- Quick actions (ver plantilla, registrar partido).

### 10.2 Lo que vamos a agregar (V1)

**Card "¿Tu equipo está en una liga?"** (solo si team NO está en ninguna `league_teams`):
```
[Trophy icon]   ¿Manejas una liga amateur?
                Anótate al waitlist Pro Liga.
                                          [Anotarme →]
```

Posición: debajo del próximo partido, sutil. Una sola vez (dismissible vía localStorage).

**Banner top en `/league/[slug]/`** (cuando flag ON pero V1):
> "Pro Liga gratis durante la beta. Cuando lancemos cobramos $10.000/año por liga; te avisamos antes."

### 10.3 Cuando intenta "crear liga" desde el dashboard sin flag

- `/onboarding/create-league` con `features.leagues === false` → redirect a `/para-ligas#waitlist`.
- En la URL agregamos `?ref=onboarding` para tracking.
- El form del waitlist precarga `audience='ligas'` y `source='/onboarding/create-league'`.

### 10.4 Push hacia liga (futuro monetización)

- Cuando un equipo joinea su primera liga: email "Tu equipo ya juega en una liga 🎯". Soft sell del modelo.
- Cuando una liga tiene 8+ equipos activos: el organizador es un prospect alto-valor → priorizar en outreach.
- Cuando se abra cobro: enviar a los 50+ del waitlist primero, luego al public.

---

## 11. Métricas (V1 — qué medimos)

### 11.1 Tooling
- **Vercel Analytics** (ya instalado, gratis) → pageviews, top pages, geos, devices.
- **PostHog Cloud** (free tier 1M eventos/mes) → events, funnels, cohorts. **Decisión**: usar PostHog.
- **Supabase** (interno) → queries SQL para métricas de producto.

### 11.2 Eventos a trackear (PostHog)

```
# Funnel marketing
landing_view              { page, utm_*, user_id?, anon_id }
audience_page_view        { audience, source }
waitlist_submit           { audience, source, email_hash }
waitlist_email_confirmed  { audience }

# Funnel onboarding (autenticado)
signup_started
signup_completed          { method: 'username' }
team_create_started
team_create_completed     { team_id, name }
team_first_player_added   { team_id, players_count }
team_first_match_created  { team_id, match_id }      ← AHA moment

# Funnel liga
league_intent_clicked     { source: 'onboarding' | 'dashboard' | 'pricing' }
league_create_blocked     { reason: 'flag_off' }    ← redirect a waitlist
league_create_completed   { league_id, name }       ← cuando flag ON
league_first_team_added
league_first_fixture_created

# Engagement
match_event_added         { type: 'goal' | 'assist' | 'card', match_id }
attendance_set            { match_id, status }
team_dashboard_visit      { team_id }
share_public_league       { method: 'web_share' | 'copy' }
```

### 11.3 KPIs V1

| KPI | Cómo se mide | Target V1 |
| --- | --- | --- |
| Teams creados | `count(*) from teams where deleted_at is null` | 200 en 30 días |
| Teams activos (30d) | teams con 1+ match en últimos 30d | 50% del total |
| Players registrados | `count(*) from profiles` | 1.500 |
| Waitlist Pro Liga | `count(*) from marketing_waitlist where audience='ligas'` | **50** (este es el trigger para Stripe) |
| Activation rate (team) | % teams que crean 1 partido en 7d | 40% |
| Viral coef (player) | players/team promedio | 8+ |
| Conversion landing → signup | pageviews `/` → `signup_completed` | 5% |
| Waitlist submit rate | pageviews `/para-ligas` → `waitlist_submit` | 10% |

### 11.4 Cadencia de review
- **Semanal**: KPIs principales en planilla (Notion/Sheets).
- **Mensual**: cohort de retención + feedback cualitativo (1:1 con 3 ligas top del waitlist).

---

## 12. Execution Roadmap

### Sprint 1 (3–5 días) — Foundation marketing

**Objetivo**: tener las páginas + waitlist funcional online.

1. **Migración `marketing_waitlist`** — tabla + RPC submit + RPC unsubscribe. Aplicar via MCP.
2. **Server action `submitWaitlist`** + helper de email (Resend). Crear cuenta Resend, obtener API key.
3. **Componentes shared marketing** (`components/marketing/*`).
4. **Mover landing**: borrar `app/page.tsx` → crear `app/(marketing)/layout.tsx` + `app/(marketing)/page.tsx`.
5. **Middleware** — extender allowlist de paths públicos.
6. **Verificación** — `pnpm dev` carga `/`, no rompe el redirect logueado.

### Sprint 2 (3–5 días) — Audience pages

7. `/para-ligas` con waitlist + branch flag.
8. `/para-equipos` con waitlist + CTA fuerte.
9. `/para-jugadores` con waitlist.
10. Cross-links + footer + nav adapt.

### Sprint 3 (2–3 días) — Soporte

11. `/precios` con dos planes + FAQ.
12. `/terminos` y `/privacidad` (texto base; ticket legal en paralelo).
13. `/blog` + `/blog/[slug]` con 2–3 posts iniciales (TS-as-data, sin parser).

### Sprint 4 (2 días) — Tracking + push

14. PostHog SDK + eventos críticos (`signup_completed`, `team_create_completed`, `team_first_match_created`, `waitlist_submit`).
15. UTMs en CTAs de campañas (estructura `utm_source/medium/campaign` por canal).
16. Push hacia liga: card "¿Manejas liga?" en `/home` cuando aplica.
17. Branch waitlist en `/onboarding/create-league` (redirect cuando flag OFF).

### Sprint 5 (1 día) — QA + deploy

18. QA manual de todas las páginas (logged in / logged out / mobile / desktop).
19. Deploy a Vercel preview → review.
20. Promote to production.
21. Anuncio en redes (Instagram + WhatsApp) con UTMs.

**Total estimado**: ~2–2.5 semanas a un dev, en paralelo a otras tareas.

---

## 13. Distribución V1 (canales)

| Canal | Para qué | Acción concreta |
| --- | --- | --- |
| **Instagram orgánico** | Awareness audiencias `equipos` + `jugadores` | Posts con highlights de partidos hechos en LaPizarra (mockups o capturas reales si hay teams beta). Reels cortos: "Cómo registrar un partido en 1 min". |
| **WhatsApp directo** | Outreach a ligas conocidas | Mensaje 1:1 al organizador con link a `/para-ligas#waitlist`. ICP: 8–30 equipos. |
| **TikTok** | Growth jugadores (16–25) | Reels de stats reales (gif del top scorer aparece en pantalla, sound trending). |
| **Boca a boca / referidos** | Equipos que ya están dentro | Invite link nativo + Web Share API en cada team page. |
| **Inbound SEO (blog)** | Long-term, post launch | 2–3 posts iniciales sobre "Cómo organizar una liga amateur" / "Cómo trackear stats sin Excel". |

UTMs estándar:
```
?utm_source=instagram&utm_medium=story&utm_campaign=v1_launch
?utm_source=whatsapp&utm_medium=direct&utm_campaign=ligas_outreach
```

---

## 14. Risks

### 14.1 Product risk
- **Riesgo**: lanzamos las pages pero no tenemos ningún equipo activo "demo" para mostrar capturas. Mitigación: usar mocks UI en HTML (ya planeados) que se ven idénticos al producto. Crear 1 liga interna con datos seed para `/public/league/<demo-slug>`.
- **Riesgo**: el flag de leagues se prende y se rompe algo. Mitigación: feature flag por usuario (override en DB) + smoke test en cada deploy.

### 14.2 Adoption risk
- **Riesgo**: los teams no llegan al "first value moment" (primer partido cargado). Mitigación: flow de onboarding rápido (<3 minutos) + CTAs prominentes para invitar jugadores y crear partido.
- **Riesgo**: las ligas se anotan pero no convierten a pago. Mitigación: outreach manual a las primeras 20, llamadas de 20 min, ajustar pricing si hay objeción de precio (downsell a $5k o split por temporada).
- **Riesgo**: nadie llega a la landing porque no hay tráfico. Mitigación: WhatsApp directo a 50+ ligas conocidas en CL/AR primer mes; Instagram con 10 reels en primeras 4 semanas.

### 14.3 Monetization risk
- **Riesgo**: $10k/año se siente caro o barato. Mitigación: medir CAC vs LTV con primeros 20 ligas. Si convierten >50% del waitlist a $10k, considerar subir; si convierten <10%, considerar un plan inferior ($5k temporada) o ajustar value props.
- **Riesgo**: las ligas piden facturación formal antes de pagar. Mitigación: Stripe ya soporta facturación CL básica; emisión de boleta vía servicio externo (Bsale o Defontana) — out of V1, en V2.

### 14.4 Tech risk
- **Riesgo**: Resend deja de funcionar / hits cuota. Mitigación: cuota free 3.000/mes alcanza para >1.000 waitlist + transactional. Si excede, mover a SES o pagar Resend ($20/mes).
- **Riesgo**: hydration mismatch en marketing nav. Mitigación: ya planificado — split server/client cuidadoso.

### 14.5 Compliance risk
- **Riesgo**: capturamos emails sin notice de privacidad. Mitigación: línea de consentimiento debajo de cada `<WaitlistForm>` + página `/privacidad` lista al deploy.

---

## 15. Decisiones que necesito confirmar (antes de ejecutar)

- [ ] **Moneda y precio Pro Liga**: $10.000 CLP/año/liga (asumido). Confirmar si es CLP, ARS, USD, otro.
- [ ] **Resend** como proveedor de email transaccional (free tier suficiente). Alternativa: Postmark, SES.
- [ ] **PostHog** como analytics (free tier 1M eventos). Alternativa: Plausible (mejor para privacy, menos eventos), Mixpanel (más caro).
- [ ] **Demo league slug**: ¿armamos una liga interna con datos para que `/para-ligas` muestre `Ver liga de ejemplo`? Puede ser una liga ficticia "Liga Maipú 2026" con 6 equipos placeholder.
- [ ] **Voz**: confirmado **tú** alineado al resto de la app.
- [ ] **Páginas extra**: confirmadas — landing + 3 audiencias + precios + términos + privacidad + blog.
- [ ] **Waitlist en cada audiencia**: confirmado.

---

## 16. Critical files (para ejecutar)

### Migrations (a aplicar via MCP)
- `supabase/migrations/2026XXXX_marketing_waitlist.sql` — tabla + RPCs `submit_marketing_waitlist`, `unsubscribe_waitlist`.

### Backend lib
- `lib/marketing/waitlist.ts` — server actions `submitWaitlist`, `unsubscribeWaitlist`.
- `lib/marketing/email.ts` — wrapper de Resend (templates inline).
- `lib/analytics.ts` — wrapper de PostHog (track helper).

### Marketing pages
- `app/page.tsx` (DELETE) → `app/(marketing)/page.tsx`.
- `app/(marketing)/layout.tsx`.
- `app/(marketing)/para-ligas/page.tsx`.
- `app/(marketing)/para-equipos/page.tsx`.
- `app/(marketing)/para-jugadores/page.tsx`.
- `app/(marketing)/precios/page.tsx`.
- `app/(marketing)/terminos/page.tsx`.
- `app/(marketing)/privacidad/page.tsx`.
- `app/(marketing)/blog/page.tsx`.
- `app/(marketing)/blog/[slug]/page.tsx`.
- `app/waitlist/unsubscribe/[token]/page.tsx`.

### Components
- `components/marketing/*.tsx` (12 componentes — ver plan original).

### Onboarding ajuste
- `app/onboarding/create-league/page.tsx` — branch redirect a `/para-ligas#waitlist` cuando `features.leagues === false`.

### Dashboard ajustes
- `app/home/page.tsx` — card "¿Manejas una liga?".
- `app/league/[slug]/page.tsx` — banner "Beta gratis" si flag ON.

### Middleware
- `middleware.ts` — extender `isPublic`.

---

## 17. Resumen ejecutivo (para founders)

**Qué estamos haciendo**:
Ship V1 del surface público de LaPizarra, con segmentación por audiencia y waitlist funcional para ligas. Sin Stripe.

**Por qué**:
Validar que las ligas amateur están dispuestas a pagar **$10.000 CLP/año** antes de invertir en flow de pagos. Mientras, hacer crecer la base gratis (teams + players) que es el motor viral.

**Cuándo**:
~2–2.5 semanas de un dev part-time. Lanzamiento target: **2026-05-15**.

**Trigger para activar cobro**:
50 ligas en waitlist O 5 ligas convertidas manualmente con feedback positivo. Lo que ocurra primero.

**Qué pasa si no funciona**:
- <20 ligas en waitlist en 60 días → revisamos posicionamiento + precio. Posible downsell a $5k.
- <50% activation de teams → mejoramos onboarding (más push al primer partido).

**Qué pasa si funciona**:
- Activamos Stripe para Pro Liga.
- Empezamos a pensar Team Premium (Instagram CM tools).
- Expandimos a Argentina con MercadoPago.

---

*V1 Blueprint — Living document. Actualizar al final de cada sprint con lo aprendido.*
