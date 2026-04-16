# Log de Decisiones — Finanzas del Equipo

> Agente: Documentation Agent
> Objetivo: Registrar las decisiones de diseño tomadas, su justificación y los tradeoffs asumidos.

---

## DEC-FIN-001: MVP es solo registro manual, sin integración de pago real

**Fecha:** 2026-04-16
**Agente decisor:** Product Agent

**Decisión:**
El MVP no integrará ninguna pasarela de pagos (Mercado Pago, Stripe, Flow). Los pagos se confirman manualmente por el admin.

**Contexto:**
El problema principal del target (equipos amateur) no es la dificultad de transferir dinero — todos usan Mercado Pago o transferencias bancarias. El problema es el **registro, la visibilidad y el seguimiento** de quién debe qué.

**Justificación:**
- Integrar una pasarela añade semanas de desarrollo, KYC/compliance y fricción de onboarding
- Los usuarios ya tienen sus canales de pago preferidos
- El valor inmediato está en la transparencia, no en mover dinero dentro de la app
- Diseñar el UX con el botón "Pagar ahora" ya preparado permite la futura integración sin reescribir la interfaz

**Tradeoffs:**
| A favor | En contra |
|---|---|
| MVP rápido y sin fricción | Admin debe confirmar manualmente cada pago |
| No requiere cuenta bancaria ni verificación | No hay comprobante automático |
| Funciona con cualquier método de pago | Dependiente de la honestidad |
| Menor riesgo legal y regulatorio | Escalabilidad limitada a largo plazo |

---

## DEC-FIN-002: Distribución flexible por cobro, no por perfil de jugador

**Fecha:** 2026-04-16
**Agente decisor:** System Architect Agent + Payments Logic Agent

**Decisión:**
Las tasas diferenciadas (estudiante 50%, exento, etc.) se definen **por cobro**, no como atributo permanente del jugador.

**Contexto:**
La idea inicial era guardar un "tipo de jugador" en `team_members` (ej: `player_type = 'student'`). Esto simplificaría la UI al crear cobros.

**Justificación:**
- Las situaciones de los jugadores cambian (alguien deja de estudiar, alguien entra de nuevo)
- La política financiera del equipo puede cambiar entre temporadas
- Algunos cobros pueden tener excepciones que no aplican a otros
- Más flexible: el admin decide quién paga qué en cada cobro específico
- Menos datos personales sensibles almacenados

**Tradeoffs:**
| A favor | En contra |
|---|---|
| Máxima flexibilidad | Admin debe configurar tasas en cada cobro |
| Sin datos sensibles permanentes | No hay "perfil financiero" del jugador |
| Fácil auditar cada decisión | UI de distribución más compleja |

**Nota futura:** En Fase 2 se puede añadir "plantillas de distribución" que el admin puede cargar como punto de partida, sin almacenar el perfil del jugador.

---

## DEC-FIN-003: Separar `team_charges`, `charge_distributions` y `payment_records`

**Fecha:** 2026-04-16
**Agente decisor:** Database Agent + System Architect Agent

**Decisión:**
El modelo usa tres tablas separadas en lugar de un enfoque simplificado con una sola tabla.

**Alternativa descartada:**
```sql
-- DESCARTADO: una sola tabla "charge_members" con todo
create table charge_members (
    charge_id, member_id, amount, paid boolean
);
```

**Justificación:**
- `team_charges` = el evento financiero (qué se cobró, cuánto, a quién va)
- `charge_distributions` = la obligación de cada jugador (cuánto debe, estado)
- `payment_records` = el registro de cada pago concreto (auditoría)

Esta separación permite:
- Pagos **parciales** sin complicar el modelo
- **Auditoría** completa: quién confirmó qué y cuándo
- Múltiples confirmaciones del mismo cobro (ej: pago en cuotas)
- Futura integración de pagos: solo `payment_records` recibe los webhooks

**Tradeoffs:**
| A favor | En contra |
|---|---|
| Modelo extensible y auditable | Más joins en las queries |
| Soporte nativo de pagos parciales | Mayor complejidad inicial |
| Fácil integración futura | Más tablas que mantener |

---

## DEC-FIN-004: El cobro opera siempre sobre el equipo activo

**Fecha:** 2026-04-16
**Agente decisor:** Product Agent

**Decisión:**
El módulo de finanzas, como todos los módulos de LaPizarra, opera sobre el equipo activo seleccionado por el usuario. No hay una vista cross-team de finanzas en el MVP.

**Justificación:**
- Consistente con el diseño de toda la app
- Un usuario en múltiples equipos tiene deudas independientes en cada uno
- Simplifica la UI: siempre hay un contexto único

