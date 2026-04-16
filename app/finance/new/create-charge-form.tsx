"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { createCharge, type ChargeType, type DistributionType, type DistributionStatus } from "../actions"

export type TeamMember = {
  id: string
  membership_id: string
  display_name: string
  jersey_number: number | null
  role: "admin" | "player"
}

export type RecentMatch = {
  id: string
  opponent: string
  date: string
  status: string
}

const CHARGE_TYPES: { value: ChargeType; icon: string; label: string }[] = [
  { value: "cancha", icon: "🏟", label: "Cancha" },
  { value: "cuota_liga", icon: "🏆", label: "Liga" },
  { value: "asado", icon: "🍖", label: "Asado" },
  { value: "indumentaria", icon: "👕", label: "Polera" },
  { value: "evento", icon: "🎉", label: "Evento" },
  { value: "otro", icon: "📋", label: "Otro" },
]

const FREQ_OPTIONS = [
  { value: "weekly" as const, label: "Semanal" },
  { value: "biweekly" as const, label: "Quincenal" },
  { value: "monthly" as const, label: "Mensual" },
]

type Step = 1 | 2 | 3

type MemberRow = {
  id: string
  display_name: string
  jersey_number: number | null
  included: boolean
  isBeneficiary: boolean
  amount: string
}

function formatCLP(amount: number) {
  return `$${Math.round(amount).toLocaleString("es-CL")}`
}

function formatMatchDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" })
}

function formatReviewDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" })
}

