# Preguntas Abiertas — Finanzas del Equipo

> Agente: Product Agent + System Architect Agent
> Objetivo: Registrar dudas de negocio, técnicas y de UX que requieren decisión antes o durante la implementación.

---

## Preguntas de Negocio

### B-01: ¿El jugador puede autoreportarse como pagado?
**Contexto:** En el MVP, solo el admin confirma pagos. Pero esto crea fricción: el admin tiene que estar siempre disponible.

**Opciones:**
- A) Solo admin confirma (más seguro, más fricción)
- B) Jugador puede marcar como pagado, admin puede revertir
- C) Jugador puede "avisar" y admin confirma con 1 tap

**Impacto:** Afecta el flujo de UX y las RLS policies.
**Estado:** ⬜ Sin decidir

---

### B-02: ¿Cómo se maneja la moneda?
**Contexto:** El producto opera en varios países de LATAM. Cada uno tiene su moneda.

**Opciones:**
- A) Moneda fija por equipo (definida en el onboarding del equipo)
- B) Moneda del país del usuario (geolocalización)
- C) Solo pesos chilenos en el MVP

**Impacto:** Tabla `teams` necesitaría columna `currency_code`. Formateo de montos en la UI.
**Estado:** ⬜ Sin decidir

---

### B-03: ¿Los cobros pueden ser recurrentes desde el MVP?
**Contexto:** La cuota de liga suele ser mensual. Crear el mismo cobro todos los meses es tedioso.

**Opciones:**
- A) No en MVP — crear cada cobro manualmente
- B) "Duplicar cobro" (copia los datos, no la distribución automática)
- C) Cobros recurrentes con cron

**Estado:** 🔜 Fase 2 (no MVP)

---

### B-04: ¿Qué pasa con el dinero sobrante si la cancha costó menos de lo estimado?
**Contexto:** Admin pone $20.000 pero la cancha costó $18.000.

**Opciones:**
- A) Admin cierra el cobro con $18.000 y devuelve la diferencia manualmente
- B) El sistema permite editar el total y recalcular
- C) El exceso queda como "fondo del equipo"

**Estado:** 🔜 Fase 2

---

### B-05: ¿Puede un jugador pagar por otro?
**Contexto:** "Yo le paso la plata a Juan y Juan le paga al admin."

**Opciones:**
- A) No soportado — cada jugador paga individualmente
- B) Admin puede registrar que "Pedro pagó por Diego"

**Estado:** ⬜ Sin decidir

---

## Preguntas Técnicas

### T-01: ¿Cómo manejar el overdue automáticamente?
**Contexto:** Cuando pasa `due_date`, el cobro debería pasar a `overdue` automáticamente.

**Opciones:**
- A) Cron job de Supabase (`pg_cron`) que corre diariamente
- B) Verificar en la query al listar cobros (estado calculado en runtime)
- C) Edge function de Supabase con schedule

**Preferencia:** Opción B para el MVP (sin infraestructura adicional), migrar a A en Fase 2.
**Estado:** ⬜ Sin decidir formalmente

---

### T-02: ¿Usamos una vista o tabla de cache para `team_finance_summary`?
**Contexto:** La vista calcula agregados en tiempo real. Con muchos cobros puede ser lenta.

**Opciones:**
- A) Vista simple (MVP) → materializada view si hay problemas de performance
- B) Tabla de cache actualizada por triggers

**Estado:** ✅ Vista simple para MVP, revisitar si hay > 50 cobros activos por equipo

---

### T-03: ¿Cómo validar que la distribución suma el total?
**Contexto:** En distribución custom, el admin puede equivocarse.

**Opciones:**
- A) Validación solo en frontend (puede bypassearse)
- B) Constraint en Supabase usando un trigger
- C) Validación en Server Action antes de insertar

**Recomendación:** Validar en Server Action (B+C) y mostrar feedback en tiempo real en UI.
**Estado:** ⬜ Sin decidir cómo implementar

---

### T-04: ¿Notificaciones push en el MVP?
**Contexto:** Sin notificaciones, los jugadores no saben que tienen un nuevo cobro.

**Opciones:**
- A) Sin notificaciones en MVP (jugador entra a la app a ver)
- B) Email al jugador cuando hay un cobro nuevo (requiere email en perfil)
- C) Push notification (requiere configurar FCM/APNs — fuera del MVP)

**Constraint:** El sistema actual no requiere email para registrarse ([[04-Auth/Auth-Flow]]).
**Estado:** ⬜ Sin decidir

---

### T-05: ¿Cómo se comporta si un usuario pertenece a múltiples equipos?
**Contexto:** El usuario puede tener deudas en distintos equipos.

**Opciones:**
- A) La vista de finanzas es siempre del equipo activo
- B) Hay una vista consolidada de "mis deudas en todos mis equipos"

**Recomendación:** A para el MVP (consistente con el diseño de equipo activo), B en Fase 2.
**Estado:** ⬜ Sin decidir para Fase 2

---

## Preguntas de UX

### UX-01: ¿Cómo se accede a Finanzas desde la navegación principal?
**Contexto:** La app actual tiene tabs o menú. ¿Dónde entra Finanzas?

**Opciones:**
- A) Tab principal en la barra inferior (al mismo nivel que Partidos, Jugadores)
- B) Dentro del panel del equipo, como sección secundaria
- C) Desde el menú del equipo (hamburger / overflow)

**Estado:** ⬜ Sin decidir — depende del rediseño de navegación

---

### UX-02: ¿Cómo se muestra el cobro cuando el beneficiario es el mismo admin?
**Contexto:** El admin pagó la cancha y también gestiona los cobros. ¿Es raro?

**Estado:** ⬜ Sin decidir cómo diferenciarlo visualmente

---

### UX-03: ¿Cuántos cobros activos puede tener un equipo simultáneamente?
**Contexto:** Si hay muchos cobros activos, la UI puede abrumarse.

**Recomendación:** No hay límite técnico. La UI debe priorizar: vencidos > próximos a vencer > el resto.
**Estado:** ✅ Resuelta por diseño (orden visual)

---

*Product Agent + System Architect Agent — LaPizarra Knowledge Base*
