"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getActiveTeamMembership } from "@/lib/team"

export type ChargeType = "cancha" | "cuota_liga" | "asado" | "indumentaria" | "evento" | "otro"
export type DistributionType = "equal" | "fixed_amount" | "custom"
export type DistributionStatus = "pending" | "paid" | "partial" | "exempt" | "not_applicable"

export interface MemberDistributionInput {
  member_id: string
  assigned_amount: number
  percentage: number | null
  status: DistributionStatus
}

export interface InstallmentConfig {
  count: number
  frequency: "weekly" | "biweekly" | "monthly"
  start_date: string
}

export interface CreateChargePayload {
  name: string
  description: string
  charge_type: ChargeType
  total_amount: number
  distribution_type: DistributionType
  beneficiary_id: string | null
  due_date: string | null
  distributions: MemberDistributionInput[]
  installments?: InstallmentConfig
  match_id?: string | null
}

function installmentDueDate(
  start: string,
  freq: "weekly" | "biweekly" | "monthly",
  idx: number
): string {
  const d = new Date(start + "T12:00:00")
  if (freq === "weekly") d.setDate(d.getDate() + idx * 7)
  else if (freq === "biweekly") d.setDate(d.getDate() + idx * 14)
  else d.setMonth(d.getMonth() + idx)
  return d.toISOString().split("T")[0]
}

async function insertDistributions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  chargeId: string,
  teamId: string,
  distributions: MemberDistributionInput[]
): Promise<boolean> {
  const { error } = await supabase.from("charge_distributions").insert(
    distributions.map((d) => ({
      charge_id: chargeId,
      team_id: teamId,
      member_id: d.member_id,
      assigned_amount: d.assigned_amount,
      percentage: d.percentage,
      status: d.status,
      paid_amount: 0,
    }))
  )
  if (error) console.error("insertDistributions:", error)
  return !error
}

export async function createCharge(
  payload: CreateChargePayload
): Promise<{ ok: true; chargeId: string | null } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) return { error: "Sin equipo activo" }
  if (membership.role !== "admin") return { error: "Solo admins pueden crear cobros" }

  if (!payload.name.trim()) return { error: "El nombre es obligatorio" }
  if (payload.total_amount <= 0) return { error: "El monto debe ser mayor a 0" }
  if (payload.distributions.length === 0) return { error: "Agrega al menos un jugador" }

  const billableDistributions = payload.distributions.filter(
    (d) => d.status !== "exempt" && d.status !== "not_applicable"
  )
  const distributedTotal = billableDistributions.reduce((sum, d) => sum + d.assigned_amount, 0)
  if (Math.abs(distributedTotal - payload.total_amount) > 0.05) {
    return {
      error: `El total distribuido ($${Math.round(distributedTotal).toLocaleString("es-CL")}) no coincide con el monto ($${Math.round(payload.total_amount).toLocaleString("es-CL")})`,
    }
  }

  const teamId = membership.team_id
  const baseCharge = {
    team_id: teamId,
    created_by: user.id,
    name: payload.name.trim(),
    description: payload.description.trim() || null,
    charge_type: payload.charge_type,
    total_amount: payload.total_amount,
    distribution_type: payload.distribution_type,
    beneficiary_id: payload.beneficiary_id || null,
    match_id: payload.match_id || null,
  }

  // ── Series of installments ──
  if (payload.installments && payload.installments.count > 1) {
    const { count, frequency, start_date } = payload.installments
    const seriesId = crypto.randomUUID()
    let firstChargeId: string | null = null

    for (let i = 0; i < count; i++) {
      const dueDate = start_date ? installmentDueDate(start_date, frequency, i) : null
      const { data: charge, error: chargeError } = await supabase
        .from("team_charges")
        .insert({
          ...baseCharge,
          due_date: dueDate,
          series_id: seriesId,
          installment_number: i + 1,
          total_installments: count,
        })
        .select("id")
        .single()

      if (chargeError || !charge) {
        console.error("createCharge series:", chargeError)
        return { error: "No se pudo crear la serie de cobros" }
      }

      const ok = await insertDistributions(supabase, charge.id, teamId, payload.distributions)
      if (!ok) return { error: "No se pudo distribuir el cobro" }

      if (i === 0) firstChargeId = charge.id
    }

    revalidatePath("/finance")
    return { ok: true, chargeId: firstChargeId }
  }

  // ── Single charge ──
  const { data: charge, error: chargeError } = await supabase
    .from("team_charges")
    .insert({ ...baseCharge, due_date: payload.due_date || null })
    .select("id")
    .single()

  if (chargeError || !charge) {
    console.error("createCharge:", chargeError)
    return { error: "No se pudo crear el cobro" }
  }

  const ok = await insertDistributions(supabase, charge.id, teamId, payload.distributions)
  if (!ok) {
    await supabase.from("team_charges").delete().eq("id", charge.id)
    return { error: "No se pudo distribuir el cobro" }
  }

  revalidatePath("/finance")
  return { ok: true, chargeId: charge.id }
}

