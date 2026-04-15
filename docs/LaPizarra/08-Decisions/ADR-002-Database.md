# ADR-002: Supabase como Base de Datos

> Architecture Decision Record
> Agente: Documentation Agent
> Fecha: 2026-04-14
> Estado: ACEPTADO

---

## Contexto

LaPizarra necesita:
- Base de datos relacional (stats, joins, queries complejas)
- Auth integrado
- Storage para imágenes
- SDK de TypeScript con tipos
- Fácil de configurar y escalar
- Plan gratuito para el MVP

---

## Decisión

**Se usa Supabase como plataforma completa: Postgres + Auth + Storage.**

---

## Consecuencias Positivas

- Postgres real con soporte completo de SQL (vistas, triggers, funciones)
- Row Level Security nativo — seguridad a nivel de base de datos
- `supabase gen types` genera tipos TypeScript automáticamente
- Storage incluido para logos y avatares
- Dashboard visual para gestionar datos durante desarrollo
- Compatible con conexión MCP para agentes AI en el futuro
- Plan gratuito generoso para MVP

## Consecuencias Negativas

- Vendor lock-in en Supabase Auth (se puede mitigar si se usa Postgres puro para el resto)
- Las Edge Functions de Supabase son limitadas comparado con Vercel Functions
- Si se necesita migrar, las RLS policies son específicas de Supabase

---

## Alternativas Consideradas

| Alternativa | Descartada por |
|-------------|---------------|
| Firebase | NoSQL no es ideal para stats relacionales |
| PlanetScale | Solo MySQL, sin RLS nativo |
| Neon + Prisma | Más capas, sin auth/storage integrado |
| Railway | Más DevOps, menos DX |
| MongoDB Atlas | Queries de stats complejas son más difíciles |

---

## Configuración MCP (futuro)

Supabase tiene soporte oficial para Model Context Protocol (MCP), lo que permite que agentes AI (Claude, etc.) interactúen directamente con la base de datos via herramientas naturales. Esto habilita casos de uso como:
- Agente que analiza stats y sugiere mejoras tácticas
- Agente que genera reportes de temporada automáticamente

Cuando se conecte:
```
supabase/mcp — servidor MCP oficial de Supabase
```

---

*Documentation Agent — LaPizarra Knowledge Base*
