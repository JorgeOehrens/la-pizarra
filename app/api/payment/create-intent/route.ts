import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { getActiveTeamMembership } from "@/lib/team"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const membership = await getActiveTeamMembership(supabase, user.id)
    if (!membership) return NextResponse.json({ error: "Sin equipo" }, { status: 401 })

    const body = await req.json() as { distributionIds: string[] }
    const { distributionIds } = body
    if (!distributionIds?.length) {
      return NextResponse.json({ error: "Sin distribuciones" }, { status: 400 })
    }

    // Fetch and validate distributions
    const { data: dists } = await supabase
      .from("charge_distributions")
      .select("id, team_id, member_id, assigned_amount, paid_amount, status")
      .in("id", distributionIds)

    if (!dists?.length) {
      return NextResponse.json({ error: "Distribuciones no encontradas" }, { status: 404 })
    }

    // Security: ensure all distributions belong to the user's current team and this user
    for (const d of dists) {
      if (d.team_id !== membership.team_id || d.member_id !== user.id) {
        return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
      }
      if (d.status === "paid" || d.status === "exempt" || d.status === "not_applicable") {
        return NextResponse.json({ error: "Distribución ya pagada o exenta" }, { status: 400 })
      }
    }

    const totalCLP = dists.reduce(
      (sum, d) => sum + Math.round(Number(d.assigned_amount) - Number(d.paid_amount)),
      0
    )

    if (totalCLP <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 })
    }

    // CLP is zero-decimal in Stripe
    const intent = await stripe.paymentIntents.create({
      amount: totalCLP,
      currency: "clp",
      payment_method_types: ["card"],
      metadata: {
        distribution_ids: distributionIds.join(","),
        team_id: membership.team_id,
        payer_id: user.id,
      },
      description: `LaPizarra · ${membership.teams.name}`,
    })

    return NextResponse.json({ clientSecret: intent.client_secret })
  } catch (err) {
    console.error("create-intent:", err)
    return NextResponse.json({ error: "Error al iniciar pago" }, { status: 500 })
  }
}
