# User Stories — Flujos de Usuario

> Agente: Product Agent
> Cada historia incluye: actor, acción, resultado y criterios de aceptación.

---

## Epic 1: Onboarding y Equipo

### US-001: Crear cuenta
**Como** usuario nuevo
**Quiero** registrarme sin email
**Para** acceder a LaPizarra rápidamente

**Criterios de aceptación:**
- [ ] Puedo crear cuenta con username + contraseña
- [ ] No se requiere email ni teléfono
- [ ] El username es único en el sistema
- [ ] Puedo agregar nombre y foto después

---

### US-002: Crear equipo
**Como** usuario registrado
**Quiero** crear un equipo de fútbol
**Para** empezar a gestionar mi plantilla

**Criterios de aceptación:**
- [ ] Ingreso nombre del equipo
- [ ] Puedo subir un logo (opcional)
- [ ] Puedo elegir colores del equipo
- [ ] Quedo automáticamente como admin
- [ ] Se genera un código de invitación automáticamente

---

### US-003: Invitar jugadores por link
**Como** admin del equipo
**Quiero** compartir un link de invitación
**Para** que mis jugadores se unan sin complicaciones

**Criterios de aceptación:**
- [ ] Genero un link único para mi equipo
- [ ] El link es copiable con un toque
- [ ] Al abrirlo, el jugador ve el equipo antes de aceptar
- [ ] Puedo revocar el link y generar uno nuevo

---

### US-004: Unirse a equipo por código
**Como** jugador
**Quiero** ingresar un código de 6 caracteres
**Para** unirme al equipo de un amigo

**Criterios de aceptación:**
- [ ] Ingreso el código en la app
- [ ] Veo los datos del equipo antes de confirmar
- [ ] Mi estado pasa a "pendiente" hasta que el admin aprueba
- [ ] Recibo confirmación cuando soy aceptado

---

### US-005: Completar perfil de jugador
**Como** jugador nuevo en un equipo
**Quiero** completar mi perfil dentro del equipo
**Para** aparecer correctamente en la plantilla

**Criterios de aceptación:**
- [ ] Puedo elegir mi posición (portero / defensa / centrocampista / delantero)
- [ ] Puedo asignarme un número de camiseta
- [ ] El número no puede repetirse dentro del mismo equipo
- [ ] Puedo editar esto después

---

## Epic 2: Gestión de Partidos

### US-006: Programar partido
**Como** admin del equipo
**Quiero** crear un partido en el calendario
**Para** registrar cuándo y contra quién jugamos

**Criterios de aceptación:**
- [ ] Ingreso: rival, fecha, hora, lugar, tipo (liga/amistoso)
- [ ] Puedo seleccionar un lugar predefinido o escribir uno custom
- [ ] El partido aparece en el historial con estado "programado"
- [ ] Puedo editar o cancelar el partido

---

### US-007: Registrar resultado
**Como** admin del equipo
**Quiero** anotar el resultado final de un partido
**Para** mantener el historial actualizado

**Criterios de aceptación:**
- [ ] Ingreso goles a favor y en contra
- [ ] El resultado se calcula automáticamente (W/D/L)
- [ ] El partido pasa a estado "finalizado"
- [ ] Las estadísticas del equipo se actualizan

---

### US-008: Registrar goles y asistencias
**Como** admin del equipo
**Quiero** anotar quién marcó y quién asistió en cada gol
**Para** construir las estadísticas individuales

**Criterios de aceptación:**
- [ ] Selecciono el jugador que marcó
- [ ] Opcionalmente selecciono al asistente
- [ ] Puedo marcar si fue autogol
- [ ] Puedo registrar el minuto del gol
- [ ] Los goles suman al contador individual del jugador

---

## Epic 3: Estadísticas

### US-009: Ver perfil de jugador
**Como** cualquier miembro del equipo
**Quiero** ver el perfil completo de un jugador
**Para** conocer su historial y estadísticas

**Criterios de aceptación:**
- [ ] Veo: partidos jugados, goles, asistencias
- [ ] Veo el historial de partidos donde participó
- [ ] Veo su posición y número de camiseta
- [ ] Las stats son acumulativas de toda su actividad

---

### US-010: Ver estadísticas del equipo
**Como** cualquier miembro del equipo
**Quiero** ver el rendimiento general del equipo
**Para** tener una visión global de la temporada

**Criterios de aceptación:**
- [ ] Veo: partidos jugados, W/D/L, GF, GA, GD
- [ ] Veo el ranking de goleadores del equipo
- [ ] Veo el historial de todos los partidos
- [ ] Puedo filtrar por tipo (liga / amistoso)

---

### US-011: Editar stats manualmente
**Como** admin del equipo
**Quiero** corregir estadísticas manualmente
**Para** importar datos históricos o corregir errores

**Criterios de aceptación:**
- [ ] Puedo ajustar goles / asistencias de un jugador directamente
- [ ] Queda registrado que fue una edición manual
- [ ] No requiere crear un partido para hacerlo
- [ ] El historial de cambios queda guardado (audit log simple)

---

## Flujo Principal (Happy Path)

```
[Usuario nuevo]
    │
    ▼
Registro (username + password)
    │
    ▼
Crear equipo (nombre + logo)
    │
    ▼
Compartir código/link con jugadores
    │
    ▼
Jugadores se unen → Admin aprueba
    │
    ▼
Jugadores completan perfil (posición + número)
    │
    ▼
Partido finalizado → Admin registra resultado
    │
    ▼
Admin agrega goles y asistencias
    │
    ▼
Stats actualizadas automáticamente
    │
    ▼
Todos ven el perfil actualizado del goleador
```

---

*Product Agent — LaPizarra Knowledge Base*
