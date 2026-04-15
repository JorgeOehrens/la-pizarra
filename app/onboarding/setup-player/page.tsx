import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SetupPlayerForm } from "./setup-player-form"

export default async function SetupPlayerPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, teams(name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!membership?.team_id) redirect("/onboarding")

  const team = membership.teams as unknown as { name: string } | null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 pb-12 pt-16 max-w-sm mx-auto w-full">
        <div className="mb-10">
          <p className="text-accent text-xs uppercase tracking-widest mb-2">
            {team?.name ?? "Tu equipo"}
          </p>
          <h1 className="font-display text-4xl uppercase tracking-tight mb-2">
            Completa tu perfil
          </h1>
          <p className="text-muted-foreground text-sm">
            Agrega tu número y posición para aparecer en la plantilla.
          </p>
        </div>

        <SetupPlayerForm />
      </div>
    </div>
  )
}
