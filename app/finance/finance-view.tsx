"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, ChevronRight, Wallet, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { WalletPayButton } from "@/components/wallet-pay-button"
import { FintocPayButton } from "@/components/fintoc-pay-button"

export type TeamCharge = {
  id: string
  name: string
  charge_type: string
  total_amount: number
  status: string
  due_date: string | null
  beneficiary_id: string | null
  beneficiary_name?: string | null
  created_at: string
  dist_summary?: { total: number; paid: number; collected: number } | null
  series_id?: string | null
  installment_number?: number | null
  total_installments?: number | null
  match_id?: string | null
}

export type MyDistributionRow = {
  id: string
  charge_id: string
  assigned_amount: number
  paid_amount: number
  status: string
  charge: TeamCharge | null
}

const CHARGE_META: Record<string, { icon: string; label: string }> = {
  cancha: { icon: "🏟", label: "Cancha" },
  cuota_liga: { icon: "🏆", label: "Liga" },
  asado: { icon: "🍖", label: "Asado" },
  indumentaria: { icon: "👕", label: "Indumentaria" },
  evento: { icon: "🎉", label: "Evento" },
  otro: { icon: "📋", label: "Otro" },
}

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  overdue: "Vencido",
  completed: "Completado",
  cancelled: "Cancelado",
}

