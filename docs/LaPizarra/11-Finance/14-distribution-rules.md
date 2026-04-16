# Reglas de Distribución — Finanzas del Equipo

> Agente: Payments Logic Agent
> Objetivo: Modelar todas las variantes de distribución de cobros, incluyendo porcentajes personalizados, montos fijos, exclusiones y edge cases.

---

## Tipos de Distribución

### 1. `equal` — Partes iguales

El monto total se divide en partes iguales entre todos los jugadores incluidos.

```
Total: $20.000 | 5 jugadores incluidos
→ Cada uno: $4.000
```

**Algoritmo:**
```typescript
const perPlayer = totalAmount / includedCount;
// Redondeo: si hay residuo, se asigna al primero de la lista
```

**Cuándo usar:** Cancha, asado, cuota base.

---

### 2. `fixed_amount` — Monto fijo por jugador

Cada jugador tiene un monto fijo asignado. El total puede o no cuadrar exactamente con el total del cobro.

```
Polera de portero:   $8.000
Polera de jugador:   $6.000
→ Cada uno paga según su tipo
```

**Cuándo usar:** Indumentaria diferenciada, eventos con precio fijo por persona.

**Validación:** La suma de montos fijos debe igualar `total_amount`. Si no coincide, el sistema advierte al admin antes de crear el cobro.

---

### 3. `custom` — Porcentaje o monto personalizado por jugador

El admin puede asignar un porcentaje o monto específico para cada jugador. El sistema calcula el monto de cada uno.

```
Total: $60.000

Carlos M.   trabajador   100%  →  $8.571
Pedro R.    trabajador   100%  →  $8.571
Diego L.    estudiante    50%  →  $4.285
Ana K.      estudiante    50%  →  $4.285
[Invitado]  exento         0%  →  $0
Juan G.     pagó total     0%  →  $0 (ya lo puso él)
                    ─────────────────────
                    Total: $60.000 ✓
```

**Cómo se calcula:**
1. Se parte del total del cobro
2. Cada jugador tiene un `rate` (0.0 a 1.0 o monto absoluto)
3. Se calcula el "peso total" de todos los incluidos
4. Se distribuye proporcionalmente al peso

**Algoritmo de distribución proporcional por peso:**
```typescript
function distributeByWeight(
  total: number,
  members: { id: string; weight: number }[]
): { id: string; amount: number }[] {
  const totalWeight = members.reduce((sum, m) => sum + m.weight, 0);
  const distributions = members.map(m => ({
    id: m.id,
    amount: Math.floor((m.weight / totalWeight) * total * 100) / 100,
  }));

  // Ajuste por centavos perdidos en el redondeo
  const distributed = distributions.reduce((sum, d) => sum + d.amount, 0);
  const remainder = +(total - distributed).toFixed(2);
  if (remainder > 0 && distributions.length > 0) {
    distributions[0].amount = +(distributions[0].amount + remainder).toFixed(2);
  }

  return distributions;
}
```

---

## Tipos de Jugador y Tasas Predeterminadas

El sistema NO fuerza una categoría de jugador para las finanzas. Las tasas se definen **por cobro**, no por perfil. Sin embargo, el admin puede aplicar patrones comunes:

| Tipo de Situación | Tasa sugerida | Descripción |
|---|---|---|
| Trabajador tiempo completo | 100% | Tarifa completa |
| Estudiante | 50% | Mitad del monto |
| Jugador nuevo (primer mes) | 0% o 50% | A criterio del admin |
| Invitado / jugador de relleno | 0% | No aplica |
| El que pagó el total | 0% | Ya puso el dinero |
| Exento por acuerdo del equipo | 0% | Status `exempt` |

**Importante:** Estas tasas se asignan por cobro, no se guardan como atributo del jugador. Esto es intencional para dar máxima flexibilidad.

---

## Regla del Beneficiario (quien pagó el total)

Cuando alguien pagó el gasto completo (cancha, asado, etc.):

