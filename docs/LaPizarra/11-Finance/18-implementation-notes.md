# Notas Técnicas de Implementación — Finanzas

> Agente: Documentation Agent
> Objetivo: Referencia técnica post-implementación. Verdad única sobre lo que está construido.
> **Fecha de implementación:** 2026-04-16

---

## Estructura de archivos

```
app/finance/
├── actions.ts                        ← Server actions (create, confirm, status, cancel)
├── finance-view.tsx                  ← Client: vista principal (admin + jugador)
├── loading.tsx                       ← Skeleton de carga
├── page.tsx                          ← Server: queries + renderiza FinanceView
├── new/
│   ├── create-charge-form.tsx        ← Client: wizard 3 pasos
│   └── page.tsx                      ← Server: carga miembros del equipo
└── [chargeId]/
    ├── charge-detail-view.tsx        ← Client: vista de deuda del jugador
    ├── page.tsx                      ← Server: redirige admins a /manage
    └── manage/
        ├── manage-charge-view.tsx    ← Client: gestión admin + sheets
        └── page.tsx                  ← Server: carga charge + distributions + profiles

supabase/migrations/
└── 20260416100000_finance_module.sql ← Migración aplicada en producción

components/
└── mobile-nav.tsx                    ← Modificado: "Stats" → "Finanzas" (Wallet icon)
```

---

## FK Constraint Names (crítico para joins de PostgREST)

Estos nombres se usan al hacer joins en las queries de Supabase:

| Tabla | Columna | Constraint Name |
|---|---|---|
| `team_charges` | `team_id` | `team_charges_team_id_fkey` |
| `team_charges` | `created_by` | `team_charges_created_by_fkey` |
| `team_charges` | `beneficiary_id` | `team_charges_beneficiary_id_fkey` |
| `charge_distributions` | `charge_id` | `charge_distributions_charge_id_fkey` |
| `charge_distributions` | `member_id` | `charge_distributions_member_id_fkey` |
| `charge_distributions` | `team_id` | `charge_distributions_team_id_fkey` |
| `payment_records` | `distribution_id` | `payment_records_distribution_id_fkey` |
| `payment_records` | `payer_id` | `payment_records_payer_id_fkey` |
| `payment_records` | `confirmed_by` | `payment_records_confirmed_by_fkey` |

**Ejemplo de uso en query:**
```typescript
supabase.from("charge_distributions").select(`
  id, member_id, assigned_amount,
  member:profiles!charge_distributions_member_id_fkey(display_name, username)
`)
```

---

## Server Actions — Firmas completas

```typescript
// app/finance/actions.ts

createCharge(payload: CreateChargePayload)
  → Promise<{ ok: true; chargeId: string } | { error: string }>

confirmPayment(distributionId: string, amount: number, notes?: string)
  → Promise<{ ok: true } | { error: string }>

updateDistributionStatus(distributionId: string, status: "exempt" | "not_applicable")
  → Promise<{ ok: true } | { error: string }>

cancelCharge(chargeId: string)
  → Promise<{ ok: true } | { error: string }>
```

---

## Tipos exportados desde `actions.ts`

```typescript
type ChargeType = "cancha" | "cuota_liga" | "asado" | "indumentaria" | "evento" | "otro"
type DistributionType = "equal" | "fixed_amount" | "custom"
type DistributionStatus = "pending" | "paid" | "partial" | "exempt" | "not_applicable"

interface CreateChargePayload {
  name: string
  description: string
  charge_type: ChargeType
  total_amount: number
  distribution_type: DistributionType
  beneficiary_id: string | null
  due_date: string | null          // "YYYY-MM-DD"
  distributions: MemberDistributionInput[]
}
```

---

## Tipos exportados desde `finance-view.tsx`

```typescript
type TeamCharge = {
  id, name, charge_type, total_amount, status, due_date,
  beneficiary_id, beneficiary_name?, created_at,
  dist_summary?: { total: number; paid: number; collected: number } | null
}

type MyDistributionRow = {
  id, charge_id, assigned_amount, paid_amount, status,
  charge: TeamCharge | null
}
```

---

## Lógica de routing por rol

| Ruta | Jugador | Admin |
|---|---|---|
| `/finance` | Ve sus deudas pendientes + historial | Ve resumen del equipo + todos los cobros |
| `/finance/new` | Redirect a `/finance` | Wizard de creación |
| `/finance/[id]` | Vista de su deuda en ese cobro | Redirect a `/finance/[id]/manage` |
| `/finance/[id]/manage` | Redirect a `/finance/[id]` | Gestión completa |

---

## Comportamientos automáticos (trigger DB)

**`auto_complete_charge`** — se dispara `AFTER UPDATE` en `charge_distributions` cuando `new.status IN ('paid', 'exempt', 'not_applicable')`:
- Cuenta cuántas distribuciones del cobro siguen en `pending` o `partial`
- Si llega a 0 → actualiza `team_charges.status = 'completed'`

---

## Deuda técnica conocida

| Item | Impacto | Prioridad Fase 2 |
|---|---|---|
| Vistas `player_pending_charges` y `team_finance_summary` no tienen `security_invoker` — pueden no respetar RLS si se acceden directamente | Bajo (no se usan en la app todavía) | Media |
| No hay `overdue` automático — el campo `due_date` existe pero nadie marca el cobro como `overdue` | Bajo (UI no lo depende) | Alta — necesita pg_cron |
| Completed charges no muestran dist_summary en la vista admin | Visual menor | Baja |
| Pagos parciales tienen lógica en server action pero sin UI dedicada | Funcional vía sheet de monto | Media |

---

## Lo que NO se implementó en esta fase (Fase 2+)

- Notificaciones push al crear un cobro
- Recordatorios automáticos por vencimiento
- Editar cobro después de creado
- Exportar resumen del cobro
- Cobros recurrentes / plantillas
- Vista de deudas cross-team en el perfil del usuario
- Integración con pasarela de pagos real

---

*Documentation Agent — LaPizarra Knowledge Base*
