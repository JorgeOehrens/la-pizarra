"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, X, ChevronRight } from "lucide-react"
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

const INTEGRATIONS = [
  {
    id: "adidas_running",
    name: "adidas running",
    tagline: "Sincroniza tus entrenamientos",
    icon: "👟",
    bg: "linear-gradient(145deg, #141414 0%, #000 100%)",
    borderColor: "rgba(0,163,108,0.25)",
    accentColor: "#00A36C",
    perks: ["Runs y caminatas", "Ritmo y cadencia", "Mapa de ruta", "Frecuencia cardíaca"],
    mockSessions: 8,
    mockKm: 42.3,
  },
  {
    id: "strava",
    name: "Strava",
    tagline: "Todas tus actividades",
    icon: "🔥",
    bg: "linear-gradient(145deg, #d44000 0%, #b33300 100%)",
    borderColor: "rgba(252,76,2,0.3)",
    accentColor: "#fff",
    perks: ["Runs, cycling y más", "Segmentos y KOMs", "Social y kudos", "Análisis avanzado"],
    mockSessions: 12,
    mockKm: 67.8,
  },
  {
    id: "nike_run",
    name: "Nike Run Club",
    tagline: "Corre con Nike",
    icon: "✔",
    bg: "linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%)",
    borderColor: "rgba(250,84,0,0.25)",
    accentColor: "#fa5400",
    perks: ["Runs guiados", "Planes de entrenamiento", "Logros Nike", "Desafíos grupales"],
    mockSessions: 5,
    mockKm: 28.1,
  },
  {
    id: "apple_health",
    name: "Apple Health",
    tagline: "Salud completa en un lugar",
    icon: "❤️",
    bg: "linear-gradient(145deg, #d42040 0%, #a81530 100%)",
    borderColor: "rgba(255,55,95,0.3)",
    accentColor: "#fff",
    perks: ["Pasos y calorías", "Frecuencia cardíaca", "Sueño y recuperación", "Todos los workouts"],
    mockSessions: 21,
    mockKm: 89.4,
  },
]

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

function IntegrationCard({
  integ,
  onTap,
}: {
  integ: typeof INTEGRATIONS[number]
  onTap: () => void
}) {
  return (
    <button
      onClick={onTap}
      className="flex-shrink-0 w-[176px] rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform"
      style={{ background: integ.bg, border: `1px solid ${integ.borderColor}` }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-5">
          <span className="text-2xl">{integ.icon}</span>
          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 text-white/50">
            Próx.
          </span>
        </div>
        <p className="font-display text-[28px] leading-none text-white">{integ.mockKm}</p>
        <p className="text-[10px] text-white/35 mt-0.5">km este mes</p>
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs font-medium text-white leading-none">{integ.name}</p>
          <div
            className="flex items-center gap-0.5 mt-1.5"
            style={{ color: integ.accentColor === "#fff" ? "rgba(255,255,255,0.45)" : integ.accentColor }}
          >
            <span className="text-[10px]">Conectar</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </button>
  )
}

function IntegrationSheet({
  integ,
  onClose,
}: {
  integ: typeof INTEGRATIONS[number]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-sm rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "85dvh" }}
      >
        {/* Brand banner */}
        <div
          className="px-5 pt-6 pb-5 flex-shrink-0"
          style={{ background: integ.bg, borderBottom: `1px solid ${integ.borderColor}` }}
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-3xl">{integ.icon}</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.35)" }}
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
          <h2 className="text-white font-display text-2xl leading-tight mb-0.5">
            {integ.name}
          </h2>
          <p style={{ color: integ.accentColor === "#fff" ? "rgba(255,255,255,0.45)" : integ.accentColor }}
             className="text-xs">
            {integ.tagline}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {/* Mock stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="font-display text-3xl text-white">{integ.mockSessions}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">sesiones</p>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="font-display text-3xl text-white">{integ.mockKm}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">km</p>
            </div>
          </div>

          {/* What syncs */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/25 mb-3">
              Al conectar, LaPizarra sincroniza:
            </p>
            <div className="space-y-2.5">
              {integ.perks.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      backgroundColor: integ.accentColor === "#fff"
                        ? "rgba(255,255,255,0.1)"
                        : integ.accentColor + "22",
                      color: integ.accentColor === "#fff" ? "rgba(255,255,255,0.6)" : integ.accentColor,
                    }}
                  >
                    ✓
                  </div>
                  <span className="text-sm text-white/55">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-white/[0.06]">
          <div className="relative">
            <button
              disabled
              className="w-full py-4 rounded-2xl font-display text-base uppercase tracking-wide flex items-center justify-center gap-2 opacity-25 cursor-not-allowed text-white"
              style={{ background: integ.bg, border: `1px solid ${integ.borderColor}` }}
            >
              <span className="text-lg">{integ.icon}</span>
              Conectar con {integ.name}
            </button>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="px-4 py-1.5 rounded-full text-xs border flex items-center gap-1.5"
                style={{
                  background: "#0e0e0e",
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D7FF00] inline-block animate-pulse" />
                Próximamente
              </span>
            </div>
          </div>
        </div>
      </div>
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
  const [activeInteg, setActiveInteg] = useState<typeof INTEGRATIONS[number] | null>(null)

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

      {/* ── Integrations ── */}
      <div className="mb-8">
        <div className="px-4 mb-3 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/25 font-sans">
            Integraciones
          </p>
          <span className="text-[9px] uppercase tracking-wider text-[#D7FF00]/60 px-2 py-0.5 rounded-full border border-[#D7FF00]/20">
            Próximamente
          </span>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto pb-2 no-scrollbar">
          {INTEGRATIONS.map((integ) => (
            <IntegrationCard
              key={integ.id}
              integ={integ}
              onTap={() => setActiveInteg(integ)}
            />
          ))}
        </div>
      </div>

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

      {/* ── Integration sheet ── */}
      {activeInteg && (
        <IntegrationSheet
          integ={activeInteg}
          onClose={() => setActiveInteg(null)}
        />
      )}
    </div>
  )
}
