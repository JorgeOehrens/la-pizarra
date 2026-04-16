# Casos de Uso — Finanzas del Equipo

> Agente: Product Agent
> Objetivo: Documentar los casos de uso concretos del módulo de finanzas, con actores, flujos y estados.

---

## Resumen de Casos de Uso

| ID | Nombre | Actor | Prioridad MVP |
|---|---|---|---|
| UC-01 | Pagar cuota de liga | Admin | ✅ Alta |
| UC-02 | Dividir cancha entre jugadores | Admin | ✅ Alta |
| UC-03 | Registrar que alguien pagó el total | Admin | ✅ Alta |
| UC-04 | Cobrar asado / tercer tiempo | Admin | ✅ Media |
| UC-05 | Cobrar poleras / indumentaria | Admin | ✅ Media |
| UC-06 | Cobro con tasas diferenciadas | Admin | ✅ Media |
| UC-07 | Ver mi deuda como jugador | Jugador | ✅ Alta |
| UC-08 | Confirmar pago manualmente | Admin | ✅ Alta |
| UC-09 | Ver resumen financiero del equipo | Admin | ✅ Media |
| UC-10 | Cancelar o ajustar un cobro | Admin | 🔜 Fase 2 |

---

## UC-01: Pagar cuota de liga

**Actor:** Admin / Capitán
**Trigger:** Inicio de temporada o cobro periódico de liga

**Flujo:**
1. Admin crea cobro de tipo `cuota_liga`
2. Ingresa monto total, nombre ("Cuota Liga Invierno 2026"), fecha límite
3. Selecciona distribución: partes iguales entre todos los miembros activos
4. (Opcional) Ajusta porcentaje de jugadores específicos (estudiantes, etc.)
5. El sistema genera una obligación por jugador con su monto calculado
6. Cada jugador ve su deuda en su dashboard
7. Admin confirma pagos individuales a medida que recibe el dinero

**Estado inicial del cobro:** `active`
**Estado por jugador:** `pending`

---

## UC-02: Dividir cancha entre jugadores

**Actor:** Admin / Capitán
**Trigger:** Antes o después de un partido, alguien pagó la cancha o se necesita recaudar

**Variante A — Recaudación previa (kitty):**
1. Admin crea cobro de tipo `cancha`
2. Monto: $X total
3. Distribución: partes iguales entre N jugadores confirmados
4. Jugadores pagan su parte antes del partido
5. Admin confirma pagos recibidos

**Variante B — Alguien pagó la totalidad:**
→ Ver UC-03

**Estado:** El cobro queda abierto hasta que todos paguen o se cancele.

---

## UC-03: Registrar que alguien pagó el total (reembolso entre compañeros)

**Actor:** Admin / Capitán
**Trigger:** Juan pagó $20.000 por la cancha completa y hay que distribuirlo

**Flujo:**
1. Admin crea cobro de tipo `cancha` (u otro)
2. Activa la opción "Alguien pagó el total"
3. Selecciona quién pagó (`beneficiary_id = juan`)
4. Ingresa el monto total pagado
5. El sistema calcula lo que le corresponde a cada jugador
6. La vista muestra: "Le debes $4.000 a Juan"
7. Cuando cada jugador le paga a Juan, admin confirma
8. Juan ve cuánto le deben vs cuánto ya recibió

**Punto clave:** El dinero va a Juan, no a la app ni a un fondo común.

**Pantalla de deuda del jugador:**
```
Cancha 15 Mayo
Le debes $4.000 a Juan García
Fecha límite: 20 Mayo
[Marcar como pagado]  ← solo admin puede confirmar
```

---

## UC-04: Cobrar asado / tercer tiempo

**Actor:** Admin / Capitán
**Trigger:** Después del partido, se organiza tercer tiempo

**Flujo:**
1. Admin crea cobro de tipo `asado`
2. Monto total estimado (o real post-evento)
3. Distribución: solo entre jugadores que confirmaron asistencia al asado
   - Puede ser subconjunto del equipo completo
