import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getActiveTeamMembership } from "@/lib/team"
import { FinanceView, type TeamCharge, type MyDistributionRow } from "./finance-view"

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")

  const teamId = membership.team_id
  const isAdmin = membership.role === "admin"

  // Fetch all non-deleted charges for the team
  const { data: rawCharges } = await supabase
    .from("team_charges")
    .select("id, name, charge_type, total_amount, status, due_date, beneficiary_id, created_at, series_id, installment_number, total_installments, match_id")
    .eq("team_id", teamId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50)

  const charges = (rawCharges ?? []) as TeamCharge[]
  const activeChargeIds = charges
    .filter((c) => c.status === "active" || c.status === "overdue")
    .map((c) => c.id)

  // Fetch distributions for active charges
  const [distRes, beneficiaryRes, myDistRes] = await Promise.all([
    activeChargeIds.length > 0
      ? supabase
          .from("charge_distributions")
          .select("id, charge_id, member_id, assigned_amount, paid_amount, status")
          .in("charge_id", activeChargeIds)
      : Promise.resolve({ data: [] }),

    // Beneficiary profiles
    (() => {
      const ids = [...new Set(charges.filter((c) => c.beneficiary_id).map((c) => c.beneficiary_id as string))]
      return ids.length > 0
        ? supabase.from("profiles").select("id, display_name, username").in("id", ids)
        : Promise.resolve({ data: [] })
    })(),

    // My distributions for the player view (pending + paid history)
    supabase
      .from("charge_distributions")
      .select("id, charge_id, assigned_amount, paid_amount, status")
      .eq("team_id", teamId)
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ])

  const allDistributions = (distRes.data ?? []) as {
    id: string; charge_id: string; member_id: string
    assigned_amount: number; paid_amount: number; status: string
  }[]

  const beneficiaryMap = Object.fromEntries(
    (beneficiaryRes.data ?? []).map((b) => [
      b.id,
      (b as { id: string; display_name: string | null; username: string }).display_name ||
      (b as { id: string; display_name: string | null; username: string }).username,
    ])
  )

  // Build distribution summary per charge
  const distByCharge: Record<string, { total: number; paid: number; collected: number }> = {}
  for (const d of allDistributions) {
    if (!distByCharge[d.charge_id]) {
      distByCharge[d.charge_id] = { total: 0, paid: 0, collected: 0 }
    }
    distByCharge[d.charge_id].total++
    if (d.status === "paid") distByCharge[d.charge_id].paid++
    distByCharge[d.charge_id].collected += Number(d.paid_amount)
  }

  // Enrich charges
  const enrichedCharges: TeamCharge[] = charges.map((c) => ({
    ...c,
    beneficiary_name: c.beneficiary_id ? (beneficiaryMap[c.beneficiary_id] ?? null) : null,
    dist_summary: distByCharge[c.id] ?? null,
  }))

  // My distributions enriched with charge info
  const myRawDist = (myDistRes.data ?? []) as {
    id: string; charge_id: string; assigned_amount: number; paid_amount: number; status: string
  }[]
  const chargeById = Object.fromEntries(enrichedCharges.map((c) => [c.id, c]))
  const myDistributions: MyDistributionRow[] = myRawDist.map((d) => ({
    ...d,
    charge: chargeById[d.charge_id] ?? null,
  }))

  return (
    <AppShell>
      <FinanceView
        teamId={teamId}
        teamName={membership.teams.name}
        isAdmin={isAdmin}
        charges={enrichedCharges}
        myDistributions={myDistributions}
      />
    </AppShell>
  )
}
