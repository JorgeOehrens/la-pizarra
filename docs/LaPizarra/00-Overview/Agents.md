# Agentes del Sistema — Definición

> Cada agente tiene un rol claro, un output concreto y un área de responsabilidad acotada.

---

## Agent 1: Product Agent

**Rol:** Define qué construimos, en qué orden y por qué.

**Responsabilidades:**
- Definir el alcance del MVP
- Priorizar features por valor / esfuerzo
- Escribir user stories accionables
- Alinear decisiones con el deck de producto
- Decidir qué NO entra en el MVP

**Outputs:**
- [[01-Product/MVP-Scope]]
- [[01-Product/User-Stories]]
- [[01-Product/Design-Principles]]

**Criterio de éxito:** El equipo puede empezar a buildear sin ambigüedad sobre qué incluye el MVP.

---

## Agent 2: System Architect Agent

**Rol:** Diseña la arquitectura técnica completa del sistema.

**Responsabilidades:**
- Seleccionar el tech stack
- Definir módulos y sus relaciones
- Decidir patrones de datos (client-side vs server-side)
- Pensar en escalabilidad desde el inicio
- Documentar trade-offs de decisiones arquitectónicas

**Outputs:**
- [[02-Architecture/System-Architecture]]
- [[02-Architecture/Tech-Stack]]
- [[02-Architecture/Module-Map]]

**Criterio de éxito:** Un developer nuevo puede entender cómo está estructurado el sistema en < 10 minutos.

---

## Agent 3: Database Agent

**Rol:** Diseña y documenta el esquema completo de Supabase.

**Responsabilidades:**
- Definir todas las tablas del MVP
- Establecer relaciones (FK, joins)
- Definir constraints y validaciones a nivel DB
- Pensar en performance (índices, columnas calculadas)
- Preparar para conexión futura via MCP

**Outputs:**
- [[03-Database/Schema]]
- [[03-Database/Migrations]]
- [[03-Database/RLS-Policies]]

**Criterio de éxito:** El schema se puede ejecutar en Supabase sin modificaciones y soporta todos los features del MVP.

---

## Agent 4: Auth & Flow Agent

**Rol:** Diseña cómo los usuarios entran al sistema y cómo se relacionan con los equipos.

**Responsabilidades:**
- Diseñar registro sin email (fase 1)
- Diseñar sistema de invitaciones (link + código)
- Definir roles por equipo (admin, jugador)
- Gestionar estado de invitaciones
- Pensar en múltiples equipos por usuario

**Outputs:**
- [[04-Auth/Auth-Flow]]
- [[04-Auth/Invitations]]

**Criterio de éxito:** Un usuario puede crear un equipo e invitar jugadores sin necesitar email, en menos de 3 pasos.

---

## Agent 5: Match & Stats Agent

**Rol:** Modela partidos, eventos y el sistema de estadísticas.

**Responsabilidades:**
- Definir estructura de un partido
- Modelar eventos (gol, asistencia, autogol, tarjeta)
- Calcular estadísticas automáticamente
- Soportar stats manuales (sin partido)
- Definir vistas agregadas por jugador y equipo

**Outputs:**
- [[05-Matches/Match-Model]]
- [[05-Matches/Events-Model]]
- [[06-Stats/Stats-Model]]
- [[06-Stats/Calculations]]

**Criterio de éxito:** Registrar un partido con goles y asistencias actualiza automáticamente las estadísticas del jugador.

---

## Agent 6: Implementation Planner Agent

**Rol:** Define el orden exacto de implementación para llegar al MVP.

**Responsabilidades:**
- Dividir el trabajo en fases concretas
- Identificar dependencias entre módulos
- Priorizar lo que desbloquea lo demás
- Definir criterios de "done" por fase
- Crear checklist accionable para el MVP

**Outputs:**
- [[07-Roadmap/Phases]]
- [[07-Roadmap/MVP-Checklist]]

**Criterio de éxito:** El equipo puede empezar a trabajar esta semana con un plan claro de qué viene después.

---

## Agent 7: Documentation Agent

**Rol:** Mantiene toda la knowledge base organizada y al día.

**Responsabilidades:**
- Generar archivos en formato Obsidian
- Mantener el índice actualizado
- Registrar decisiones técnicas (ADRs)
- Documentar dudas abiertas
- Asegurar que cada archivo sea reutilizable

**Outputs:**
- [[00-Overview/Index]]
- [[00-Overview/Agents]]
- [[08-Decisions/*]]
- [[09-Open-Questions/Questions]]

**Criterio de éxito:** Cualquier miembro del equipo puede encontrar cualquier decisión o contexto en < 2 minutos.

---

*Documentation Agent — LaPizarra Knowledge Base*
