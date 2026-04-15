"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function generateInviteLink(
  teamId: string
): Promise<{ token: string; code: string } | { error: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("generate_team_invitation", {
    p_team_id: teamId,
  })

  if (error) {
    console.error("generateInviteLink error:", error)
    return { error: "No se pudo generar el link." }
  }

  const result = data as { token: string; code: string }
  return { token: result.token, code: result.code }
}

export async function createGuestPlayer(formData: {
  teamId: string
  guestName: string
  position: string | null
  jerseyNumber: number | null
  guestEmail: string | null
  role: "player" | "admin"
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()

  const { error } = await supabase.rpc("add_guest_player", {
    p_team_id: formData.teamId,
    p_guest_name: formData.guestName,
    p_position: formData.position ?? null,
    p_jersey_number: formData.jerseyNumber ?? null,
    p_guest_email: formData.guestEmail ?? null,
    p_role: formData.role,
  })

  if (error) {
    console.error("createGuestPlayer error:", error)
    if (error.message?.includes("admins")) return { error: "Solo los administradores pueden agregar jugadores." }
    if (error.message?.includes("jersey") || error.code === "23505")
      return { error: "Ese número de camiseta ya está en uso." }
    return { error: "No se pudo crear el jugador. Intenta de nuevo." }
  }

  return { success: true }
}

function generateUsername(displayName: string): string {
  const base = displayName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 14)
  const suffix = Math.floor(Math.random() * 9000 + 1000)
  return `${base || "jugador"}${suffix}`
}

function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export async function createPlayerWithAccount(formData: {
  teamId: string
  displayName: string
  position: string | null
  jerseyNumber: number | null
  role: "player" | "admin"
}): Promise<
  | { success: true; username: string; password: string }
  | { error: string }
> {
  // Verify current user is admin of the team
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", formData.teamId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  if (membership?.role !== "admin") {
    return { error: "Solo los administradores pueden crear cuentas." }
  }

  const adminClient = createAdminClient()
  const username = generateUsername(formData.displayName)
  const password = generatePassword()
  const internalEmail = `${username}@lapizarra.app`

  // Create auth user (profile created automatically by trigger)
  const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
    email: internalEmail,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      display_name: formData.displayName,
    },
  })

  if (authError || !newUser.user) {
    console.error("createPlayerWithAccount authError:", authError)
    return { error: "No se pudo crear la cuenta. Intenta de nuevo." }
  }

  // Wait briefly for the profile trigger to run
  await new Promise((r) => setTimeout(r, 500))

  // Add to team directly via admin client (bypasses RLS)
  const { error: memberError } = await adminClient.from("team_members").insert({
    team_id: formData.teamId,
    user_id: newUser.user.id,
    role: formData.role,
    position: formData.position ?? null,
    jersey_number: formData.jerseyNumber ?? null,
    status: "active",
  })

  if (memberError) {
    console.error("createPlayerWithAccount memberError:", memberError)
    // Cleanup: delete the auth user we just created
    await adminClient.auth.admin.deleteUser(newUser.user.id)
    if (memberError.code === "23505") return { error: "Ese número de camiseta ya está en uso." }
    return { error: "No se pudo agregar al equipo. Intenta de nuevo." }
  }

  return { success: true, username, password }
}
