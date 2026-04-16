import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent
    const distributionIds = intent.metadata.distribution_ids?.split(",").filter(Boolean) ?? []
    const payerId = intent.metadata.payer_id
    const teamId = intent.metadata.team_id

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
        notes: "Apple Pay / Google Pay",
      })

      await supabase
        .from("charge_distributions")
        .update({ paid_amount: Number(dist.assigned_amount), status: "paid" })
        .eq("id", dist.id)
    }
  }

  return NextResponse.json({ received: true })
}
