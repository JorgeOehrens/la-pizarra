"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export type TrainingSession = {
  id: string
  session_type: string
  title: string | null
  session_date: string
  duration_minutes: number | null
  distance_km: number | null
  calories: number | null
  intensity: string | null
  source: string
  notes: string | null
}

// ─── Static metadata ──────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: string; label: string }> = {
  running:  { icon: "🏃", label: "Running"  },
  gym:      { icon: "💪", label: "Gimnasio" },
  field:    { icon: "⚽", label: "Campo"    },
  cycling:  { icon: "🚴", label: "Ciclismo" },
  other:    { icon: "🎯", label: "Otro"     },
}

const INTENSITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: "Baja",   color: "#22c55e" },
  medium: { label: "Media",  color: "#f59e0b" },
  high:   { label: "Alta",   color: "#ef4444" },
}

const SOURCE_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  adidas_running: { label: "adidas",  bg: "#000",     fg: "#00A36C" },
  strava:         { label: "Strava",  bg: "#FC4C02",  fg: "#fff"    },
  nike_run:       { label: "Nike",    bg: "#111",     fg: "#fa5400" },
  apple_health:   { label: "Health",  bg: "#FF375F",  fg: "#fff"    },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(dateStr: string): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayStr = today.toISOString().split("T")[0]
  const yestStr  = yesterday.toISOString().split("T")[0]

  if (dateStr === todayStr) return "Hoy"
  if (dateStr === yestStr)  return "Ayer"

  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CL", {
    weekday: "short", day: "numeric", month: "short",
  })
}

function getWeekLabel(): string {
  const now   = new Date()
  const month = now.toLocaleDateString("es-CL", { month: "long" })
  const week  = Math.ceil(now.getDate() / 7)
  return `Semana ${week} · ${month.charAt(0).toUpperCase() + month.slice(1)} ${now.getFullYear()}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, unit, sub }: { value: string | number; unit: string; sub: string }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center flex flex-col justify-center min-h-[90px]">
      <p className="font-display text-[30px] leading-none text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-[#D7FF00] mt-1">{unit}</p>
      <p className="text-[9px] text-white/20 mt-0.5">{sub}</p>
    </div>
  )
}

function SessionCard({ session }: { session: TrainingSession }) {
  const meta      = TYPE_META[session.session_type]     ?? TYPE_META.other
  const intensity = session.intensity
    ? INTENSITY_META[session.intensity as keyof typeof INTENSITY_META]
    : null
  const sourceBadge = session.source !== "manual"
    ? SOURCE_BADGE[session.source]
    : null

  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl flex-shrink-0">
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-medium text-sm truncate">
              {session.title || meta.label}
            </h3>
            {sourceBadge && (
              <span
                className="flex-shrink-0 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: sourceBadge.bg, color: sourceBadge.fg }}
              >
                {sourceBadge.label}
              </span>
            )}
          </div>
          <p className="text-white/30 text-xs mt-0.5">{formatDate(session.session_date)}</p>
          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            {session.duration_minutes != null && (
              <span className="text-xs text-white/45">
                ⏱ {formatDuration(session.duration_minutes)}
              </span>
            )}
            {session.distance_km != null && Number(session.distance_km) > 0 && (
              <span className="text-xs text-white/45">
                📍 {Number(session.distance_km).toFixed(1)} km
              </span>
            )}
            {session.calories != null && session.calories > 0 && (
              <span className="text-xs text-white/45">
                🔥 {session.calories} kcal
              </span>
            )}
            {intensity && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: intensity.color + "18",
                  color: intensity.color,
                }}
              >
                {intensity.label}
              </span>
            )}
          </div>
          {session.notes && (
            <p className="text-white/25 text-xs mt-2 line-clamp-1">{session.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────

type FilterType = "all" | "running" | "gym" | "field" | "cycling" | "other"

const FILTERS: { key: FilterType; icon: string; label: string }[] = [
  { key: "all",     icon: "",   label: "Todos"   },
  { key: "running", icon: "🏃", label: "Running" },
  { key: "gym",     icon: "💪", label: "Gym"     },
  { key: "field",   icon: "⚽", label: "Campo"   },
  { key: "cycling", icon: "🚴", label: "Cycling" },
]

export function TrainingView({
  sessions,
  thisWeek,
  allTime,
}: {
  sessions: TrainingSession[]
  thisWeek: { sessions: number; duration: number; distance: number }
  allTime:  { sessions: number; distance: number }
}) {
  const [filter, setFilter] = useState<FilterType>("all")

  const filtered = filter === "all"
    ? sessions
    : sessions.filter((s) => s.session_type === filter)

  const weekDuration = thisWeek.duration > 0 ? formatDuration(thisWeek.duration) : "—"
  const weekDist     = thisWeek.distance  > 0 ? `${thisWeek.distance}` : "—"

  return (
    <div className="pb-32">
      {/* ── Header ── */}
      <div className="px-4 pt-8 pb-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/30 mb-3 font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D7FF00] inline-block animate-pulse" />
          {getWeekLabel()}
        </div>
        <h1 className="font-display text-[52px] leading-none text-white">ENTRENA</h1>
        <h1 className="font-display text-[52px] leading-none text-[#D7FF00] -mt-2">MIENTOS</h1>
      </div>

      {/* ── This week stats ── */}
      <div className="px-4 mt-6 mb-8">
        <p className="text-[11px] uppercase tracking-[0.12em] text-white/25 font-sans mb-3">Esta semana</p>
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard value={thisWeek.sessions} unit="sesiones" sub="esta semana" />
          <StatCard value={weekDist} unit="km" sub="recorridos" />
          <StatCard value={weekDuration} unit="tiempo" sub="activo" />
        </div>
      </div>

      {/* ── All-time strip ── */}
      {allTime.sessions > 0 && (
        <div className="mx-4 mb-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#D7FF00] text-lg">⚡</span>
            <div>
              <p className="text-white text-sm font-medium">{allTime.sessions} sesiones registradas</p>
              {allTime.distance > 0 && (
                <p className="text-white/30 text-xs mt-0.5">{allTime.distance} km en total</p>
              )}
            </div>
          </div>
          <Link
            href="/training/new"
            className="text-[11px] uppercase tracking-wider text-[#D7FF00] flex items-center gap-0.5"
          >
            + Nueva
          </Link>
        </div>
      )}

      {/* ── History ── */}
      <div className="px-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-white/25 font-sans mb-4">
          Historial {filtered.length > 0 && `· ${filtered.length}`}
        </p>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                filter === f.key
                  ? "bg-[#D7FF00] text-black"
                  : "bg-white/[0.05] text-white/40 border border-white/[0.07]"
              )}
            >
              {f.icon && <span className="text-sm leading-none">{f.icon}</span>}
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">
              {filter === "all" ? "🏋️" : TYPE_META[filter]?.icon ?? "🏋️"}
            </p>
            <p className="text-white/20 text-sm font-sans">
              {filter === "all"
                ? "Aún no hay sesiones registradas"
                : `Sin sesiones de ${TYPE_META[filter]?.label ?? filter}`}
            </p>
            <Link
              href="/training/new"
              className="inline-flex items-center gap-1 mt-4 text-sm text-[#D7FF00]"
            >
              Registrar primera sesión →
            </Link>
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <Link
        href="/training/new"
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#D7FF00] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(215,255,0,0.25)] active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
      </Link>
    </div>
  )
}
