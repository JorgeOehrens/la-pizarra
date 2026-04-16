import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreateTeamForm } from "./create-team-form"

export default async function CreateTeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/onboarding/create-team")
  return <CreateTeamForm />
}
