"use client"

import { useState, useTransition } from "react"
import { Search, X, Loader2, LogIn, UserPlus, Clock, Lock } from "lucide-react"
import Image from "next/image"
import { directJoin, requestJoin, enterTeam } from "./actions"

export type PublicTeam = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  join_mode: "open" | "request" | "invite_only"
  member_count: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  is_member: boolean
  role?: "admin" | "player"
  has_pending_request: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function winRateToStars(wins: number, played: number): number {
  if (played === 0) return 2
  return Math.max(1, Math.min(5, Math.round((wins / played) * 5)))
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55
}

// ─── FIFA Card ────────────────────────────────────────────────────────────────

function TeamCard({
  team,
  index,
  actioningId,
  onAction,
}: {
  team: PublicTeam
  index: number
  actioningId: string | null
  onAction: (team: PublicTeam, type: "enter" | "join" | "request") => void
}) {
  const bg = team.primary_color || "#1a3a5c"
  const lightBg = isLight(bg)
  const textColor = lightBg ? "#000000" : "#ffffff"
  const dimColor = lightBg ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)"
  const overlayColor = lightBg ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.25)"
  const stars = winRateToStars(team.wins, team.matches_played)
  const isActioning = actioningId === team.id

  // ── CTA config ──
  let ctaLabel = ""
  let ctaIcon = <UserPlus className="w-3.5 h-3.5" />
  let ctaType: "enter" | "join" | "request" | null = null
  let ctaDisabled = false
  let ctaStyle: React.CSSProperties = {}

  if (team.is_member) {
    ctaLabel = "ENTRAR"
    ctaIcon = <LogIn className="w-3.5 h-3.5" />
    ctaType = "enter"
    ctaStyle = { backgroundColor: "#D7FF00", color: "#000" }
  } else if (team.has_pending_request) {
    ctaLabel = "SOLICITADO"
    ctaIcon = <Clock className="w-3.5 h-3.5" />
    ctaDisabled = true
    ctaStyle = { backgroundColor: overlayColor, color: dimColor }
  } else if (team.join_mode === "open") {
    ctaLabel = "UNIRSE"
    ctaIcon = <UserPlus className="w-3.5 h-3.5" />
    ctaType = "join"
    ctaStyle = { backgroundColor: "#D7FF00", color: "#000" }
  } else if (team.join_mode === "request") {
    ctaLabel = "SOLICITAR"
    ctaIcon = <UserPlus className="w-3.5 h-3.5" />
    ctaType = "request"
    ctaStyle = { backgroundColor: overlayColor, color: textColor, border: `1px solid ${lightBg ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)"}` }
  } else {
    ctaLabel = "SOLO INVITACIÓN"
    ctaIcon = <Lock className="w-3.5 h-3.5" />
    ctaDisabled = true
    ctaStyle = { backgroundColor: overlayColor, color: dimColor }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        animation: "homeCardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
        animationDelay: `${Math.min(index, 10) * 50}ms`,
        opacity: 0,
        backgroundColor: bg,
      }}
    >
      {/* Diagonal stripe texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 10px, ${overlayColor} 10px, ${overlayColor} 11px)`,
        }}
      />

      {/* Top badges */}
      <div className="relative z-10 flex items-start justify-between px-3 pt-3 min-h-[28px]">
        {/* join mode pill */}
        {!team.is_member && team.join_mode !== "invite_only" && (
          <span
            className="text-[8px] uppercase tracking-wider font-sans px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: overlayColor, color: dimColor }}
          >
            {team.join_mode === "open" ? "Abierto" : "Solicitud"}
          </span>
        )}
        {team.is_member && (
          <span
            className="text-[8px] uppercase tracking-wider font-sans px-1.5 py-0.5 rounded-full ml-auto"
            style={{ backgroundColor: "#D7FF00", color: "#000" }}
          >
            {team.role === "admin" ? "Admin" : "Miembro"}
          </span>
        )}
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center justify-center py-4">
        {team.logo_url ? (
          <Image
            src={team.logo_url}
            alt={team.name}
            width={88}
            height={88}
            className="w-[88px] h-[88px] object-contain drop-shadow-2xl"
          />
        ) : (
          <div
            className="w-[80px] h-[80px] rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: overlayColor }}
          >
            <span className="font-display text-[52px] leading-none" style={{ color: textColor }}>
              {team.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Stars + Name + Members */}
      <div className="relative z-10 text-center px-3 pb-3">
        <div className="flex justify-center gap-0.5 mb-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="text-[13px] leading-none"
              style={{ color: i < stars ? "#FFD700" : lightBg ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)" }}
            >
              ★
            </span>
          ))}
        </div>
        <p className="font-display text-[18px] leading-tight truncate" style={{ color: textColor }}>
          {team.name}
        </p>
        <p className="text-[11px] font-sans mt-0.5" style={{ color: dimColor }}>
          {team.member_count} {team.member_count === 1 ? "jugador" : "jugadores"}
        </p>
      </div>

      {/* Stats bar */}
      <div
        className="relative z-10 grid grid-cols-3 divide-x divide-black/10"
        style={{ backgroundColor: overlayColor }}
      >
        {[
          { label: "V", value: team.wins },
          { label: "E", value: team.draws },
          { label: "D", value: team.losses },
        ].map(({ label, value }) => (
          <div key={label} className="py-2.5 text-center">
            <p className="font-display text-[22px] leading-none" style={{ color: textColor }}>
              {value}
            </p>
            <p className="text-[9px] uppercase font-sans mt-0.5" style={{ color: dimColor }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="relative z-10 p-2">
        <button
          onClick={() => ctaType && !ctaDisabled && onAction(team, ctaType)}
          disabled={ctaDisabled || isActioning || actioningId !== null}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display text-[13px] uppercase tracking-wide transition-all active:scale-[0.97] disabled:opacity-60"
          style={ctaStyle}
        >
          {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : ctaIcon}
          {isActioning ? "..." : ctaLabel}
        </button>
      </div>

      {/* Selection overlay while actioning */}
      {isActioning && (
        <div className="absolute inset-0 bg-black/30 rounded-2xl z-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#D7FF00] animate-spin" />
        </div>
      )}
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function DirectoryView({ teams }: { teams: PublicTeam[] }) {
  const [search, setSearch] = useState("")
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [localTeams, setLocalTeams] = useState<PublicTeam[]>(teams)
  const [, startTransition] = useTransition()

  const filtered = search
    ? localTeams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : localTeams

  function handleAction(team: PublicTeam, type: "enter" | "join" | "request") {
    if (actioningId) return
    setActioningId(team.id)

    startTransition(async () => {
      if (type === "enter") {
        await enterTeam(team.id)
        return
      }
      if (type === "join") {
        const result = await directJoin(team.id)
        if ("ok" in result) {
          setLocalTeams((prev) =>
            prev.map((t) => t.id === team.id ? { ...t, is_member: true, role: "player", member_count: t.member_count + 1 } : t)
          )
        }
      }
      if (type === "request") {
        const result = await requestJoin(team.id)
        if ("ok" in result) {
          setLocalTeams((prev) =>
            prev.map((t) => t.id === team.id ? { ...t, has_pending_request: true } : t)
          )
        }
      }
      setActioningId(null)
    })
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/30 font-sans mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D7FF00] inline-block animate-pulse" />
          {teams.length} equipos
        </div>
        <h1 className="font-display text-[44px] leading-none text-white">DIRECTORIO</h1>
        <h1 className="font-display text-[44px] leading-none text-[#D7FF00]">DE EQUIPOS</h1>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar equipo..."
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-full py-3 pl-11 pr-11 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D7FF00]/40 focus:bg-white/[0.07] transition-all font-sans"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((team, i) => (
            <TeamCard
              key={team.id}
              team={team}
              index={i}
              actioningId={actioningId}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-white/20 text-sm font-sans">
            {search ? `Sin resultados para "${search}"` : "No hay equipos registrados"}
          </p>
        </div>
      )}
    </div>
  )
}
