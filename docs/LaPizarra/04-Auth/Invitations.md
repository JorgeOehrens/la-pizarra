# Sistema de Invitaciones

> Agente: Auth & Flow Agent
> Dos mecanismos: link único y código de 6 caracteres. Sin email.

---

## Tipos de Invitación

### 1. Link de Invitación
```
https://lapizarra.app/join/abc123def456...
```
- UUID único como token
- Se comparte por WhatsApp, Instagram, etc.
- Expira en 7 días
- Un solo uso (usado_by)

### 2. Código de 6 Caracteres
```
LP-A7K2M9
```
- 6 caracteres alfanuméricos en mayúsculas
- Más fácil de compartir verbalmente
- También expira en 7 días
- Un solo uso

---

## Flujo de Invitación por Link

```
Admin del equipo
    │
    ▼
[Genera invitación] → POST /api/teams/{id}/invitations
    │                   Crea registro en invitations
    │                   type: 'link', token: uuid
    │
    ▼
[Copia el link] → https://lapizarra.app/join/{token}
    │
    ▼
[Comparte por WhatsApp/etc]
    │
    ▼
Jugador abre el link
    │
    ▼
Página /join/{token}:
  - Verifica que el token existe y no ha expirado
  - Muestra info del equipo (nombre, logo)
  - Si no está autenticado → Crear cuenta o Login
  - Si ya está autenticado → Confirmar unirse
    │
    ▼
[Confirmar] → POST /api/invitations/{token}/accept
  - Marca invitation.status = 'accepted'
  - Crea team_members entry
  - Redirige al equipo
```

---

## Flujo de Invitación por Código

```
Admin del equipo
    │
    ▼
[Genera código] → POST /api/teams/{id}/invitations
    │               Crea registro con type: 'code'
    │               code: 'A7K2M9' (generado aleatoriamente)
    │
    ▼
Admin dice verbalmente o escribe el código
    │
    ▼
Jugador va a la app → "Ingresar código"
    │
    ▼
Ingresa: A7K2M9
    │
    ▼
POST /api/invitations/redeem
  - Busca invitation por code
  - Verifica status === 'pending' y expires_at > now()
  - Si OK: muestra el equipo y pide confirmar
    │
    ▼
[Confirmar] → Mismo proceso que link
```

---

## Implementación del Backend

### Generar Invitación

```typescript
// app/api/teams/[teamId]/invitations/route.ts
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const type = body.type as 'link' | 'code'

  // Verificar que el usuario es admin (RLS lo hace, pero explicitamos)
  const { data: member } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', params.teamId)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const token = nanoid(32) // Token largo para links
  const code = type === 'code'
    ? nanoid(6).toUpperCase()   // Código corto
    : null

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      team_id: params.teamId,
      created_by: user.id,
      type,
      token,
      code,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const invitationUrl = type === 'link'
    ? `${process.env.NEXT_PUBLIC_APP_URL}/join/${token}`
    : null

  return Response.json({ invitation: data, url: invitationUrl, code })
}
```

### Aceptar Invitación

```typescript
// app/api/invitations/[token]/accept/route.ts
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Buscar la invitación
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('*, teams(name, logo_url)')
    .or(`token.eq.${params.token},code.eq.${params.token.toUpperCase()}`)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single()

  if (invError || !invitation) {
    return Response.json(
      { error: 'Invitación inválida o expirada' },
      { status: 404 }
    )
  }

  // Verificar que no sea ya miembro
  const { data: existingMember } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', invitation.team_id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    return Response.json(
      { error: 'Ya eres miembro de este equipo' },
      { status: 409 }
    )
  }

  // Crear miembro + actualizar invitación (en transacción)
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: invitation.team_id,
      user_id: user.id,
      role: 'player',
    })

  if (memberError) return Response.json({ error: memberError.message }, { status: 500 })

  await supabase
    .from('invitations')
    .update({
      status: 'accepted',
      used_by: user.id,
      used_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  return Response.json({ success: true, teamId: invitation.team_id })
}
```

---

## Estados de Invitación

```
pending ──► accepted  (jugador acepta)
        ──► rejected  (jugador rechaza)
        ──► expired   (cron job que marca las vencidas)
        ──► revoked   (admin la revoca manualmente)
```

---

## Gestión de Invitaciones Expiradas

```sql
-- Cron job en Supabase (Edge Functions o pg_cron):
-- Marcar como expiradas las que vencieron
update public.invitations
set status = 'expired'
where status = 'pending'
  and expires_at < now();
```

Configurar como Cron Job en Supabase Dashboard → Database → Scheduled Jobs:
```
Nombre: expire-invitations
Schedule: 0 * * * * (cada hora)
SQL: update public.invitations set status = 'expired' where status = 'pending' and expires_at < now();
```

---

## UI/UX de la Página de Invitación

```
┌─────────────────────────────────┐
│           LaPizarra             │
│                                 │
│  [Logo del equipo]              │
│                                 │
│  Te invitaron a unirte a:       │
│  ⚽ Los Guerreros FC             │
│                                 │
│  6 jugadores activos            │
│                                 │
│  ┌─────────────────────────┐   │
│  │    Crear mi cuenta      │   │
│  └─────────────────────────┘   │
│                                 │
│  ¿Ya tienes cuenta?             │
│  Inicia sesión                  │
└─────────────────────────────────┘
```

---

*Auth & Flow Agent — LaPizarra Knowledge Base*
