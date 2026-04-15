import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PlayerEditForm } from "./player-edit-form"

export default async function PlayerEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: playerId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Current user's membership
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!membership?.team_id) redirect("/onboarding")

  const teamId = membership.team_id
  const currentUserRole = membership.role
  const isAdmin = currentUserRole === "admin"
  const isOwnProfile = user.id === playerId

  // Only admin or the player themselves can edit
  if (!isAdmin && !isOwnProfile) redirect(`/players/${playerId}`)

  // Fetch the target player's data
  const { data: member } = await supabase
    .from("team_members")
    .select("jersey_number, position, role, profiles(display_name, username)")
    .eq("user_id", playerId)
    .eq("team_id", teamId)
    .eq("status", "active")
    .maybeSingle()

  if (!member) redirect("/team")

  const profile = member.profiles as unknown as { display_name: string | null; username: string } | null
  const displayName = profile?.display_name || profile?.username || ""

  return (
    <PlayerEditForm
      playerId={playerId}
      teamId={teamId}
      isAdmin={isAdmin}
      isOwnProfile={isOwnProfile}
      initialData={{
        display_name: displayName,
        position: member.position ?? null,
        jersey_number: member.jersey_number ?? null,
        role: member.role ?? "player",
      }}
    />
  )
}