1. El `beneficiary_id` del cobro apunta a ese jugador
2. Su `charge_distribution` tiene `assigned_amount = 0` y `status = 'not_applicable'`
3. Todos los demás deben pagar su parte → el dinero va hacia ese jugador
4. El sistema muestra explícitamente "Le debes $X a [Nombre]"

**Invariante:**
```
sum(assigned_amount para todos los no-exentos) == total_amount
```

Cuando el beneficiario existe, su $0 no afecta la suma, y el resto paga el 100% del costo.

---

## Exclusiones

Un jugador puede quedar excluido de un cobro con dos estados distintos:

| Estado | Monto | Significado |
|---|---|---|
| `exempt` | $0 | Exento por decisión del equipo (no debe pagar) |
| `not_applicable` | $0 | No aplica para este cobro (no asistió, no pidió polera, etc.) |

**Diferencia semántica:**
- `exempt`: El jugador *podría* haber pagado pero se decidió eximirlo
- `not_applicable`: El cobro simplemente no le corresponde (ej: no pidió camiseta)

Ambos se muestran en el detalle del cobro pero con indicadores diferentes.

---

## Edge Cases

### EC-01: El total no cuadra con la distribución custom

**Escenario:** Admin asigna montos fijos que no suman el total.

**Manejo:**
- El sistema muestra una advertencia en tiempo real mientras el admin edita
- No se puede crear el cobro hasta que la suma cuadre ±$0.01
- UI: `"Distribuido: $19.500 de $20.000 — Faltan $500"`

### EC-02: Cero jugadores incluidos

**Escenario:** Admin crea cobro pero excluye a todos.

**Manejo:**
- Bloquear la creación con mensaje de error
- Requiere al menos 1 jugador con `assigned_amount > 0`

### EC-03: Jugador sale del equipo después de un cobro activo

**Escenario:** Pedro debe $4.000 pero salió del equipo.

**Manejo:**
- Su `charge_distribution` persiste (no se elimina)
- El admin puede marcarlo como `not_applicable` o dejar la deuda activa
- La deuda históricamente queda registrada en `payment_records`
- La vista del equipo lo muestra como "jugador inactivo"

### EC-04: Monto ingresado con centavos (redondeo)

**Escenario:** $20.000 / 3 jugadores = $6.666,67

**Manejo:**
- Se redondea hacia abajo en todos
- El centavo restante se asigna al primer jugador de la lista
- El total siempre cuadra exactamente

### EC-05: Cambio del monto total post-creación

**Escenario:** El asado costó $18.000 pero el admin había puesto $20.000.

**Manejo (Fase 2):**
- El admin puede editar `total_amount` mientras el cobro está en `active`
- El sistema recalcula automáticamente todas las distribuciones pendientes
- Las distribuciones ya marcadas como `paid` no se modifican
- Se requiere confirmación antes de recalcular

### EC-06: Pago mayor al monto asignado

**Escenario:** Diego debía $4.000 pero pagó $5.000.

**Manejo:**
- El admin puede registrar $5.000 como `paid_amount`
- El sistema lo marca como `paid`
- El exceso queda en `notes` a criterio del admin (¿propina? ¿anticipo del siguiente cobro?)
- No se modela crédito automático en el MVP

---

## Resumen de Distribuciones Soportadas

| Tipo | Descripción | Caso de uso típico |
|---|---|---|
| `equal` | Partes iguales | Cancha, asado, eventos |
| `fixed_amount` | Monto fijo por jugador | Poleras, entradas |
| `custom` | % o monto individual | Cuotas con diferencia socioeconómica |
| Excluido (`not_applicable`) | No aplica | Jugador no fue al asado |
| Exento (`exempt`) | Eximido del cobro | Política del equipo |
| Beneficiario | Pagó el total, recibe devolución | Juan pagó la cancha |

---

*Payments Logic Agent — LaPizarra Knowledge Base*
