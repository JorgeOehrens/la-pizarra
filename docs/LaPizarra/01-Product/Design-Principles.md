# Principios de Diseño — LaPizarra

> Agente: Product Agent
> Fuente: Deck de producto + análisis de contexto del producto

---

## Principios Core

### 1. Mobile-first, siempre
La app se usa en el vestuario, en el banco técnico, en la cancha. No en una oficina.
- Todos los componentes deben funcionar perfectamente en pantalla de 375px
- Los elementos interactivos deben ser tocables con el pulgar
- Las acciones frecuentes (registrar gol, ver stats) deben estar a 1-2 toques de distancia

### 2. Sin fricción de onboarding
El fútbol amateur no espera. Si registrarse tarda más de 2 minutos, la gente abandona.
- No se requiere email en fase 1
- El flujo de creación de equipo no debe tener más de 3 pasos
- Unirse a un equipo con código debe funcionar en < 60 segundos

### 3. Simple sobre completo
Es mejor hacer 5 cosas perfectas que 20 cosas mediocres.
- Cada pantalla tiene una sola acción principal
- Las opciones avanzadas van en configuración, no en el flujo principal
- Si un feature no mejora la experiencia del 80% de los usuarios, espera al MVP+1

### 4. Los datos son el activo
El historial de un jugador o equipo es lo que hace que vuelvan.
- Los datos nunca se borran (soft delete)
- Las estadísticas se calculan desde los eventos (no se almacenan como dato principal)
- El historial entre temporadas se mantiene

### 5. Pensado para escalar a liga
El MVP es por equipo. El futuro es múltiples equipos compitiendo entre sí.
- El modelo de datos debe soportar "organizaciones" o "ligas" desde el principio
- Los partidos tienen un rival (equipo externo en MVP, equipo registrado en futuro)
- Los roles están diseñados para crecer (árbitro, organizador de liga)

---

## UI/UX Guidelines

### Jerarquía de información
```
Nivel 1 (siempre visible): Resultado del partido, stats globales
Nivel 2 (un toque): Detalle de partido, perfil de jugador
Nivel 3 (dos toques): Edición, configuración, historial completo
```

### Acciones destructivas
- Siempre pedir confirmación
- Preferir soft delete (ocultar) sobre hard delete
- El admin puede desactivar jugadores, no eliminarlos

### Feedback al usuario
- Las acciones deben tener confirmación visual inmediata (< 200ms)
- Los errores deben ser explicados en lenguaje simple
- Usar estados de carga para operaciones que tardan > 500ms

### Colores y marca
- Dark theme preferido (vestuarios oscuros, noche, cancha artificial)
- Color de acento: a definir (sugerido: verde césped o naranja balón)
- Tipografía: legible en movimiento (sin serifas, alta legibilidad)

---

## Anti-patrones a evitar

| Anti-patrón | Por qué es un problema |
|-------------|----------------------|
| Formularios largos | La gente los abandona |
| Navegación profunda (> 3 niveles) | Se pierde en el contexto |
| Acciones irreversibles sin confirmación | Se pueden cometer errores |
| Modales dentro de modales | Confunde en mobile |
| Datos que no se guardan si se pierde conexión | El campo de fútbol tiene mala señal |

---

*Product Agent — LaPizarra Knowledge Base*
