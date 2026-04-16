# UX de Pagos — Finanzas del Equipo

> Agente: Fintech UX Agent
> Objetivo: Diseñar la experiencia de cobro y pago, estilo wallet / payment sheet, mobile-first y clara.

---

## Principios UX para el módulo

1. **Una acción por pantalla** — El usuario nunca duda qué hacer
2. **Claridad de deuda** — Cuánto, a quién, y cuándo: visible en 2 segundos
3. **Confianza antes de actuar** — Resumen antes de confirmar cualquier acción
4. **Feedback inmediato** — El estado cambia visiblemente al confirmar
5. **Admin flujo rápido** — Confirmar un pago debe tomar menos de 3 taps

---

## Flujo 1: El jugador ve sus deudas

### Entrada: tab / sección "Finanzas" en el equipo activo

```
┌─────────────────────────────────────┐
│  ← Los Cóndores                     │
│                                     │
│  💰 Finanzas                        │
│                                     │
│  Mis pendientes                     │
│  ┌────────────────────────────────┐ │
│  │ 🏟 Cancha 15 Mayo              │ │
│  │    Le debes $4.000 a Juan G.   │ │
│  │    Vence 20 May  ● Pendiente   │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🏆 Cuota Liga Invierno         │ │
│  │    Debes $5.000 al equipo      │ │
│  │    Vence 30 Abr  🔴 Vencido   │ │
│  └────────────────────────────────┘ │
│                                     │
│  Historial                          │
│  ┌────────────────────────────────┐ │
│  │ 🍖 Asado 10 Mayo    ✓ Pagado  │ │
│  │    $2.500                      │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Notas UX:**
- Cards diferenciadas: deuda a compañero vs deuda al equipo
- Color rojo para vencidos, amarillo para próximos a vencer
- El historial muestra lo ya pagado para dar sensación de progreso

---

## Flujo 2: El jugador toca un cobro pendiente

### Sheet de detalle del cobro (tipo Apple Pay sheet — sube desde abajo)

```
┌─────────────────────────────────────┐
│                                     │
│         ████████████████            │
│  ─────────────────────────────────  │
│                                     │
│  🏟  Cancha 15 Mayo                 │
│      Partido vs Unión               │
│                                     │
│  Tu parte          $4.000           │
│  ──────────────────────────────     │
│  A quién va:                        │
│  👤 Juan García                     │
│     (él pagó la cancha completa)    │
│                                     │
│  Fecha límite:  20 de Mayo          │
│  Estado:        ● Pendiente         │
│                                     │
│  ──────────────────────────────     │
│  Estado del cobro                   │
│  2 de 5 pagaron                     │
│  ████░░░░░░  40%                    │
│                                     │
│  ┌──────────────────────────────┐   │
│  │     Avisar que ya pagué      │   │
│  └──────────────────────────────┘   │
│  (envía mensaje al admin)           │
│                                     │
└─────────────────────────────────────┘
```

**Notas UX:**
- El botón "Avisar que ya pagué" envía notificación al admin (o abre WhatsApp, según configuración)
- El jugador **no puede confirmarse a sí mismo** — solo avisa
- Barra de progreso del cobro para contexto social (presión positiva)

---

## Flujo 3: Admin crea un nuevo cobro

### Paso 1 — Tipo de cobro

```
┌─────────────────────────────────────┐
│  ← Nuevo cobro                      │
│                                     │
│  ¿Qué tipo de cobro es?             │
│                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ 🏟     │ │ 🏆     │ │ 🍖     │  │
│  │Cancha  │ │ Liga   │ │ Asado  │  │
│  └────────┘ └────────┘ └────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ 👕     │ │ 🎉     │ │ ···    │  │
│  │Polera  │ │Evento  │ │  Otro  │  │
│  └────────┘ └────────┘ └────────┘  │
└─────────────────────────────────────┘
```

### Paso 2 — Detalle del cobro

```
┌─────────────────────────────────────┐
│  ← Cancha                           │
│                                     │
│  Nombre                             │
│  ┌─────────────────────────────┐    │
│  │ Cancha 15 Mayo              │    │
│  └─────────────────────────────┘    │
│                                     │
│  Monto total                        │
│  ┌─────────────────────────────┐    │
│  │ $20.000                     │    │
│  └─────────────────────────────┘    │
│                                     │
│  Fecha límite de pago               │
│  ┌─────────────────────────────┐    │
│  │ 20 de Mayo 2026             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ¿Alguien pagó el total?            │
│  ┌─────────────────────────────┐    │
│  │ ○ No — es recaudación       │    │
│  │ ● Sí — Juan García lo pagó  │    │
│  └─────────────────────────────┘    │
│                                     │
│  [ Siguiente → ]                    │
└─────────────────────────────────────┘
```

### Paso 3 — Distribución

```
┌─────────────────────────────────────┐
│  ← Distribuir cobro                 │
│                                     │
│  ¿Cómo se reparte?                  │
│  ● Partes iguales                   │
│  ○ Monto fijo por jugador           │
│  ○ Personalizado                    │
│                                     │
│  Incluir en el cobro (5/8)          │
│                                     │
│  ✓  Carlos M.          $4.000       │
│  ✓  Pedro R.           $4.000       │
│  ✓  Diego L.  50%      $2.000  ✎   │
│  ✓  Ana K.    50%      $2.000  ✎   │
│  ✓  Juan G.   pagó     $0.000  ✎   │
│  ○  [Jugador]  excluir             │
│                                     │
│  Total distribuido: $20.000 ✓       │
│                                     │
│  [ Crear cobro ]                    │
└─────────────────────────────────────┘
```

**Notas UX:**
- El que pagó el total aparece con $0 (no le cobras al que ya puso)
- Icono ✎ para editar porcentaje/monto individual
- Validación: el total distribuido debe sumar el monto total

---

## Flujo 4: Admin confirma un pago

### Vista del cobro (admin)

```
┌─────────────────────────────────────┐
│  ← Cancha 15 Mayo                   │
│                                     │
│  $20.000 total  |  2/5 pagaron      │
│  ████░░░░░░  40%                    │
│                                     │
│  ✅ Carlos M.       $4.000  pagó    │
│  ✅ Pedro R.        $4.000  pagó    │
│  ⏳ Diego L.        $2.000  pend.   │
│  ⏳ Ana K.          $2.000  pend.   │
│  ─  Juan G.         —      (pagó)   │
│                                     │
│  [ + Registrar pago ]               │
└─────────────────────────────────────┘
```

### Sheet de confirmar pago (al tocar un pendiente)

```
┌─────────────────────────────────────┐
│                                     │
│  Confirmar pago de                  │
│  Diego L.                           │
│                                     │
│  Monto esperado:  $2.000            │
│                                     │
│  Monto recibido                     │
│  ┌─────────────────────────────┐    │
│  │ $2.000                      │    │
│  └─────────────────────────────┘    │
│                                     │
│  Notas (opcional)                   │
│  ┌─────────────────────────────┐    │
│  │ Transferencia Mercado Pago  │    │
│  └─────────────────────────────┘    │
│                                     │
│  [ ✓ Confirmar pago ]               │
│  [   Cancelar        ]              │
└─────────────────────────────────────┘
```

---

## MVP Manual vs Futura Integración Real

| Aspecto | MVP Manual | Futura Integración |
|---|---|---|
| Cómo paga el jugador | Por fuera (transferencia, efectivo) | Botón "Pagar" dentro de la app |
| Cómo se confirma | Admin lo marca manualmente | Webhook del proveedor de pago |
| Aviso al admin | Notificación manual / WhatsApp | Push automático + estado actualizado |
| Comprobante | Sin comprobante en app | Recibo digital en app |
| Integración con banco | No | Mercado Pago / Stripe / Flow |
| Conciliación | Manual por admin | Automática |

### Decisión de diseño: botón "Pagar ahora"

El botón `[Pagar ahora]` **existe en el diseño desde el MVP**, pero en fase 1:
- Al tocarlo, muestra información de a quién transferir (datos bancarios del beneficiario o del admin)
- No procesa el pago
- Opcionalmente puede abrir WhatsApp con un mensaje pre-armado

Esto asegura que cuando llegue la integración real, solo se cambia el **handler** del botón, no el flujo de UX.

---

## Estados Visuales

| Estado | Color | Ícono | Texto |
|---|---|---|---|
| pending | Amarillo | ⏳ | Pendiente |
| paid | Verde | ✅ | Pagado |
| partial | Naranja | 🔶 | Pago parcial |
| overdue | Rojo | 🔴 | Vencido |
| exempt | Gris | ─ | Exento |
| not_applicable | Gris claro | ○ | No aplica |

---

*Fintech UX Agent — LaPizarra Knowledge Base*