export async function confirmPayment(
  distributionId: string,
  amount: number,
  notes?: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) return { error: "Sin equipo activo" }
  if (membership.role !== "admin") return { error: "Solo admins pueden confirmar pagos" }
  if (amount <= 0) return { error: "El monto debe ser mayor a 0" }

  const { data: dist } = await supabase
    .from("charge_distributions")
    .select("id, charge_id, team_id, member_id, assigned_amount, paid_amount")
    .eq("id", distributionId)
    .single()

  if (!dist) return { error: "Distribución no encontrada" }
  if (dist.team_id !== membership.team_id) return { error: "Sin permiso" }

  const { error: payError } = await supabase.from("payment_records").insert({
    distribution_id: distributionId,
    charge_id: dist.charge_id,
    team_id: dist.team_id,
    payer_id: dist.member_id,
    amount,
    confirmed_by: user.id,
    notes: notes?.trim() || null,
  })

  if (payError) {
    console.error("confirmPayment:", payError)
    return { error: "No se pudo registrar el pago" }
  }

  const newPaidAmount = Number(dist.paid_amount) + amount
  const isFullyPaid = newPaidAmount >= Number(dist.assigned_amount) - 0.01

  const { error: updateError } = await supabase
    .from("charge_distributions")
    .update({
      paid_amount: newPaidAmount,
      status: isFullyPaid ? "paid" : "partial",
    })
    .eq("id", distributionId)

  if (updateError) {
    console.error("updateDistribution:", updateError)
    return { error: "No se pudo actualizar el estado" }
  }

  revalidatePath("/finance")
  return { ok: true }
}

export async function updateDistributionStatus(
  distributionId: string,
  status: "exempt" | "not_applicable"
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) return { error: "Sin equipo activo" }
  if (membership.role !== "admin") return { error: "Solo admins pueden modificar estados" }

  const { data: dist } = await supabase
    .from("charge_distributions")
    .select("team_id")
    .eq("id", distributionId)
    .single()

  if (!dist || dist.team_id !== membership.team_id) return { error: "Sin permiso" }

  const { error } = await supabase
    .from("charge_distributions")
    .update({ status })
    .eq("id", distributionId)

  if (error) return { error: "No se pudo actualizar" }

  revalidatePath("/finance")
  return { ok: true }
}

export async function resetDistributionStatus(
  distributionId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) return { error: "Sin equipo activo" }
  if (membership.role !== "admin") return { error: "Solo admins pueden modificar estados" }

  const { data: dist } = await supabase
    .from("charge_distributions")
    .select("team_id")
    .eq("id", distributionId)
    .single()

  if (!dist || dist.team_id !== membership.team_id) return { error: "Sin permiso" }

  const { error } = await supabase
    .from("charge_distributions")
    .update({ status: "pending", paid_amount: 0 })
    .eq("id", distributionId)

  if (error) return { error: "No se pudo restablecer" }

  revalidatePath("/finance")
  return { ok: true }
}

export async function cancelCharge(
  chargeId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) return { error: "Sin equipo activo" }
  if (membership.role !== "admin") return { error: "Solo admins pueden cancelar cobros" }

  const { data: charge } = await supabase
    .from("team_charges")
    .select("team_id")
    .eq("id", chargeId)
    .single()

  if (!charge || charge.team_id !== membership.team_id) return { error: "Sin permiso" }

  const { error } = await supabase
    .from("team_charges")
    .update({ status: "cancelled" })
    .eq("id", chargeId)

  if (error) return { error: "No se pudo cancelar el cobro" }

  revalidatePath("/finance")
  return { ok: true }
}
