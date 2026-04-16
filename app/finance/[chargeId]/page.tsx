import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getActiveTeamMembership } from "@/lib/team"
import { ChargeDetailView } from "./charge-detail-view"

export default async function ChargeDetailPage({
  params,
}: {
  params: Promise<{ chargeId: string }>
}) {
  const { chargeId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")

  // Admins go directly to manage
  if (membership.role === "admin") {
    redirect(`/finance/${chargeId}/manage`)
  }

  const teamId = membership.team_id

  const [chargeRes, distRes] = await Promise.all([
    supabase
      .from("team_charges")
      .select("id, name, charge_type, description, total_amount, status, due_date, beneficiary_id")
      .eq("id", chargeId)
      .eq("team_id", teamId)
      .is("deleted_at", null)
      .single(),

    supabase
      .from("charge_distributions")
      .select("id, member_id, assigned_amount, paid_amount, status")
      .eq("charge_id", chargeId)
      .eq("member_id", user.id)
      .maybeSingle(),
  ])

  if (!chargeRes.data) redirect("/finance")

  const charge = chargeRes.data
  const myDist = distRes.data

  // Beneficiary name
  let beneficiaryName: string | null = null
  if (charge.beneficiary_id) {
    const { data: ben } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", charge.beneficiary_id)
      .single()
    beneficiaryName = ben?.display_name || ben?.username || null
  }

  // Distribution summary
  const { data: allDist } = await supabase
    .from("charge_distributions")
    .select("status, paid_amount")
    .eq("charge_id", chargeId)

  const summary = {
    total: (allDist ?? []).length,
    paid: (allDist ?? []).filter((d) => d.status === "paid").length,
    collected: (allDist ?? []).reduce((s, d) => s + Number(d.paid_amount), 0),
  }

  return (
    <AppShell showNav={false}>
      <ChargeDetailView
        charge={charge as any}
        myDistribution={myDist as any}
        beneficiaryName={beneficiaryName}
        summary={summary}
      />
    </AppShell>
  )
}