function formatCLP(amount: number) {
  return `$${Math.round(amount).toLocaleString("es-CL")}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" })
}

function ChargeCard({ charge, href }: { charge: TeamCharge; href: string }) {
  const meta = CHARGE_META[charge.charge_type] ?? { icon: "📋", label: "Otro" }
  const isOverdue = charge.status === "overdue"
  const isCompleted = charge.status === "completed"
  const summary = charge.dist_summary

  const progress =
    summary && summary.total > 0
      ? Math.round((summary.paid / summary.total) * 100)
      : 0

  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border/40 active:scale-[0.98] transition-transform"
    >
      <div className="text-2xl w-10 text-center flex-shrink-0">{meta.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-medium truncate text-sm">{charge.name}</h3>
            {charge.installment_number && charge.total_installments && (
              <span className="flex-shrink-0 text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-medium">
                {charge.installment_number}/{charge.total_installments}
              </span>
            )}
          </div>
          <span className={cn(
            "text-xs ml-2 flex-shrink-0",
            isOverdue && "text-destructive",
            isCompleted && "text-accent",
            !isOverdue && !isCompleted && "text-muted-foreground"
          )}>
            {STATUS_LABEL[charge.status] ?? charge.status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-base">{formatCLP(charge.total_amount)}</span>
          {charge.due_date && !isCompleted && (
            <span className={cn("text-xs", isOverdue ? "text-destructive" : "text-muted-foreground")}>
              Vence {formatDate(charge.due_date)}
            </span>
          )}
        </div>
        {summary && summary.total > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {summary.paid}/{summary.total} pagaron
              </span>
              <span className="text-[10px] text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", isCompleted ? "bg-accent" : "bg-accent/60")}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </Link>
  )
}

function MyDebtCard({ dist }: { dist: MyDistributionRow }) {
  const charge = dist.charge
  if (!charge) return null

  const meta = CHARGE_META[charge.charge_type] ?? { icon: "📋", label: "Otro" }
  const remaining = Number(dist.assigned_amount) - Number(dist.paid_amount)
  const isOverdue = charge.status === "overdue"
  const isPaid = dist.status === "paid"
  const isPartial = dist.status === "partial"

  const beneficiary = charge.beneficiary_id && charge.beneficiary_name
    ? charge.beneficiary_name
    : "el equipo"

  return (
    <Link
      href={`/finance/${charge.id}`}
      className={cn(
        "flex items-center gap-4 bg-card rounded-xl p-4 border active:scale-[0.98] transition-transform",
        isPaid ? "border-accent/30" : isOverdue ? "border-destructive/30" : "border-border/40"
      )}
    >
      {/* Icon / paid check */}
      <div className="relative flex-shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-xl",
          isPaid ? "bg-accent/15" : "bg-transparent"
        )}>
          {isPaid ? (
            <span className="text-accent text-lg font-bold">✓</span>
          ) : (
            <span>{meta.icon}</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate text-sm mb-0.5">{charge.name}</h3>
        {isPaid ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-accent font-medium">Pagado</span>
            <span className="text-xs text-muted-foreground">· a {beneficiary}</span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-base">{formatCLP(remaining)}</span>
              {isPartial && (
                <span className="text-xs text-muted-foreground">
                  (pagaste {formatCLP(Number(dist.paid_amount))})
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pagar a <strong className="text-foreground">{beneficiary}</strong>
              {charge.due_date && (
                <span className={cn("ml-1", isOverdue ? "text-destructive" : "")}>
                  · Vence {formatDate(charge.due_date)}
                </span>
              )}
            </p>
          </>
        )}
      </div>

      {!isPaid && (
        <span className={cn(
          "text-xs px-2 py-1 rounded-full flex-shrink-0",
          isOverdue
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        )}>
          {isOverdue ? "Vencido" : "Pendiente"}
        </span>
      )}
    </Link>
  )
}

// ─── Pay-All Sheet ─────────────────────────────────────────────────────────────

function PayAllSheet({
  distributions,
  onClose,
  onPaid,
}: {
  distributions: MyDistributionRow[]
  onClose: () => void
  onPaid: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  const totalPending = distributions.reduce(
    (sum, d) => sum + Math.round(Number(d.assigned_amount) - Number(d.paid_amount)),
    0
  )
  const distributionIds = distributions.map((d) => d.id)

  if (paid) {
    return (
      <div className="fixed inset-0 z-50 flex items-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full bg-card rounded-t-3xl max-w-lg mx-auto safe-bottom">
          <div className="px-5 pt-8 pb-10 text-center">
            <p className="text-5xl mb-4">✅</p>
            <h2 className="font-display text-3xl mb-2">¡Pago enviado!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Tu pago fue procesado correctamente. El estado se actualizará en breve.
            </p>
            <button
              onClick={onPaid}
              className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-display text-lg uppercase tracking-wide"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-card rounded-t-3xl max-w-lg mx-auto safe-bottom">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="px-5 pt-3 pb-8">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Pagar mi deuda</p>
          <h2 className="font-display text-3xl mb-5">{formatCLP(totalPending)}</h2>

          {/* Items breakdown */}
          <div className="space-y-2 mb-6">
            {distributions.map((d) => {
              const charge = d.charge
              if (!charge) return null
              const meta = CHARGE_META[charge.charge_type] ?? { icon: "📋", label: "Otro" }
              const remaining = Math.round(Number(d.assigned_amount) - Number(d.paid_amount))
              return (
                <div key={d.id} className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                  <span className="text-xl">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{charge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {charge.beneficiary_id && charge.beneficiary_name
                        ? `→ a ${charge.beneficiary_name}`
                        : "→ al equipo"}
                    </p>
                  </div>
                  <span className="font-display text-base flex-shrink-0 tabular-nums">
                    {formatCLP(remaining)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-1 mb-6 border-t border-border/30 pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl text-accent">{formatCLP(totalPending)}</span>
          </div>

          {error && (
            <p className="mb-4 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Fintoc — transferencia bancaria (Chile) */}
          <FintocPayButton
            distributionIds={distributionIds}
            totalCLP={totalPending}
            onSuccess={() => setPaid(true)}
            onError={(msg) => setError(msg)}
          />

          {/* Separador */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Apple Pay / Google Pay — Stripe */}
          <WalletPayButton
            distributionIds={distributionIds}
            totalCLP={totalPending}
            label={`LaPizarra · ${formatCLP(totalPending)}`}
            onSuccess={() => setPaid(true)}
            onError={(msg) => setError(msg)}
          />

          <p className="text-center text-[11px] text-muted-foreground/50 mt-3">
            Transferencia bancaria vía Fintoc · Tarjeta vía Stripe
          </p>
        </div>
      </div>
    </div>
  )
}

export function FinanceView({
  teamId,
  teamName,
  isAdmin,
  charges,
  myDistributions,
}: {
  teamId: string
  teamName: string
  isAdmin: boolean
  charges: TeamCharge[]
  myDistributions: MyDistributionRow[]
}) {
  const router = useRouter()
  const [showPayAll, setShowPayAll] = useState(false)

  const activeCharges = charges.filter((c) => c.status === "active" || c.status === "overdue")
  const completedCharges = charges.filter((c) => c.status === "completed")

  const myPending = myDistributions.filter((d) => d.status === "pending" || d.status === "partial")
  const myPaid = myDistributions.filter((d) => d.status === "paid")

  const totalPending = myPending.reduce(
    (sum, d) => sum + (Number(d.assigned_amount) - Number(d.paid_amount)),
    0
  )

  return (
    <>
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
            {teamName}
          </p>
          <h1 className="font-display text-3xl leading-tight">Finanzas</h1>
        </div>
        {isAdmin && (
          <Link
            href="/finance/new"
            className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-medium uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" />
            Nuevo cobro
          </Link>
        )}
      </header>

      {/* Player: summary card */}
      {!isAdmin && myPending.length > 0 && (
        <section className="bg-card border border-border/40 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Mis pendientes</span>
            </div>
          </div>
          <p className="font-display text-3xl mb-1">{formatCLP(totalPending)}</p>
          <p className="text-xs text-muted-foreground mb-4">
            {myPending.length} cobro{myPending.length > 1 ? "s" : ""} pendiente{myPending.length > 1 ? "s" : ""}
          </p>
          <button
            onClick={() => setShowPayAll(true)}
            className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-display text-base uppercase tracking-wide active:scale-[0.98] transition-transform"
          >
            Pagar todo · {formatCLP(totalPending)}
          </button>
        </section>
      )}

      {/* Admin: overview */}
      {isAdmin && activeCharges.length > 0 && (
        <section className="bg-card border border-border/40 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Cobros activos</p>
              <p className="font-display text-2xl">{activeCharges.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total activo</p>
              <p className="font-display text-2xl">
                {formatCLP(activeCharges.reduce((s, c) => s + Number(c.total_amount), 0))}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* My debts (player) */}
      {!isAdmin && (
        <>
          {myPending.length > 0 ? (
            <section className="mb-6">
              <h2 className="font-display text-lg mb-3">Mis pendientes</h2>
              <div className="space-y-3">
                {myPending.map((d) => (
                  <MyDebtCard key={d.id} dist={d} />
                ))}
              </div>
            </section>
          ) : (
            <section className="mb-6">
              <div className="bg-card rounded-xl p-8 text-center border border-border/40">
                <p className="text-3xl mb-3">✓</p>
                <p className="font-medium mb-1">Sin deudas pendientes</p>
                <p className="text-sm text-muted-foreground">Estás al día con el equipo</p>
              </div>
            </section>
          )}

          {myPaid.length > 0 && (
            <section className="mb-6">
              <h2 className="font-display text-lg mb-3 text-muted-foreground">Historial</h2>
              <div className="space-y-3">
                {myPaid.map((d) => (
                  <MyDebtCard key={d.id} dist={d} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Admin: all active charges */}
      {isAdmin && (
        <>
          {activeCharges.length > 0 ? (
            <section className="mb-6">
              <h2 className="font-display text-lg mb-3">Cobros activos</h2>
              <div className="space-y-3">
                {activeCharges.map((c) => (
                  <ChargeCard key={c.id} charge={c} href={`/finance/${c.id}/manage`} />
                ))}
              </div>
            </section>
          ) : (
            <section className="mb-6">
              <div className="bg-card rounded-xl p-8 text-center border border-border/40">
                <p className="text-3xl mb-3">💰</p>
                <p className="font-medium mb-1">Sin cobros activos</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea el primer cobro del equipo
                </p>
                <Link
                  href="/finance/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo cobro
                </Link>
              </div>
            </section>
          )}

          {completedCharges.length > 0 && (
            <section className="mb-6">
              <h2 className="font-display text-lg mb-3 text-muted-foreground">Completados</h2>
              <div className="space-y-3">
                {completedCharges.slice(0, 5).map((c) => (
                  <ChargeCard key={c.id} charge={c} href={`/finance/${c.id}/manage`} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>

    {/* Pay-all sheet */}
    {showPayAll && myPending.length > 0 && (
      <PayAllSheet
        distributions={myPending}
        onClose={() => setShowPayAll(false)}
        onPaid={() => { setShowPayAll(false); router.refresh() }}
      />
    )}
    </>
  )
}
