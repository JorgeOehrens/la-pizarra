# Roadmap de Implementación — Finanzas del Equipo

> Agente: Implementation Planner Agent
> Objetivo: Definir el orden de implementación, dependencias, quick wins del MVP y las fases siguientes.

---

## Principio de Implementación

> Construir el módulo de afuera hacia adentro: primero la visibilidad (leer), luego la acción (crear), luego la automatización.

Un jugador que puede **ver su deuda** ya percibe valor del módulo. El admin que puede **crear y confirmar cobros** ya tiene el ciclo completo. Todo lo demás es optimización.

---

## Fase 1 — MVP ✅ COMPLETADO — 2026-04-16

### Sprint 1A: Base de datos y lógica de negocio ✅

| Tarea | Output | Estado |
|---|---|---|
| 4 ENUMs SQL | `charge_type`, `charge_status`, `distribution_type`, `distribution_status` | ✅ |
| Tabla `team_charges` | En Supabase con índices y trigger updated_at | ✅ |
| Tabla `charge_distributions` | En Supabase con unique(charge_id, member_id) | ✅ |
| Tabla `payment_records` | En Supabase con auditoría completa | ✅ |
| Vista `player_pending_charges` | Deuda activa por jugador | ✅ |
| Vista `team_finance_summary` | Resumen financiero por equipo | ✅ |
| Trigger `auto_complete_charge` | Auto-completa cobro cuando todos pagan | ✅ |
| 6 RLS policies | SELECT para miembros, ALL para admins | ✅ |

**Archivo de migración:** `supabase/migrations/20260416100000_finance_module.sql`
**Aplicada en producción:** 2026-04-16 vía Supabase MCP

---

### Sprint 1B: Server Actions ✅

**Archivo:** `app/finance/actions.ts`

| Acción | Firma | Estado |
|---|---|---|
| `createCharge` | `(payload: CreateChargePayload) → { ok, chargeId } \| { error }` | ✅ |
| `confirmPayment` | `(distributionId, amount, notes?) → { ok } \| { error }` | ✅ |
| `updateDistributionStatus` | `(distributionId, status) → { ok } \| { error }` | ✅ |
| `cancelCharge` | `(chargeId) → { ok } \| { error }` | ✅ (adelantado desde Fase 2) |

Las queries de lectura van inline en los page.tsx (patrón del proyecto).

---

### Sprint 1C + 1D: UI completa ✅

> **Nota:** La ruta raíz es `/finance/` (no `/team/finance/` como se planificó). Ver DEC-FIN-008.

| Archivo | Ruta | Descripción | Estado |
|---|---|---|---|
| `app/finance/page.tsx` + `finance-view.tsx` | `/finance` | Vista principal (admin y jugador) | ✅ |
| `app/finance/new/page.tsx` + `create-charge-form.tsx` | `/finance/new` | Wizard 3 pasos para admin | ✅ |
| `app/finance/[chargeId]/page.tsx` + `charge-detail-view.tsx` | `/finance/[id]` | Detalle de deuda (jugador) | ✅ |
| `app/finance/[chargeId]/manage/page.tsx` + `manage-charge-view.tsx` | `/finance/[id]/manage` | Gestión admin con sheets | ✅ |
| `app/finance/loading.tsx` | — | Skeleton de carga | ✅ |

---

### Sprint 1E: Integración y pulido ✅

- Tab "Finanzas" en `MobileNav` (reemplazó "Stats/Analytics") — ver DEC-FIN-007
- Skeletons de carga en `loading.tsx`
- Validaciones en server actions y en el wizard
- Build de producción pasa sin errores TypeScript

---

## Entregables del MVP — Estado final

