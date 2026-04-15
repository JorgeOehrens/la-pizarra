import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Plus } from "lucide-react"

export default async function OnboardingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // If user already has a team, send them home
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (membership?.team_id) redirect("/home")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 pb-12 pt-16 max-w-sm mx-auto w-full">
        {/* Logo / wordmark */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-5xl tracking-tight mb-2">
            La<span className="text-accent">Pizarra</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Bienvenido. ¿Qué quieres hacer?
          </p>
        </div>

        <div className="space-y-4">
          {/* Create team */}
          <Link
            href="/onboarding/create-team"
            className="flex items-center gap-5 w-full bg-accent text-accent-foreground rounded-2xl p-6 active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 bg-accent-foreground/15 rounded-xl flex items-center justify-center shrink-0">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl uppercase tracking-tight">
                Crear equipo
              </h2>
              <p className="text-sm opacity-75">Soy el administrador</p>
            </div>
          </Link>

          {/* Join team */}
          <Link
            href="/onboarding/join-team"
            className="flex items-center gap-5 w-full bg-card border border-border/40 rounded-2xl p-6 active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl uppercase tracking-tight">
                Unirme a equipo
              </h2>
              <p className="text-sm text-muted-foreground">Tengo un link o código</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