**Tradeoffs:**
| A favor | En contra |
|---|---|
| Consistencia con el resto del producto | No hay vista consolidada de deudas |
| UX simple y predecible | Usuario en 3 equipos debe cambiar de equipo para ver cada una |

**Nota futura:** En Fase 2, se puede añadir una vista en el perfil del usuario con un resumen de deudas en todos sus equipos.

---

## DEC-FIN-005: Solo admins pueden crear cobros y confirmar pagos

**Fecha:** 2026-04-16
**Agente decisor:** Product Agent + Auth Agent

**Decisión:**
Crear cobros y confirmar pagos requiere rol `admin` en `team_members`. Los jugadores solo tienen acceso de lectura al módulo de finanzas.

**Justificación:**
- Los cobros tienen impacto financiero real: no se puede delegar a cualquiera
- Consistente con el modelo de roles ya existente en LaPizarra
- Reduce el riesgo de cobros fraudulentos o erróneos
- El capitán del equipo suele ser el mismo admin

**Tradeoffs:**
| A favor | En contra |
|---|---|
| Evita cobros no autorizados | Si el admin no está disponible, no se confirman pagos |
| Modelo simple de permisos | Necesita al menos 1 admin activo |
| Consistente con el sistema existente | Jugadores no pueden autoreportarse |

**Pregunta abierta relacionada:** [[16-open-questions#B-01]] — ¿Jugador puede avisar que pagó?

---

## DEC-FIN-006: Beneficiario como campo nullable en `team_charges`

**Fecha:** 2026-04-16
**Agente decisor:** Database Agent

**Decisión:**
El campo `beneficiary_id` en `team_charges` es nullable. Cuando es `null`, el dinero va a "la caja del equipo" (concepto abstracto, sin entidad en BD). Cuando tiene valor, el dinero va a ese jugador específico.

**Justificación:**
- No todos los cobros tienen un beneficiario claro (ej: cuota de liga → va al equipo/federación)
- Evita crear una entidad "tesorería del equipo" innecesaria en el MVP
- Simple de entender para el admin: "¿alguien pagó el total? → selecciona quién"

**Tradeoffs:**
| A favor | En contra |
|---|---|
| Simple y directo | No modela la tesorería del equipo |
| No requiere entidad adicional | El "fondo común" es un concepto vago |
| Suficiente para los casos de uso del MVP | No permite seguir saldo acumulado del equipo |

---

## DEC-FIN-007: Tab de navegación — Finanzas reemplaza Analytics

**Fecha:** 2026-04-16
**Agente decisor:** Implementation Planner Agent

**Decisión:**
El tab "Stats" (que apuntaba a `/analytics`) en `MobileNav` fue reemplazado por "Finanzas" (`/finance`) con el ícono `Wallet` de lucide-react.

**Contexto:**
La barra de navegación mobile tiene 5 slots. `/analytics` existía como ruta pero sin implementación real. Finanzas es un feature prioritario con implementación completa.

**Justificación:**
- Finanzas tiene implementación concreta e inmediata; Analytics no
- 5 tabs es el máximo confortable en mobile — no se puede agregar sin quitar
- El tab de Analytics puede recuperarse en Fase 2 cuando se implemente estadísticas avanzadas

**Tradeoffs:**
| A favor | En contra |
|---|---|
| Finanzas visible y accesible de inmediato | Analytics queda temporalmente sin acceso desde nav |
| Nav limpia, sin tabs vacíos | Requiere revisar Analytics cuando se implemente |

**Archivo modificado:** `components/mobile-nav.tsx`

---

## DEC-FIN-008: Ruta raíz `/finance/` en lugar de `/team/finance/`

**Fecha:** 2026-04-16
**Agente decisor:** Implementation Planner Agent

**Decisión:**
El módulo de finanzas vive en `/finance/` (top-level route), no como subruta de `/team/finance/`.

**Contexto:**
El roadmap original planificó las rutas bajo `/team/finance/`. Durante la implementación se eligió `/finance/` para consistencia con el resto del proyecto (matches en `/matches/`, team en `/team/`).

**Justificación:**
- Consistente con la estructura de rutas del proyecto
- `/finance/` es más corta y directa
- La relación con el equipo activo se maneja internamente, no en la URL
- El tab de nav apunta directo a `/finance` sin nesting

**Rutas finales implementadas:**
```
/finance                    → vista principal
/finance/new                → crear cobro (admin)
/finance/[chargeId]         → detalle del cobro (jugador)
/finance/[chargeId]/manage  → gestión del cobro (admin)
```

---

*Documentation Agent — LaPizarra Knowledge Base*
