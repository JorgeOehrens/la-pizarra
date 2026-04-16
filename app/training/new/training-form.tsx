"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { logTrainingSession, type TrainingSessionType, type TrainingIntensity } from "../actions"

const SESSION_TYPES: { value: TrainingSessionType; icon: string; label: string }[] = [
  { value: "running",  icon: "🏃", label: "Running"   },
  { value: "gym",      icon: "💪", label: "Gimnasio"  },
  { value: "field",    icon: "⚽", label: "Campo"     },
  { value: "cycling",  icon: "🚴", label: "Ciclismo"  },
  { value: "other",    icon: "🎯", label: "Otro"      },
]

const INTENSITY_OPTIONS: {
  value: TrainingIntensity
  label: string
  desc: string
  color: string
}[] = [
  { value: "low",    label: "Baja",   desc: "Recuperación",  color: "#22c55e" },
  { value: "medium", label: "Media",  desc: "Ritmo cómodo",  color: "#f59e0b" },
  { value: "high",   label: "Alta",   desc: "Esfuerzo máx.", color: "#ef4444" },
]

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—"
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function TrainingForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [sessionType, setSessionType] = useState<TrainingSessionType | null>(null)
  const [title, setTitle] = useState("")
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0])
  const [durationHours, setDurationHours] = useState(0)
  const [durationMins, setDurationMins] = useState(30)
  const [distanceKm, setDistanceKm] = useState("")
  const [intensity, setIntensity] = useState<TrainingIntensity>("medium")
  const [calories, setCalories] = useState("")
  const [notes, setNotes] = useState("")

  const totalMinutes = durationHours * 60 + durationMins
  const showDistance = sessionType === "running" || sessionType === "cycling"

  function handleTypeChange(type: TrainingSessionType) {
    setSessionType(type)
    if (!title) setTitle(SESSION_TYPES.find((t) => t.value === type)?.label ?? "")
  }

  function handleSubmit() {
    if (!sessionType) { setError("Selecciona un tipo de sesión"); return }
    if (totalMinutes <= 0) { setError("La duración debe ser mayor a 0"); return }
    setError(null)

    startTransition(async () => {
      const result = await logTrainingSession({
        session_type: sessionType,
        title: title.trim() || null,
        session_date: sessionDate,
        duration_minutes: totalMinutes,
        distance_km: showDistance && distanceKm ? parseFloat(distanceKm) : null,
        calories: calories ? parseInt(calories) : null,
        intensity,
        notes: notes.trim() || null,
      })

      if ("error" in result) {
        setError(result.error)
        return
      }

      router.push("/training")
    })
  }

  return (
    <div className="px-4 pt-6 pb-12 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.08]"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-white/30 font-sans">
            Nueva sesión
          </p>
          <h1 className="font-display text-2xl text-white leading-tight">
            Registrar entrenamiento
          </h1>
        </div>
      </header>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-7">
        {/* Session type */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/30 font-sans mb-3">
            ¿Qué tipo de entrenamiento?
          </p>
          <div className="grid grid-cols-5 gap-2">
            {SESSION_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTypeChange(t.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
                  sessionType === t.value
                    ? "bg-[#D7FF00]/10 border-[#D7FF00]/60"
                    : "bg-white/[0.04] border-white/[0.07]"
                )}
              >
                <span className="text-xl leading-none">{t.icon}</span>
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  sessionType === t.value ? "text-[#D7FF00]" : "text-white/40"
                )}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-white/30 font-sans mb-2">
            Nombre{" "}
            <span className="normal-case text-white/20">(opcional)</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Fartlek 5km · Piernas"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D7FF00]/40 focus:bg-white/[0.06] transition-all font-sans"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-white/30 font-sans mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D7FF00]/40 transition-all font-sans"
          />
        </div>

        {/* Duration */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/30 font-sans mb-3">
            Duración
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Hours */}
            <div>
              <p className="text-[10px] text-white/25 text-center font-sans mb-2">Horas</p>
              <div className="flex items-center justify-between gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3">
                <button
                  onClick={() => setDurationHours((h) => Math.max(0, h - 1))}
                  className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5 text-white" />
                </button>
                <span className="font-display text-2xl text-white w-6 text-center">
                  {durationHours}
                </span>
                <button
                  onClick={() => setDurationHours((h) => Math.min(12, h + 1))}
                  className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
            {/* Minutes */}
            <div>
              <p className="text-[10px] text-white/25 text-center font-sans mb-2">Minutos</p>
              <div className="flex items-center justify-between gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-3">
                <button
                  onClick={() => setDurationMins((m) => Math.max(0, m - 5))}
                  className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5 text-white" />
                </button>
                <span className="font-display text-2xl text-white w-8 text-center">
                  {String(durationMins).padStart(2, "0")}
                </span>
                <button
                  onClick={() => setDurationMins((m) => Math.min(55, m + 5))}
                  className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/20 text-center mt-2 font-sans">
            Total: {formatDuration(totalMinutes)}
          </p>
        </div>

        {/* Distance — running / cycling only */}
        {showDistance && (
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-white/30 font-sans mb-2">
              Distancia{" "}
              <span className="normal-case text-white/20">(opcional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="0.0"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-14 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D7FF00]/40 transition-all font-sans"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 text-sm font-sans">
                km
              </span>
            </div>
          </div>
        )}

        {/* Intensity */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/30 font-sans mb-3">
            Intensidad
          </p>
          <div className="grid grid-cols-3 gap-2">
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setIntensity(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all"
                )}
                style={
                  intensity === opt.value
                    ? {
                        backgroundColor: opt.color + "14",
                        borderColor: opt.color + "50",
                      }
                    : {
                        backgroundColor: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.07)",
                      }
                }
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: intensity === opt.value ? opt.color : "rgba(255,255,255,0.5)" }}
                >
                  {opt.label}
                </span>
                <span
                  className="text-[10px] text-center leading-tight"
                  style={{ color: intensity === opt.value ? opt.color + "99" : "rgba(255,255,255,0.2)" }}
                >
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Calories (optional) */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-white/30 font-sans mb-2">
            Calorías{" "}
            <span className="normal-case text-white/20">(opcional)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-16 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D7FF00]/40 transition-all font-sans"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 text-sm font-sans">
              kcal
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-white/30 font-sans mb-2">
            Notas{" "}
            <span className="normal-case text-white/20">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Cómo te sentiste? ¿Algo a destacar?"
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D7FF00]/40 transition-all font-sans resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full py-4 bg-[#D7FF00] text-black rounded-xl font-display text-xl uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all"
        >
          {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
          {isPending ? "Guardando..." : "Guardar sesión"}
        </button>
      </div>
    </div>
  )
}
