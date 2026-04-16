import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createHmac } from "crypto"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("fintoc-signature")

  // Verify webhook signature if secret is configured
  if (process.env.FINTOC_WEBHOOK_SECRET && sig) {
    const expected = createHmac("sha256", process.env.FINTOC_WEBHOOK_SECRET)
      .update(body)
      .digest("hex")
    if (expected !== sig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }
  }

  let event: { type: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(body) as { type: string; data: Record<string, unknown> }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data as {
      metadata?: { distribution_ids?: string; team_id?: string; payer_id?: string }
      amount?: number
    }
    const distributionIds = intent.metadata?.distribution_ids?.split(",").filter(Boolean) ?? []
    const payerId  = intent.metadata?.payer_id
    const teamId   = intent.metadata?.team_id

    if (!distributionIds.length || !payerId || !teamId) {
      return NextResponse.json({ received: true })
    }

    const supabase = await createClient()

    for (const distId of distributionIds) {
      const { data: dist } = await supabase
        .from("charge_distributions")
        .select("id, charge_id, assigned_amount, paid_amount")
        .eq("id", distId)
        .single()

      if (!dist) continue

      const amount = Math.round(Number(dist.assigned_amount) - Number(dist.paid_amount))
      if (amount <= 0) continue

      await supabase.from("payment_records").insert({
        distribution_id: dist.id,
        charge_id: dist.charge_id,
        team_id: teamId,
        payer_id: payerId,
        amount,
        confirmed_by: payerId,
        notes: "Fintoc · Transferencia bancaria",
      })

      await supabase
        .from("charge_distributions")
        .update({ paid_amount: Number(dist.assigned_amount), status: "paid" })
        .eq("id", dist.id)
    }
  }

  return NextResponse.json({ received: true })
}
