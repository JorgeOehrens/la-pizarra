# ADR-003: Stack Técnico — Next.js + Supabase + Vercel

> Architecture Decision Record
> Agente: Documentation Agent
> Fecha: 2026-04-14
> Estado: ACEPTADO

---

## Contexto

El proyecto ya existe como un repo Next.js con Tailwind y shadcn/ui. La decisión de stack contempla tanto el estado actual como el futuro.

---

## Decisión

**Stack completo:**
- Next.js 14+ (App Router) — Frontend + API Routes
- Supabase — DB + Auth + Storage
- Tailwind CSS + shadcn/ui — Estilos y componentes
- TanStack Query — Server state en el cliente
- Zustand — Estado local mínimo
- Vercel — Deploy y hosting

---

## Por qué App Router y no Pages Router

| Criterio | App Router | Pages Router |
|----------|------------|--------------|
| Server Components | ✅ Sí | ❌ No |
| Layouts anidados | ✅ Sí | Limitado |
| Streaming | ✅ Sí | ❌ No |
| Futuro de Next.js | ✅ Es el path | ⚠️ Legacy |

Los Server Components son clave para mobile-first: menos JS enviado al cliente = mejor performance en redes lentas.

---

## Estructura de Carpetas Decidida

```
app/
  (auth)/           ← rutas públicas (login, register, join)
  (app)/            ← rutas protegidas (dashboard, teams, etc.)
  api/              ← API Routes
components/
  ui/               ← componentes shadcn (auto-generados)
  [feature]/        ← componentes por feature
lib/
  supabase/         ← cliente y tipos
  auth/             ← helpers de autenticación
hooks/              ← custom hooks (ya existe en el proyecto)
```

---

## Por qué no usar Prisma

Prisma es una excelente ORM, pero agrega complejidad innecesaria cuando ya usamos Supabase:
- Supabase genera tipos TypeScript automáticamente
- Las queries de Supabase son type-safe con los tipos generados
- Prisma requiere un servidor de Prisma separado en Serverless

**Decisión:** Usar `supabase-js` directamente con los tipos generados.

---

## Por qué no usar tRPC

tRPC es ideal para teams grandes con contratos de API estrictos. Para LaPizarra en MVP:
- Más complejidad de setup
- Los Server Actions de Next.js 14 cumplen el mismo rol de forma más simple
- Se puede agregar tRPC en el futuro si se necesita

---

## Por qué Vercel y no otro hosting

- Integración nativa con Next.js (mismo equipo)
- Preview deployments automáticos por PR
- Configuración cero para Next.js
- El proyecto ya está pensado para Vercel

---

*Documentation Agent — LaPizarra Knowledge Base*
