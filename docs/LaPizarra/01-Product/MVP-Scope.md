# MVP — Alcance y Prioridades

> Agente: Product Agent
> Objetivo: Definir exactamente qué entra y qué no entra en el MVP de LaPizarra.

---

## Problema que resolvemos

Los equipos de fútbol amateur gestionan su información de forma fragmentada:
- Resultados anotados en WhatsApp
- Goleadores recordados de memoria
- Sin historial entre temporadas
- Sin estadísticas individuales

**LaPizarra centraliza todo esto en una herramienta simple, accesible desde el teléfono.**

---

## MVP: Features IN ✅

### 1. Usuario
- [ ] Registro sin email (username + contraseña o magic link por teléfono)
- [ ] Perfil mínimo: nombre, apodo, foto (opcional)
- [ ] Un usuario puede pertenecer a múltiples equipos

### 2. Equipo
- [ ] Crear equipo (nombre, colores, logo)
- [ ] Logo subido a Supabase Storage
- [ ] Roles: `admin` y `jugador`
- [ ] El creador es automáticamente admin

### 3. Invitaciones
- [ ] Generar link de invitación único por equipo
- [ ] Generar código de 6 caracteres por equipo
- [ ] Estados: `pending` → `accepted` / `rejected`
- [ ] El admin puede revocar invitaciones

### 4. Jugadores (Plantilla)
- [ ] Perfil dentro del equipo: posición, número de camiseta
- [ ] Posiciones: portero, defensa, centrocampista, delantero
- [ ] Un jugador puede estar en múltiples equipos

### 5. Partidos
- [ ] Crear partido: rival, fecha, lugar, tipo (liga/amistoso)
- [ ] Lugares predefinidos + custom
- [ ] Registrar resultado: goles a favor / en contra
- [ ] Estado del partido: `programado`, `en_curso`, `finalizado`

### 6. Eventos de Partido
- [ ] Gol (jugador, minuto)
- [ ] Asistencia (jugador, minuto)
- [ ] Autogol (jugador, minuto)
- [ ] Los eventos están vinculados a un partido específico

### 7. Estadísticas
- [ ] Por jugador: goles, asistencias, partidos jugados, autogoles
- [ ] Por equipo: victorias, derrotas, empates, goles a favor/contra
- [ ] Históricas (toda la temporada)
- [ ] Stats manuales (editar stats sin necesidad de crear partido)

---

## MVP: Features OUT ❌

Estas features **no entran en el MVP** pero se diseña el modelo para soportarlas:

| Feature                     | Por qué espera                             |
| --------------------------- | ------------------------------------------ |
| Autenticación con email     | Aumenta fricción de onboarding             |
| Gestión de ligas            | Complejidad alta, scope futuro             |
| Notificaciones push         | Requiere infraestructura adicional         |
| Chat de equipo              | No es core del producto                    |
| Entrenamientos y asistencia | Segunda fase                               |
| Tarjetas amarillas/rojas    | Segunda fase (stats simples primero)       |
| Modo árbitro                | Scope de liga, no de equipo                |
| Pago / suscripción          | Post-MVP                                   |
| App nativa iOS/Android      | La web mobile-first es suficiente para MVP |

---

## Priorización por valor / esfuerzo

```
Alta prioridad (semana 1-2):
  [P0] Auth básico + creación de usuario
  [P0] Crear equipo
  [P0] Invitaciones (link + código)
  [P0] Agregar jugadores a plantilla

Media prioridad (semana 3-4):
  [P1] Registrar partido
  [P1] Agregar eventos (goles, asistencias)
  [P1] Ver estadísticas de jugador

Completar MVP (semana 5-6):
  [P2] Estadísticas de equipo
  [P2] Stats manuales
  [P2] Historial de partidos
  [P2] Subida de logo a Storage
```

---

## Definición de "Done" para el MVP

El MVP está completo cuando:
1. Un admin puede crear un equipo e invitar jugadores
2. Un jugador puede unirse sin email
3. Se puede registrar un partido con goles y asistencias
4. Las estadísticas se actualizan automáticamente
5. Se puede ver el perfil de un jugador con su historial

---

*Product Agent — LaPizarra Knowledge Base*
