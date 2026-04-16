import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getActiveTeamMembership } from "@/lib/team"
import { ManageChargeView, type DistributionWithMember } from "./manage-charge-view"

export default async function ManageChargePage({
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
  if (membership.role !== "admin") redirect(`/finance/${chargeId}`)

  const teamId = membership.team_id

  const [chargeRes, distRes] = await Promise.all([
    supabase
      .from("team_charges")
      .select("id, name, charge_type, description, total_amount, status, due_date, beneficiary_id, created_at")
      .eq("id", chargeId)
      .eq("team_id", teamId)
      .is("deleted_at", null)
      .single(),

    supabase
      .from("charge_distributions")
      .select(`
        id, member_id, assigned_amount, paid_amount, status, notes,
        member:profiles!charge_distributions_member_id_fkey(display_name, username, avatar_url)
      `)
      .eq("charge_id", chargeId)
      .order("status"),
  ])

  if (!chargeRes.data) redirect("/finance")

  const charge = chargeRes.data

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

  const distributions: DistributionWithMember[] = (distRes.data ?? []).map((d) => {
    const member = d.member as unknown as { display_name: string | null; username: string; avatar_url: string | null } | null
    return {
      id: d.id,
      member_id: d.member_id,
      display_name: member?.display_name || member?.username || "Jugador",
      avatar_url: member?.avatar_url ?? null,
      assigned_amount: Number(d.assigned_amount),
      paid_amount: Number(d.paid_amount),
      status: d.status,
      notes: d.notes,
    }
  })

  const summary = {
    total: distributions.length,
    paid: distributions.filter((d) => d.status === "paid").length,
    pending: distributions.filter((d) => d.status === "pending" || d.status === "partial").length,
    collected: distributions.reduce((s, d) => s + d.paid_amount, 0),
  }

  return (
    <AppShell showNav={false}>
      <ManageChargeView
        charge={charge as any}
        distributions={distributions}
        beneficiaryName={beneficiaryName}
        summary={summary}
      />
    </AppShell>
  )
}