export function CreateChargeForm({
  teamId,
  members,
  currentUserId,
  recentMatches = [],
}: {
  teamId: string
  members: TeamMember[]
  currentUserId: string
  recentMatches?: RecentMatch[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Step
  const [step, setStep] = useState<Step>(1)

  // Step 1 fields
  const [chargeType, setChargeType] = useState<ChargeType | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [hasBeneficiary, setHasBeneficiary] = useState(false)
  const [beneficiaryId, setBeneficiaryId] = useState("")

  // Installments
  const [hasInstallments, setHasInstallments] = useState(false)
  const [installmentCount, setInstallmentCount] = useState(6)
  const [installmentFreq, setInstallmentFreq] = useState<"weekly" | "biweekly" | "monthly">("monthly")
  const [installmentStart, setInstallmentStart] = useState("")

  // Match link (for cancha)
  const [matchId, setMatchId] = useState<string | null>(null)

  // Step 2 fields
  const [distributionType, setDistributionType] = useState<DistributionType>("equal")
  const [rows, setRows] = useState<MemberRow[]>(() =>
    members.map((m) => ({
      id: m.id,
      display_name: m.display_name,
      jersey_number: m.jersey_number,
      included: true,
      isBeneficiary: false,
      amount: "",
    }))
  )

  const seriesTotal = parseFloat(totalAmount.replace(/\./g, "").replace(",", ".")) || 0
  const distTarget = hasInstallments && installmentCount > 1
    ? Math.round((seriesTotal / installmentCount) * 100) / 100
    : seriesTotal

  function applyEqual(currentRows: MemberRow[]): MemberRow[] {
    const billable = currentRows.filter((r) => r.included && !r.isBeneficiary)
    if (billable.length === 0 || distTarget === 0) return currentRows
    const base = Math.floor((distTarget / billable.length) * 100) / 100
    const remainder = +(distTarget - base * billable.length).toFixed(2)
    let first = true
    return currentRows.map((r) => {
      if (!r.included || r.isBeneficiary) return { ...r, amount: "0" }
      const amt = first ? base + remainder : base
      first = false
      return { ...r, amount: String(amt) }
    })
  }

  function handleDistributionTypeChange(type: DistributionType) {
    setDistributionType(type)
    if (type === "equal" && distTarget > 0) {
      setRows((prev) => applyEqual(prev))
    }
  }

  function handleToggleMember(id: string) {
    setRows((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, included: !r.included } : r
      )
      return distributionType === "equal" ? applyEqual(updated) : updated
    })
  }

  function handleBeneficiaryChange(id: string) {
    setBeneficiaryId(id)
    setRows((prev) => {
      const updated = prev.map((r) => ({
        ...r,
        isBeneficiary: r.id === id,
        amount: r.id === id ? "0" : r.amount,
      }))
      return distributionType === "equal" ? applyEqual(updated) : updated
    })
  }

  function handleAmountChange(id: string, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, amount: value } : r))
    )
  }

  const distributedTotal = rows
    .filter((r) => r.included && !r.isBeneficiary)
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)

  const isBalanced = distTarget > 0 && Math.abs(distributedTotal - distTarget) <= 0.05

  function goToStep2() {
    if (!chargeType) { setError("Selecciona un tipo de cobro"); return }
    if (!name.trim()) { setError("El nombre es obligatorio"); return }
    if (!totalAmount || seriesTotal <= 0) { setError("El monto debe ser mayor a 0"); return }
    setError(null)
    if (distributionType === "equal") {
      setRows((prev) => applyEqual(prev))
    }
    setStep(2)
  }

  function goToStep3() {
    if (!isBalanced) {
      setError(`El total distribuido (${formatCLP(distributedTotal)}) no coincide con el monto (${formatCLP(distTarget)})`)
      return
    }
    setError(null)
    setStep(3)
  }

  function handleSubmit() {
    if (!chargeType) return
    setError(null)

    startTransition(async () => {
      const distributions = rows
        .filter((r) => r.included)
        .map((r) => {
          const amt = r.isBeneficiary ? 0 : parseFloat(r.amount) || 0
          return {
            member_id: r.id,
            assigned_amount: amt,
            percentage: distTarget > 0 && !r.isBeneficiary ? +((amt / distTarget) * 100).toFixed(2) : null,
            status: (r.isBeneficiary ? "not_applicable" : "pending") as DistributionStatus,
          }
        })

      const isSeries = hasInstallments && installmentCount > 1

      const result = await createCharge({
        name: name.trim(),
        description: description.trim(),
        charge_type: chargeType,
        total_amount: distTarget,
        distribution_type: distributionType,
        beneficiary_id: hasBeneficiary && beneficiaryId ? beneficiaryId : null,
        due_date: isSeries ? null : (dueDate || null),
        distributions,
        match_id: matchId || null,
        installments: isSeries
          ? {
              count: installmentCount,
              frequency: installmentFreq,
              start_date: installmentStart || new Date().toISOString().split("T")[0],
            }
          : undefined,
      })

      if ("error" in result) {
        setError(result.error)
        return
      }

      if (isSeries) {
        router.push("/finance")
      } else {
        router.push(`/finance/${result.chargeId}/manage`)
      }
    })
  }

  const freqLabel = installmentFreq === "weekly" ? "semanal" : installmentFreq === "biweekly" ? "quincenal" : "mensual"

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}
          className="p-2 rounded-lg bg-card border border-border"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Paso {step} de 3
          </p>
          <h1 className="font-display text-2xl leading-tight">
            {step === 1 ? "Nuevo cobro" : step === 2 ? "Distribución" : "Confirmar"}
          </h1>
        </div>
      </header>

      {/* Step indicator */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= s ? "bg-accent" : "bg-muted"
            )}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ─── STEP 1: Tipo + Detalles ─── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Type selector */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              ¿Qué tipo de cobro es?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CHARGE_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setChargeType(t.value)
                    if (!name) setName(t.label)
                    if (t.value !== "cancha") setMatchId(null)
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors",
                    chargeType === t.value
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-card border-border/40 text-foreground"
                  )}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Nombre del cobro
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cancha 15 Mayo"
              className="w-full bg-card border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {hasInstallments ? "Monto total de la serie" : "Monto total"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <input
                type="number"
                inputMode="numeric"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="20000"
                className="w-full bg-card border border-border/40 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Due date (single charge only) */}
          {!hasInstallments && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Fecha límite <span className="normal-case text-muted-foreground/60">(opcional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-card border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}

          {/* Installments */}
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pago en cuotas</p>
                <p className="text-xs text-muted-foreground mt-0.5">Dividir en pagos periódicos</p>
              </div>
              <button
                onClick={() => setHasInstallments((v) => !v)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  hasInstallments ? "bg-accent" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    hasInstallments ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {hasInstallments && (
              <div className="mt-4 space-y-4">
                {/* Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Número de cuotas</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInstallmentCount((c) => Math.max(2, c - 1))}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-display text-xl w-6 text-center">{installmentCount}</span>
                    <button
                      onClick={() => setInstallmentCount((c) => Math.min(24, c + 1))}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Frecuencia</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FREQ_OPTIONS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setInstallmentFreq(f.value)}
                        className={cn(
                          "py-2 rounded-lg border text-xs font-medium transition-colors",
                          installmentFreq === f.value
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border/40 bg-background"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start date */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Primera cuota</label>
                  <input
                    type="date"
                    value={installmentStart}
                    onChange={(e) => setInstallmentStart(e.target.value)}
                    className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Preview */}
                {seriesTotal > 0 && (
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                    <p className="text-sm font-medium">
                      {installmentCount} cuotas de{" "}
                      <span className="text-accent">{formatCLP(Math.round(seriesTotal / installmentCount))}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {freqLabel} · {formatCLP(seriesTotal)} en total
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Match selector for cancha */}
          {chargeType === "cancha" && recentMatches.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Partido <span className="normal-case text-muted-foreground/60">(opcional)</span>
              </label>
              <select
                value={matchId ?? ""}
                onChange={(e) => setMatchId(e.target.value || null)}
                className="w-full bg-card border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Sin vincular a partido</option>
                {recentMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    vs {m.opponent} · {formatMatchDate(m.date)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Descripción <span className="normal-case text-muted-foreground/60">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del cobro..."
              rows={2}
              className="w-full bg-card border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          {/* Beneficiary */}
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">¿Alguien pagó el total?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  El resto le debe reembolsar a esa persona
                </p>
              </div>
              <button
                onClick={() => {
                  setHasBeneficiary((v) => !v)
                  if (hasBeneficiary) setBeneficiaryId("")
                }}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  hasBeneficiary ? "bg-accent" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    hasBeneficiary ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            {hasBeneficiary && (
              <div className="mt-4 space-y-2">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleBeneficiaryChange(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                      beneficiaryId === m.id
                        ? "bg-accent/10 border-accent"
                        : "bg-background border-border/30"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {m.jersey_number ?? "—"}
                    </div>
                    <span className="text-sm">{m.display_name}</span>
                    {beneficiaryId === m.id && (
                      <span className="ml-auto text-accent text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={goToStep2}
            className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-medium uppercase tracking-wider"
          >
            Siguiente → Distribución
          </button>
        </div>
      )}

      {/* ─── STEP 2: Distribución ─── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-card border border-border/40 rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{name}</p>
            {hasInstallments && installmentCount > 1 ? (
              <>
                <p className="font-display text-2xl">{formatCLP(distTarget)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  por cuota · {installmentCount} cuotas · {formatCLP(seriesTotal)} total
                </p>
              </>
            ) : (
              <p className="font-display text-2xl">{formatCLP(seriesTotal)}</p>
            )}
          </div>

          {/* Distribution type */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">¿Cómo se reparte?</p>
            <div className="space-y-2">
              {(
                [
                  { value: "equal" as DistributionType, label: "Partes iguales", desc: "Todos pagan lo mismo" },
                  { value: "fixed_amount" as DistributionType, label: "Monto fijo", desc: "Asigna un monto distinto a cada uno" },
                  { value: "custom" as DistributionType, label: "Personalizado", desc: "Porcentaje o monto personalizado" },
                ] as const
              ).map((dt) => (
                <button
                  key={dt.value}
                  onClick={() => handleDistributionTypeChange(dt.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors",
                    distributionType === dt.value
                      ? "bg-accent/10 border-accent"
                      : "bg-card border-border/40"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0",
                    distributionType === dt.value ? "border-accent bg-accent" : "border-muted-foreground"
                  )} />
                  <div>
                    <p className="text-sm font-medium">{dt.label}</p>
                    <p className="text-xs text-muted-foreground">{dt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Member rows */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Jugadores</p>
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 bg-card border rounded-xl p-3 transition-opacity",
                    !r.included && "opacity-40",
                    r.isBeneficiary && "border-accent/30 bg-accent/5",
                    !r.isBeneficiary && (r.included ? "border-border/40" : "border-border/20")
                  )}
                >
                  <button
                    onClick={() => handleToggleMember(r.id)}
                    disabled={r.isBeneficiary}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center",
                      r.included || r.isBeneficiary ? "bg-accent border-accent" : "border-muted-foreground"
                    )}
                  >
                    {(r.included || r.isBeneficiary) && (
                      <span className="text-accent-foreground text-xs">✓</span>
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {r.jersey_number ?? "—"}
                  </div>

                  <span className="flex-1 text-sm truncate">
                    {r.display_name}
                    {r.isBeneficiary && (
                      <span className="ml-2 text-[10px] text-accent uppercase tracking-wider">
                        pagó el total
                      </span>
                    )}
                  </span>

                  {r.included && !r.isBeneficiary ? (
                    distributionType === "equal" ? (
                      <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                        {formatCLP(parseFloat(r.amount) || 0)}
                      </span>
                    ) : (
                      <div className="relative flex-shrink-0 w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={r.amount}
                          onChange={(e) => handleAmountChange(r.id, e.target.value)}
                          placeholder="0"
                          className="w-full bg-background border border-border/40 rounded-lg pl-6 pr-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    )
                  ) : r.isBeneficiary ? (
                    <span className="text-xs text-muted-foreground flex-shrink-0">$0</span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex-shrink-0">excluido</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total validation */}
          <div className={cn(
            "flex items-center justify-between px-4 py-3 rounded-xl text-sm",
            isBalanced ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
          )}>
            <span>Total distribuido</span>
            <span className="font-display text-base">
              {formatCLP(distributedTotal)} / {formatCLP(distTarget)}
              {isBalanced ? " ✓" : ""}
            </span>
          </div>

          <button
            onClick={goToStep3}
            className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-medium uppercase tracking-wider"
          >
            Siguiente → Revisar
          </button>
        </div>
      )}

      {/* ─── STEP 3: Review + Submit ─── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Series info banner */}
          {hasInstallments && installmentCount > 1 && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
              <p className="text-sm font-medium">
                {installmentCount} cuotas de {formatCLP(distTarget)} · {formatCLP(seriesTotal)} total
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {freqLabel} · primera cuota{" "}
                {installmentStart ? formatReviewDate(installmentStart) : "hoy"}
              </p>
            </div>
          )}

          <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border/40">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">
                  {CHARGE_TYPES.find((t) => t.value === chargeType)?.icon ?? "📋"}
                </span>
                <div>
                  <h2 className="font-medium">{name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {CHARGE_TYPES.find((t) => t.value === chargeType)?.label}
                    {!hasInstallments && dueDate &&
                      ` · Vence ${new Date(dueDate + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`}
                    {matchId && recentMatches.find((m) => m.id === matchId) &&
                      ` · vs ${recentMatches.find((m) => m.id === matchId)!.opponent}`}
                  </p>
                </div>
              </div>
              <p className="font-display text-3xl">{formatCLP(distTarget)}</p>
              {hasInstallments && (
                <p className="text-xs text-muted-foreground mt-0.5">por cuota</p>
              )}
            </div>

            <div className="divide-y divide-border/30">
              {rows.filter((r) => r.included).map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm">
                    {r.display_name}
                    {r.isBeneficiary && (
                      <span className="ml-2 text-[10px] text-muted-foreground uppercase">pagó</span>
                    )}
                  </span>
                  <span className={cn("text-sm font-medium", r.isBeneficiary && "text-muted-foreground")}>
                    {r.isBeneficiary ? "$0" : formatCLP(parseFloat(r.amount) || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {description && (
            <p className="text-sm text-muted-foreground px-1">{description}</p>
          )}

          {hasBeneficiary && beneficiaryId && (
            <div className="bg-card border border-border/40 rounded-xl px-4 py-3 text-sm">
              💡 El dinero debe llegar a{" "}
              <strong>{members.find((m) => m.id === beneficiaryId)?.display_name}</strong>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-medium uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending
              ? "Creando cobro..."
              : hasInstallments && installmentCount > 1
              ? `Crear ${installmentCount} cuotas`
              : "Crear cobro"}
          </button>
        </div>
      )}
    </div>
  )
}