- [x] Admin crea un cobro de cualquier tipo (6 tipos)
- [x] Admin distribuye el cobro con reglas (igual, fijo, custom)
- [x] Admin registra quién pagó el total (beneficiario)
- [x] Admin puede cancelar un cobro activo
- [x] Jugador ve sus deudas activas, vencidas e historial pagado
- [x] Jugador ve a quién le debe y cuánto
- [x] Admin confirma pagos manualmente (sheet con monto + nota)
- [x] Admin puede eximir o excluir jugadores de un cobro
- [x] Cobro se completa automáticamente cuando todos pagan (trigger DB)
- [x] Admin ve el estado general de todos los cobros del equipo
- [x] Build en producción ✅

---

## Fase 2 — Mejoras de experiencia (estimado: 2-3 semanas)

### Prioridad alta

- **Notificaciones push** al crear un nuevo cobro (requiere [[10-Integrations/Index]] o servicio de notificaciones)
- **Recordatorios automáticos** X días antes del vencimiento
- **Editar cobro** después de creado (cambiar monto, ajustar distribución)
- ~~**Cancelar cobro** con razón~~ → ✅ Implementado en MVP
- **Pagos parciales con UI** — la lógica ya existe en `confirmPayment`, falta exposición visual

### Prioridad media

- **Exportar resumen** del cobro (PDF o compartir imagen para WhatsApp)
- **Historial filtrado** por tipo, fecha, estado
- **Cobros recurrentes** (crear desde una plantilla — ej: cuota mensual de liga)
- **Comentarios en cobros** (admin puede dejar notas)
- **Vista de temporada** con resumen financiero anual

### Prioridad baja

- **Créditos** entre jugadores (ej: pagué de más, aplica a próximo cobro)
- **Presupuesto del equipo** (gasto estimado vs real de la temporada)
- **Multi-beneficiario** (cuando dos personas pusieron plata)

---

## Fase 3 — Integración con pagos reales (estimado: 4-6 semanas)

### Prerequisitos

- [ ] Definir mercado objetivo (Chile → Flow / Mercado Pago; España → Stripe; LATAM → Mercado Pago)
- [ ] Evaluar KYC / requisitos legales por país
- [ ] Definir modelo de comisiones (¿LaPizarra cobra algo?)

### Componentes

| Componente | Descripción |
|---|---|
| Payment Intent | Crear intención de pago para un cobro |
| Webhook handler | Recibir confirmación del proveedor |
| Payment UI | Botón "Pagar ahora" con redirect/modal real |
| Conciliación | Match automático entre pago recibido y distribución |
| Comprobantes | Generar y guardar recibo de pago |

### Arquitectura de la integración

```
Jugador toca "Pagar ahora"
      ↓
Server Action: createPaymentIntent(distributionId)
      ↓
API del proveedor (Mercado Pago / Stripe)
      ↓
Redirect o Modal de pago
      ↓
Webhook: paymentSucceeded → confirmPayment(distributionId, amount)
      ↓
Estado actualizado en Supabase
      ↓
Notificación al admin y al jugador
```

**Ventaja del diseño MVP:** El handler de confirmación ya existe (`confirmPayment`). La integración solo agrega el trigger automático vía webhook, sin cambiar el modelo de datos ni la UI.

---

## Dependencias Técnicas del Módulo

```
team_members (roles, status)     ← requerido para distribuciones
     ↓
team_charges                     ← base del módulo
     ↓
charge_distributions             ← una por jugador
     ↓
payment_records                  ← auditoría de pagos
```

Este módulo es **independiente** de `matches` y `match_events`. No requiere que haya partidos registrados para funcionar.

---

## Quick Wins Identificados

Estas funcionalidades dan el mayor valor con el menor esfuerzo:

1. **Vista de deuda del jugador** — 1 query, 1 componente — máximo impacto inmediato
2. **Crear cobro "partes iguales"** — el tipo más común, el más simple de implementar
3. **Confirmar pago** — cierra el ciclo básico en 3 taps del admin
4. **Beneficiario visible** — resolver "¿a quién le debo?" sin ambigüedad

---

*Implementation Planner Agent — LaPizarra Knowledge Base*
