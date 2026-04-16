"use client"

import Link from "next/link"
import { ChevronLeft, User } from "lucide-react"
import { cn } from "@/lib/utils"

type Charge = {
  id: string
  name: string
  charge_type: string
  description: string | null
  total_amount: number
  status: string
  due_date: string | null
  beneficiary_id: string | null
}

type Distribution = {
  id: string
  member_id: string
  assigned_amount: number
  paid_amount: number
  status: string
}

const CHARGE_META: Record<string, { icon: string; label: string }> = {
  cancha: { icon: "🏟", label: "Cancha" },
  cuota_liga: { icon: "🏆", label: "Liga" },
  asado: { icon: "🍖", label: "Asado" },
  indumentaria: { icon: "👕", label: "Indumentaria" },
  evento: { icon: "🎉", label: "Evento" },
  otro: { icon: "📋", label: "Otro" },
}

const DIST_STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "text-yellow-400" },
  partial: { label: "Pago parcial", color: "text-orange-400" },
  paid: { label: "Pagado ✓", color: "text-accent" },
  exempt: { label: "Exento", color: "text-muted-foreground" },
  not_applicable: { label: "No aplica", color: "text-muted-foreground" },
}

function formatCLP(amount: number) {
  return `$${Math.round(amount).toLocaleString("es-CL")}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function ChargeDetailView({
  charge,
  myDistribution,
  beneficiaryName,
  summary,
}: {
  charge: Charge
  myDistribution: Distribution | null
  beneficiaryName: string | null
  summary: { total: number; paid: number; collected: number }
}) {
  const meta = CHARGE_META[charge.charge_type] ?? { icon: "📋", label: "Otro" }
  const remaining = myDistribution
    ? Number(myDistribution.assigned_amount) - Number(myDistribution.paid_amount)
    : 0
  const distStatus = myDistribution ? DIST_STATUS_META[myDistribution.status] : null
  const progress = summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0
  const isOverdue = charge.status === "overdue"

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 mb-8">
        <Link href="/finance" className="p-2 rounded-lg bg-card border border-border">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
            {meta.label}
          </p>
          <h1 className="font-display text-2xl leading-tight">{charge.name}</h1>
        </div>
      </header>

      {/* My debt card */}
      {myDistribution && (
        <section
          className={cn(
            "bg-card border rounded-2xl p-6 mb-6",
            myDistribution.status === "paid"
              ? "border-accent/30"
              : isOverdue
              ? "border-destructive/30"
              : "border-border/40"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">{meta.icon}</span>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Tu parte</p>
              {distStatus && (
                <p className={cn("text-xs font-medium", distStatus.color)}>{distStatus.label}</p>
              )}
            </div>
          </div>

          {myDistribution.status === "paid" ? (
            <div className="text-center py-4">
              <p className="text-5xl mb-2">✅</p>
              <p className="font-display text-2xl text-accent">Pagado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCLP(Number(myDistribution.assigned_amount))}
              </p>
            </div>
          ) : myDistribution.status === "exempt" || myDistribution.status === "not_applicable" ? (
            <p className="text-center text-muted-foreground py-4">
              {myDistribution.status === "exempt" ? "Estás exento de este cobro" : "Este cobro no te aplica"}
            </p>
          ) : (
            <>
              <p className="font-display text-4xl mb-1">{formatCLP(remaining)}</p>
              {myDistribution.status === "partial" && (
                <p className="text-xs text-muted-foreground mb-3">
                  Ya pagaste {formatCLP(Number(myDistribution.paid_amount))} de{" "}
                  {formatCLP(Number(myDistribution.assigned_amount))}
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-border/30">
                {charge.beneficiary_id && beneficiaryName ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">El dinero va a</p>
                      <p className="text-sm font-medium">{beneficiaryName}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">El dinero va al equipo</p>
                )}
              </div>

              {charge.due_date && (
                <p className={cn("text-xs mt-3", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                  {isOverdue ? "⚠ Venció el " : "Vence el "}
                  {formatDate(charge.due_date)}
                </p>
              )}
            </>
          )}
        </section>
      )}

      {/* Team progress */}
      <section className="bg-card border border-border/40 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Estado del cobro</p>
          <p className="text-xs text-muted-foreground">
            {summary.paid}/{summary.total} pagaron
          </p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Recaudado: {formatCLP(summary.collected)}</span>
          <span>{progress}%</span>
        </div>
      </section>

      {/* Description */}
      {charge.description && (
        <section className="bg-card border border-border/40 rounded-xl p-4 mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Descripción</p>
          <p className="text-sm">{charge.description}</p>
        </section>
      )}

      {/* MVP note: payment instructions */}
      {myDistribution &&
        myDistribution.status !== "paid" &&
        myDistribution.status !== "exempt" &&
        myDistribution.status !== "not_applicable" && (
          <div className="bg-muted/30 border border-border/30 rounded-xl px-4 py-3 text-xs text-muted-foreground">
            💡 Para marcar tu pago, comunícate con el admin del equipo.
          </div>
        )}
    </div>
  )
}
