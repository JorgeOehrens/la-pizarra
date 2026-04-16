import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { features } from "@/lib/features"
import { TrainingForm } from "./training-form"

export default async function NewTrainingPage() {
  if (!features.training) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <AppShell showNav={false}>
      <div className="min-h-screen bg-black relative">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <TrainingForm />
      </div>
    </AppShell>
  )
}
