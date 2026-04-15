import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → send to signup with return URL
  if (!user) {
    redirect(`/auth/signup?redirectTo=/join/${token}`)
  }

  // Already has a team → still try to join this one (they can be in multiple teams in the future;
  // for now just process the join and go home)
  const { data, error } = await supabase.rpc("join_team_by_token", { p_token: token })

  if (error || data?.error === "invalid_or_expired") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-display text-3xl mb-3 text-center">Link inválido</h1>
        <p className="text-muted-foreground text-center text-sm max-w-xs mb-8">
          Este link de invitación no existe, ya fue usado o expiró.
          Pide uno nuevo al administrador del equipo.
        </p>
        <Link
          href="/onboarding"
          className="bg-accent text-accent-foreground font-display uppercase text-sm tracking-wider px-8 py-4 rounded-2xl"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  // Success — prompt user to set up their position and jersey number
  redirect("/onboarding/setup-player")
}
