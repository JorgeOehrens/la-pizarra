# ADR-001: Autenticación sin Email

> Architecture Decision Record
> Agente: Documentation Agent
> Fecha: 2026-04-14
> Estado: ACEPTADO

---

## Contexto

LaPizarra es una app para equipos de fútbol amateur. Los usuarios típicos son jugadores y capitanes de equipos recreativos. La fricción de onboarding es el mayor riesgo de abandono.

El email como mecanismo de auth requiere:
1. Tener el email a mano (no siempre pasa cuando estás en la cancha)
2. Esperar confirmación
3. Gestionar contraseñas olvidadas via email
4. Muchos usuarios del target usan el mismo email para todo y no recuerdan cuál es

---

## Decisión

**Se implementa auth con username + contraseña, sin email, en la fase 1.**

Técnicamente se usa Supabase Auth con un email ficticio interno (`{username}@lapizarra.internal`) para aprovechar la infraestructura de Supabase sin requerir email real del usuario.

---

## Consecuencias Positivas

- Onboarding en < 60 segundos
- Sin dependencia de acceso al email en el momento del registro
- Más natural para el target (fútbol amateur)

## Consecuencias Negativas

- No hay mecanismo de recuperación de contraseña (usuario pierde acceso si olvida password)
- No se puede verificar identidad del usuario
- Si se quiere añadir email después, hay que migrar los registros

---

## Alternativas Consideradas

| Alternativa | Descartada por |
|-------------|---------------|
| Email + contraseña | Fricción de onboarding |
| Magic link por email | Requiere email igualmente |
| OAuth (Google, etc.) | Requiere cuenta de tercero, no todos tienen |
| Número de teléfono + OTP | Complejidad operacional (SMS), costo |
| Anónimo puro | No hay forma de recuperar cuenta en otro dispositivo |

---

## Migración Futura

Cuando se agregue email:
1. Agregar campo `email` nullable a `profiles`
2. Agregar flujo de "reclama tu cuenta con email"
3. Actualizar el email ficticio en `auth.users` al real
4. Habilitar confirmación de email en Supabase

---

*Documentation Agent — LaPizarra Knowledge Base*
