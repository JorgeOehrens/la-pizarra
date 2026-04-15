# Flujo de Autenticación

> Agente: Auth & Flow Agent
> Sin email en fase 1. Registro rápido, sesión persistente.

---

## Decisión de Diseño

**No usamos email por ahora.** El email añade fricción (verificación, spam, contraseñas olvidadas). El fútbol amateur requiere onboarding < 60 segundos.

**Alternativa elegida:** Username + contraseña, implementado sobre Supabase Auth.

---

## Flujo Completo de Registro

```
┌─────────────────────────────────────────────────────┐
│                   NUEVO USUARIO                      │
└──────────────────────────┬──────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │  Elige username único   │
              │  Elige contraseña       │
              │  (Nombre opcional)      │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  Supabase crea user     │
              │  en auth.users con      │
              │  email fake interno:    │
              │  {username}@lapizarra   │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  Trigger on_auth_user   │
              │  _created crea profile  │
              │  en public.profiles     │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  Usuario autenticado    │
              │  Redirige a /dashboard  │
              └─────────────────────────┘
```

---

## Implementación Técnica

### Registro de Usuario

```typescript
// lib/auth/register.ts
import { createClient } from '@/lib/supabase/client'

interface RegisterInput {
  username: string
  password: string
  displayName?: string
}

export async function registerUser({ username, password, displayName }: RegisterInput) {
  const supabase = createClient()

  // Verificar que el username no esté tomado
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .single()

  if (existing) {
    throw new Error('Este nombre de usuario ya está en uso')
  }

  // Crear usuario en Supabase Auth
  // Usamos email ficticio internamente (sin verificación)
  const { data, error } = await supabase.auth.signUp({
    email: `${username.toLowerCase()}@lapizarra.internal`,
    password,
    options: {
      data: {
        username: username.toLowerCase(),
        display_name: displayName || username,
      },
      // No enviar email de confirmación
      emailRedirectTo: undefined,
    }
  })

  if (error) throw error
  return data
}
```

### Login de Usuario

```typescript
// lib/auth/login.ts
export async function loginUser(username: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username.toLowerCase()}@lapizarra.internal`,
    password,
  })

  if (error) throw error
  return data
}
```

### Configuración de Supabase Auth

```
En el Dashboard de Supabase:
- Email confirmations: DESACTIVADO
- Email change: DESACTIVADO
- Mailer autoconfirm: ACTIVADO (para no requerir confirmación)
```

---

## Estados de Sesión

```
                    ┌──────────┐
                    │  No auth  │
                    └────┬──────┘
                         │ register/login
                    ┌────▼──────┐
                    │   Auth    │◄─── refresh automático
                    │  Active   │
                    └────┬──────┘
                         │ logout / expiración
                    ┌────▼──────┐
                    │  No auth  │
                    └──────────┘
```

**Duración de sesión:** 7 días (configurable en Supabase)
**Refresh automático:** Supabase maneja el refresh token

---

## Contexto de Auth en Next.js

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas protegidas
  const protectedRoutes = ['/dashboard', '/teams']
  const isProtected = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Validaciones de Username

```typescript
// lib/auth/validation.ts
export const USERNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/, // solo letras, números y guión bajo
}

export function validateUsername(username: string): string | null {
  if (username.length < USERNAME_RULES.minLength)
    return `El nombre debe tener al menos ${USERNAME_RULES.minLength} caracteres`
  if (username.length > USERNAME_RULES.maxLength)
    return `El nombre no puede tener más de ${USERNAME_RULES.maxLength} caracteres`
  if (!USERNAME_RULES.pattern.test(username))
    return 'Solo se permiten letras, números y guión bajo (_)'
  return null
}
```

---

## Rutas de la App

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing page |
| `/login` | No auth | Login |
| `/register` | No auth | Registro |
| `/join/[token]` | Cualquiera | Unirse por link |
| `/dashboard` | Auth | Dashboard principal |
| `/teams/[teamId]` | Auth + miembro | Equipo |
| `/teams/new` | Auth | Crear equipo |

---

## Futuro: Migración a Email

Cuando se agregue email auth:
1. Agregar columna `email` nullable en `profiles`
2. Migrar el email fake `@lapizarra.internal` al real
3. Activar verificación de email en Supabase
4. No romper la experiencia de usuarios sin email

---

*Auth & Flow Agent — LaPizarra Knowledge Base*