4. (Opcional) El que compró las cosas se registra como beneficiario
5. Se reparte y se hace seguimiento

**Variación:** Si el monto se confirma después del evento, admin puede actualizarlo antes de cerrar el cobro.

---

## UC-05: Cobrar poleras / indumentaria

**Actor:** Admin / Capitán
**Trigger:** Compra de camisetas o indumentaria para la temporada

**Flujo:**
1. Admin crea cobro de tipo `indumentaria`
2. Monto fijo por jugador (cada uno paga su camiseta — no distribución proporcional)
3. Fecha límite
4. Solo aplica a jugadores que pidieron camiseta (no todos)
5. Admin puede excluir jugadores específicos del cobro
6. Admin confirma cuando cada jugador paga

**Particularidad:** En este caso la distribución es `fixed_amount` por jugador, no proporcional.

---

## UC-06: Cobro con tasas diferenciadas por tipo de jugador

**Actor:** Admin / Capitán
**Trigger:** El equipo tiene jugadores con diferente capacidad de pago (política interna)

**Ejemplo concreto:**
- Cuota de liga total: $60.000
- 10 jugadores en total
- Trabajadores: pagan parte completa (~$7.500 c/u)
- Estudiantes (3): pagan 50% (~$3.750 c/u)
- El administrador ajusta la carga a los que tienen capacidad

**Flujo:**
1. Admin crea cobro con distribución `custom`
2. Por defecto: partes iguales
3. Ajusta el porcentaje o monto individual de cada jugador
4. El sistema recalcula y muestra el resumen
5. Admin confirma y activa el cobro

**Vista admin antes de confirmar:**
```
Jugador         Tipo        Monto
────────────────────────────────
Carlos M.       trabajador  $7.500
Pedro R.        trabajador  $7.500
Diego L.        estudiante  $3.750
Ana K.          estudiante  $3.750
[Invitado]      exempt      $0
                TOTAL       $60.000 ✓
```

---

## UC-07: Ver mi deuda como jugador

**Actor:** Jugador (cualquier miembro)
**Trigger:** Jugador abre la sección Finanzas del equipo activo

**Vista:**
```
Finanzas — Los Cóndores

Mis pendientes (2)
──────────────────
Cuota Liga Invierno      $5.000    Vence 30 Apr
  → Al equipo (fondo común)

Cancha 15 Mayo           $4.000    Vence 20 May
  → Le debes a Juan García

Total pendiente: $9.000

Pagado este mes
──────────────────
Asado 10 Mayo            $2.500    ✓ Confirmado
```

**El jugador NO puede confirmar su propio pago.** Solo puede ver. El admin confirma.

---

## UC-08: Confirmar pago manualmente (Admin)

**Actor:** Admin / Capitán
**Trigger:** Un jugador le avisó por WhatsApp que ya pagó

**Flujo:**
1. Admin abre detalle del cobro
2. Ve la lista de jugadores con estado pendiente
3. Toca el nombre del jugador → "Marcar como pagado"
4. (Opcional) Ingresa monto real si fue pago parcial
5. El estado del jugador cambia a `paid` o `partial`
6. Si todos pagaron → el cobro pasa a `completed`

**Nota MVP:** El admin confirma manualmente. No hay validación automática de transferencias bancarias.

---

## UC-09: Ver resumen financiero del equipo

**Actor:** Admin / Capitán
**Trigger:** Admin quiere ver el estado financiero general

**Vista:**
```
Finanzas del Equipo — Los Cóndores

Activos (3 cobros)
──────────────────
Cuota Liga Invierno    $60.000   8/12 pagaron  🟡 en progreso
Cancha 15 Mayo         $20.000   2/5 pagaron   🔴 pendiente
Poleras               $45.000   5/5 pagaron   ✅ completado

Resumen
───────
Total recaudado:    $77.500
Total pendiente:    $47.500
```

---

*Product Agent — LaPizarra Knowledge Base*
