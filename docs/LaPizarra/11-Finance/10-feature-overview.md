# Finanzas del Equipo — Feature Overview

> Agente: Product Agent
> Objetivo: Definir alcance, justificación y límites del módulo de finanzas de LaPizarra.

---

## Qué es

El módulo **Finanzas del Equipo** es el sistema de gestión de cobros, gastos compartidos y deudas internas de un equipo amateur. Permite a admins y capitanes crear cobros colectivos, distribuirlos entre jugadores con reglas flexibles, y registrar quién pagó y quién no.

No es una billetera digital. No mueve dinero. En su MVP, es un **sistema de registro y transparencia** que elimina la ambigüedad de "¿quién me debe qué?".

---

## Por qué existe

En el fútbol amateur, el dinero es el tema más conflictivo del grupo de WhatsApp:

- ¿Alguien pagó la cancha y no sabe si le van a devolver?
- ¿Cuánto le debe cada uno al que pagó el asado?
- ¿Los estudiantes pagan lo mismo que los que trabajan?
- ¿Quién no ha pagado la cuota de la liga?

LaPizarra ya centraliza partidos, estadísticas e historial. Falta el módulo financiero para cerrar el ciclo operativo del equipo.

---

## Problema que resuelve

| Problema actual | Solución con el módulo |
|---|---|
| El que paga la cancha persigue a cada uno por WhatsApp | Un cobro registrado, todos ven cuánto deben y a quién |
| No hay registro de quién pagó la cuota de liga | Estado de pago por jugador, visible para admins |
| Diferente capacidad de pago entre jugadores | Reglas de distribución flexibles (% personalizado) |
| Confusión sobre si ya pagué o no | Dashboard personal de deudas por equipo |
| El admin no sabe el estado financiero del equipo | Resumen consolidado de cobros activos y pendientes |

---

## Alcance MVP

### ✅ Incluido en MVP

- **Crear cobros** del equipo (cancha, cuota, asado, polera, otro)
- **Distribuir automáticamente** el cobro entre miembros activos
- **Reglas de distribución**: partes iguales, monto fijo, porcentaje por jugador
- **Registrar quién pagó la cancha/gasto completo** (flujo de reembolso entre compañeros)
- **Marcar como pagado** de forma manual (admin confirma el pago)
- **Estados por jugador**: pendiente, pagado, parcial, exento
- **Estado del cobro**: activo, completado, vencido, cancelado
- **Vista de deuda** del jugador (cuánto debo, a quién, por qué concepto)
- **Vista admin**: quién pagó, quién no, cuánto falta recaudar
- **Permisos por rol**: solo admin/capitán puede crear y confirmar cobros

### 🔜 Post-MVP (Fase 2)

- Notificaciones push/email cuando hay un cobro nuevo
- Recordatorios automáticos a quien no ha pagado
- Pagos parciales con seguimiento
- Historial de cobros cerrados con exportación
- Notas y comentarios en cobros

### 🚀 Futuro (Fase 3)

- Integración real con pasarela de pagos (Mercado Pago / Stripe)
- Transferencia directa dentro de la app
- Conciliación automática
- Reportes financieros de temporada
- Presupuesto del equipo

---

## Contexto de uso

- El módulo siempre opera sobre el **equipo activo** del usuario
- Un usuario puede tener deudas en distintos equipos — se ven separadas por equipo
- Solo **admins y capitanes** crean y gestionan cobros
- Cualquier **miembro activo** puede ver sus deudas y el estado del cobro
- El módulo respeta el sistema de roles de `team_members` ya existente

---

## Consistencia con LaPizarra

Este módulo es coherente con los principios del producto:

1. **Mobile-first** — Diseño tipo "payment sheet", optimizado para una mano
2. **Simple sobre completo** — MVP manual, sin fricción de integración
3. **Sin fricción de onboarding** — No requiere cuenta bancaria ni verificación
4. **Datos que perduran** — Historial financiero de temporadas

---

*Product Agent — LaPizarra Knowledge Base*
