"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { ChevronLeft, Loader2, X, CheckCircle2, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { confirmPayment, updateDistributionStatus, resetDistributionStatus, cancelCharge } from "../../actions"
import { useRouter } from "next/navigation"

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

export type DistributionWithMember = {
  id: string
  member_id: string
  display_name: string
  avatar_url: string | null
  assigned_amount: number
  paid_amount: number
  status: string
  notes: string | null
}

const CHARGE_META: Record<string, { icon: string; label: string }> = {
  cancha:       { icon: "🏟", label: "Cancha"       },
  cuota_liga:   { icon: "🏆", label: "Liga"         },
  asado:        { icon: "🍖", label: "Asado"        },
  indumentaria: { icon: "👕", label: "Indumentaria" },
  evento:       { icon: "🎉", label: "Evento"       },
  otro:         { icon: "📋", label: "Otro"         },
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:       { label: "Pendiente", color: "#f59e0b" },
  partial:       { label: "Parcial",   color: "#f97316" },
  paid:          { label: "Pagado",    color: "#D7FF00" },
  exempt:        { label: "Exento",    color: "#6b7280" },
  not_applicable:{ label: "No aplica", color: "#6b7280" },
}

function formatCLP(amount: number) {
  return `$${Math.round(amount).toLocaleString("es-CL")}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CL", {
    day: "numeric", month: "short",
  })
}

// ─── Confirm Payment Sheet ────────────────────────────────────────────────────

function ConfirmPaymentSheet({
  distribution,
  onClose,
  onConfirmed,
}: {
  distribution: DistributionWithMember
  onClose: () => void
  onConfirmed: () => void
}) {
  const remaining = distribution.assigned_amount - distribution.paid_amount
  const [isPartial, setIsPartial] = useState(false)
  const [partialAmount, setPartialAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const effectiveAmount = isPartial
    ? parseFloat(partialAmount) || 0
    : remaining

  function handleConfirm() {
    if (effectiveAmount <= 0) { setError("El monto debe ser mayor a 0"); return }
    if (isPartial && effectiveAmount > remaining) {
      setError(`El monto no puede superar ${formatCLP(remaining)}`)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await confirmPayment(distribution.id, effectiveAmount, notes)
      if ("error" in result) { setError(result.error); return }
      onConfirmed()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-card rounded-t-3xl max-w-lg mx-auto overflow-hidden safe-bottom">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="px-5 pt-3 pb-8">
          {/* Player header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-display text-xl text-black flex-shrink-0">
              {distribution.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Registrar pago
              </p>
              <h2 className="font-display text-xl leading-tight">{distribution.display_name}</h2>
            </div>
          </div>

          {/* Amount summary */}
          <div className="bg-accent/5 border border-accent/15 rounded-2xl p-4 mb-5">
            {distribution.assigned_amount !== remaining && (
              <>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Total asignado</span>
                  <span>{formatCLP(distribution.assigned_amount)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Ya pagó</span>
                  <span className="text-accent">{formatCLP(distribution.paid_amount)}</span>
                </div>
                <div className="h-px bg-accent/15 mb-3" />
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {distribution.paid_amount > 0 ? "Falta pagar" : "Debe pagar"}
              </span>
              <span className="font-display text-2xl text-accent">{formatCLP(remaining)}</span>
            </div>
          </div>

          {/* Full / partial toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => { setIsPartial(false); setPartialAmount("") }}
              className={cn(
                "py-3 rounded-xl text-sm font-medium border transition-all",
                !isPartial
                  ? "bg-accent text-black border-accent"
                  : "bg-muted/40 border-border/30 text-muted-foreground"
              )}
            >
              Monto completo
            </button>
            <button
              onClick={() => setIsPartial(true)}
              className={cn(
                "py-3 rounded-xl text-sm font-medium border transition-all",
                isPartial
                  ? "bg-card border-accent text-foreground"
                  : "bg-muted/40 border-border/30 text-muted-foreground"
              )}
            >
              Pago parcial
            </button>
          </div>

          {/* Partial amount input */}
          {isPartial && (
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                ¿Cuánto recibiste?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder={String(Math.round(remaining))}
                  className="w-full bg-background border border-border/40 rounded-xl pl-8 pr-4 py-3 text-xl font-display focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-5">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Método / nota{" "}
              <span className="normal-case text-muted-foreground/60">(opcional)</span>
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Transferencia, efectivo..."
              className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}

          {/* CTA */}
          <button
            onClick={handleConfirm}
            disabled={isPending || (isPartial && effectiveAmount <= 0)}
            className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-display text-xl uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {isPending
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : <CheckCircle2 className="h-5 w-5" />}
            {isPending
              ? "Registrando..."
              : `Confirmar ${formatCLP(effectiveAmount)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status Sheet ─────────────────────────────────────────────────────────────

function StatusSheet({
  distribution,
  onClose,
  onUpdated,
}: {
  distribution: DistributionWithMember
  onClose: () => void
  onUpdated: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const isPaid    = distribution.status === "paid" || distribution.status === "partial"
  const isSpecial = distribution.status === "exempt" || distribution.status === "not_applicable"
  const canSetSpecial = distribution.status === "pending" || distribution.status === "partial"

  function handleStatus(status: "exempt" | "not_applicable") {
    startTransition(async () => {
      await updateDistributionStatus(distribution.id, status)
      onUpdated()
    })
  }

  function handleReset() {
    startTransition(async () => {
      await resetDistributionStatus(distribution.id)
      onUpdated()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-card rounded-t-3xl p-6 max-w-lg mx-auto safe-bottom">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-full bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Opciones</p>
        <h2 className="font-display text-xl mb-5">{distribution.display_name}</h2>

        <div className="space-y-2">
          {/* Reset to pending — for paid / partial / exempt / not_applicable */}
          {(isPaid || isSpecial) && (
            <button
              onClick={handleReset}
              disabled={isPending}
              className="w-full p-4 bg-card border border-border/40 rounded-xl text-left flex items-start gap-3 active:bg-muted/40 transition-colors disabled:opacity-60"
            >
              <span className="text-xl">↩️</span>
              <div>
                <p className="text-sm font-medium">Restablecer a pendiente</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPaid
                    ? "Anula el pago registrado y vuelve a pendiente"
                    : "Quita la exención y vuelve a pendiente"}
                </p>
              </div>
            </button>
          )}

          {/* Exempt / not_applicable — only for pending or partial */}
          {canSetSpecial && (
            <>
              <button
                onClick={() => handleStatus("exempt")}
                disabled={isPending}
                className="w-full p-4 bg-card border border-border/40 rounded-xl text-left flex items-start gap-3 active:bg-muted/40 transition-colors disabled:opacity-60"
              >
                <span className="text-xl">🎟</span>
                <div>
                  <p className="text-sm font-medium">Exento</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    No debe pagar (becado o acuerdo especial)
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleStatus("not_applicable")}
                disabled={isPending}
                className="w-full p-4 bg-card border border-border/40 rounded-xl text-left flex items-start gap-3 active:bg-muted/40 transition-colors disabled:opacity-60"
              >
                <span className="text-xl">🚫</span>
                <div>
                  <p className="text-sm font-medium">No aplica</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    No corresponde a este jugador (no participó, etc.)
                  </p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Player Row ───────────────────────────────────────────────────────────────

function PlayerRow({
  d,
  isActive,
  onPay,
  onOptions,
}: {
  d: DistributionWithMember
  isActive: boolean
  onPay: () => void
  onOptions: () => void
}) {
  const sm         = STATUS_META[d.status]  ?? STATUS_META.pending
  const remaining  = d.assigned_amount - d.paid_amount
  const isActionable   = isActive && (d.status === "pending" || d.status === "partial")
  const canChangeStatus = isActive
  const isPaid     = d.status === "paid"
  const isNeutral  = d.status === "exempt" || d.status === "not_applicable"

  return (
    <div
      className={cn(
        "bg-card border rounded-2xl overflow-hidden transition-colors",
        isPaid    && "border-[#D7FF00]/20",
        isNeutral && "border-border/20 opacity-60",
        !isPaid && !isNeutral && "border-border/40"
      )}
    >
      {/* Top: avatar + name + amount + options */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-display text-base flex-shrink-0",
            isPaid ? "bg-[#D7FF00]/15 text-[#D7FF00]" : "bg-muted text-foreground"
          )}
        >
          {d.display_name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{d.display_name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="text-[11px] font-medium"
              style={{ color: sm.color }}
            >
              {sm.label}
            </span>
            {d.status === "partial" && (
              <span className="text-[11px] text-muted-foreground">
                · pagó {formatCLP(d.paid_amount)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {d.status !== "not_applicable" && (
            <span className={cn(
              "text-sm font-medium tabular-nums",
              isPaid ? "text-[#D7FF00]" : "text-foreground"
            )}>
              {isPaid
                ? formatCLP(d.assigned_amount)
                : d.status === "partial"
                  ? formatCLP(remaining)
                  : formatCLP(d.assigned_amount)}
              {isPaid && " ✓"}
            </span>
          )}
          {canChangeStatus && (
            <button
              onClick={onOptions}
              className="p-1.5 rounded-lg bg-muted hover:bg-muted/60 transition-colors"
              title="Más opciones"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Pay button — separated at bottom */}
      {isActionable && (
        <button
          onClick={onPay}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent/8 border-t border-accent/20 text-accent text-sm font-medium active:bg-accent/15 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          {d.status === "partial"
            ? `Registrar pago · falta ${formatCLP(remaining)}`
            : `Registrar pago · ${formatCLP(d.assigned_amount)}`}
        </button>
      )}
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ManageChargeView({
  charge,
  distributions,
  beneficiaryName,
  summary,
}: {
  charge: Charge
  distributions: DistributionWithMember[]
  beneficiaryName: string | null
  summary: { total: number; paid: number; pending: number; collected: number }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmTarget, setConfirmTarget] = useState<DistributionWithMember | null>(null)
  const [statusTarget,  setStatusTarget]  = useState<DistributionWithMember | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const meta     = CHARGE_META[charge.charge_type] ?? { icon: "📋", label: "Otro" }
  const progress = summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0
  const isActive = charge.status === "active" || charge.status === "overdue"

  const sortedDists = [...distributions].sort((a, b) => {
    const order: Record<string, number> = {
      pending: 0, partial: 1, paid: 2, exempt: 3, not_applicable: 4,
    }
    return (order[a.status] ?? 5) - (order[b.status] ?? 5)
  })

  function handleCancel() {
    startTransition(async () => {
      await cancelCharge(charge.id)
      router.push("/finance")
    })
  }

  return (
    <>
      <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <Link href="/finance" className="p-2 rounded-lg bg-card border border-border">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
              {meta.label}
              {charge.due_date && ` · Vence ${formatDate(charge.due_date)}`}
            </p>
            <h1 className="font-display text-2xl leading-tight truncate">{charge.name}</h1>
          </div>
        </header>

        {/* Summary card */}
        <section className="bg-card border border-border/40 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total cobro</p>
              <p className="font-display text-3xl">{formatCLP(charge.total_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Recaudado</p>
              <p className="font-display text-3xl text-accent">{formatCLP(summary.collected)}</p>
            </div>
          </div>

          <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress === 100 ? "bg-accent" : "bg-accent/60"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {summary.paid}/{summary.total} pagaron
              {progress > 0 && <span className="ml-1 text-accent font-medium">({progress}%)</span>}
            </span>
            <span>
              {summary.pending} pendiente{summary.pending !== 1 ? "s" : ""}
            </span>
          </div>

          {beneficiaryName && (
            <div className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground">
              💡 El dinero va a{" "}
              <strong className="text-foreground">{beneficiaryName}</strong>
            </div>
          )}
        </section>

        {/* Player list */}
        <section className="mb-6">
          <h2 className="font-display text-lg mb-3">Jugadores</h2>
          <div className="space-y-2">
            {sortedDists.map((d) => (
              <PlayerRow
                key={d.id}
                d={d}
                isActive={isActive}
                onPay={() => setConfirmTarget(d)}
                onOptions={() => setStatusTarget(d)}
              />
            ))}
          </div>
        </section>

        {/* Cancel */}
        {isActive && (
          <div>
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-3 border border-border/40 rounded-xl text-sm text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
              >
                Cancelar cobro
              </button>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
                <p className="text-sm font-medium mb-1">¿Cancelar este cobro?</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Los jugadores ya no verán este cobro. No se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-2.5 bg-card border border-border rounded-xl text-sm"
                  >
                    No cancelar
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="flex-1 py-2.5 bg-destructive text-white rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                    Sí, cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sheets */}
      {confirmTarget && (
        <ConfirmPaymentSheet
          distribution={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirmed={() => { setConfirmTarget(null); router.refresh() }}
        />
      )}
      {statusTarget && (
        <StatusSheet
          distribution={statusTarget}
          onClose={() => setStatusTarget(null)}
          onUpdated={() => { setStatusTarget(null); router.refresh() }}
        />
      )}
    </>
  )
}
