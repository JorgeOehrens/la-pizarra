import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getActiveTeamMembership } from "@/lib/team"

const FINTOC_API = "https://app.fintoc.com/v1"

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

    const { data: dists } = await supabase
      .from("charge_distributions")
      .select("id, team_id, member_id, assigned_amount, paid_amount, status")
      .in("id", distributionIds)

    if (!dists?.length) {
      return NextResponse.json({ error: "Distribuciones no encontradas" }, { status: 404 })
    }

    for (const d of dists) {
      if (d.team_id !== membership.team_id || d.member_id !== user.id) {
        return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
      }
      if (d.status === "paid" || d.status === "exempt" || d.status === "not_applicable") {
        return NextResponse.json({ error: "Ya pagada o exenta" }, { status: 400 })
      }
    }

    const totalCLP = dists.reduce(
      (sum, d) => sum + Math.round(Number(d.assigned_amount) - Number(d.paid_amount)),
      0
    )
    if (totalCLP <= 0) return NextResponse.json({ error: "Monto inválido" }, { status: 400 })

    // Fetch user profile for payer name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", user.id)
      .single()
    const payerName = profile?.display_name || profile?.username || "Jugador"

    const res = await fetch(`${FINTOC_API}/payment_intents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FINTOC_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalCLP,
        currency: "CLP",
        recipient_account: {
          holder_id: process.env.FINTOC_RECIPIENT_HOLDER_ID,
          number:    process.env.FINTOC_RECIPIENT_ACCOUNT_NUMBER,
          type:      process.env.FINTOC_RECIPIENT_ACCOUNT_TYPE ?? "checking_account",
          institution_id: process.env.FINTOC_RECIPIENT_INSTITUTION_ID,
        },
        message: `LaPizarra · ${membership.teams.name} · ${payerName}`,
        metadata: {
          distribution_ids: distributionIds.join(","),
          team_id: membership.team_id,
          payer_id: user.id,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error("fintoc-intent:", err)
      return NextResponse.json({ error: "No se pudo crear el pago" }, { status: 502 })
    }

    const intent = await res.json() as { id: string; widget_token: string }
    return NextResponse.json({ widgetToken: intent.widget_token, intentId: intent.id })
  } catch (err) {
    console.error("fintoc-intent:", err)
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 })
  }
}
