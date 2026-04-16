# Integraciones — LaPizarra

> Fuentes externas de datos que enriquecen la información de jugadores y equipos.

---

## Propósito

LaPizarra puede cruzar sus datos propios (goles, asistencias, asistencia) con datos externos de salud y rendimiento físico, para dar a los jugadores una visión más completa de su rendimiento.

---

## Integraciones planeadas

| Integración | Estado | Prioridad | Doc |
|-------------|--------|-----------|-----|
| Apple Health / HealthKit | Investigación | Alta | [[Health-Wearables]] |
| Google Fit / Health Connect | Investigación | Alta | [[Health-Wearables]] |
| Garmin Connect | Backlog | Media | [[Health-Wearables]] |
| Strava | Backlog | Media | — |
| Polar / Fitbit | Backlog | Baja | — |

---

## Principios para integraciones

1. **Opt-in siempre** — El jugador decide si conecta su dispositivo/app.
2. **Datos del partido, no del día** — Solo importar métricas de la ventana temporal del partido.
3. **Lectura solo** — LaPizarra nunca escribe en apps de terceros.
4. **Sin bloqueo de plataforma** — Si la integración no está disponible, la app funciona igual.

---

## Navegación

- [[Health-Wearables]] — Apple Health, Google Fit, Garmin y otros wearables

---

*Sección: Integraciones*
