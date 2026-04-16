"use client"

import { useState, useTransition } from "react"
import { Search, X, Loader2, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { selectTeam } from "./actions"

export type UserTeam = {
  team_id: string
  team_name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  role: "admin" | "player"
  member_count: number
}

// ─── Shared background layers ────────────────────────────────────────────────

function SceneBackground() {
  return (
    <>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Stadium ambient green from bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-emerald-950/25 to-transparent pointer-events-none" />
      {/* Faint accent glow from top */}
      <div className="absolute top-0 left-0 right-0 h-52 bg-gradient-to-b from-[#D7FF00]/[0.04] to-transparent pointer-events-none" />
    </>
  )
}

// ─── Bottom CTAs ─────────────────────────────────────────────────────────────

function BottomCTAs() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-10 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
      <div className="max-w-lg mx-auto space-y-2.5 pointer-events-auto">
        <Link
          href="/onboarding/create-team"
          className="flex items-center justify-center gap-2 w-full bg-[#D7FF00] text-black py-[15px] rounded-xl font-display text-xl uppercase tracking-wide hover:bg-[#BFE600] active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Crear equipo
        </Link>
        <Link
          href="/onboarding/join-team"
          className="flex items-center justify-center w-full border border-white/15 text-white/70 py-[15px] rounded-xl font-display text-xl uppercase tracking-wide hover:border-[#D7FF00]/35 hover:text-white active:scale-[0.98] transition-all"
        >
          Unirme con código
        </Link>
      </div>
    </div>
  )
}

// ─── Empty / Discovery state ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="min-h-[100dvh] bg-black relative overflow-hidden flex flex-col items-center justify-center px-6">
      <SceneBackground />

      <div className="relative z-10 flex flex-col items-center text-center max-w-[280px] w-full pb-40">
        {/* Animated ping rings */}
        <div className="relative w-28 h-28 mb-10 flex items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border border-[#D7FF00]/20 animate-ping"
            style={{ animationDuration: "2.2s" }}
          />
          <span
            className="absolute inset-[10px] rounded-full border border-[#D7FF00]/12 animate-ping"
            style={{ animationDuration: "2.2s", animationDelay: "0.35s" }}
          />
          <span className="absolute inset-[22px] rounded-full bg-[#D7FF00]/8 flex items-center justify-center">
            <span className="text-3xl leading-none select-none">⚽</span>
          </span>
        </div>

        <h1 className="font-display text-[52px] leading-none text-white tracking-wide">
          BIENVENIDO
        </h1>
        <h1 className="font-display text-[52px] leading-none text-[#D7FF00] tracking-wide mb-5">
          A LA PIZARRA
        </h1>
        <p className="text-white/35 text-sm leading-relaxed">
          Crea tu primer equipo o únete a uno existente con un código de
          invitación.
        </p>
      </div>

      <BottomCTAs />
    </div>
  )
}

// ─── Team card ────────────────────────────────────────────────────────────────

function TeamCard({
  team,
  index,
  isSelecting,
  disabled,
  onSelect,
}: {
  team: UserTeam
  index: number
  isSelecting: boolean
  disabled: boolean
  onSelect: (id: string) => void
}) {
  const color = team.primary_color || "#D7FF00"

  return (
    <button
      onClick={() => !disabled && onSelect(team.team_id)}
      disabled={disabled}
      aria-label={`Seleccionar ${team.team_name}`}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden group hover:scale-[1.025] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(215,255,0,0.12)]"
      style={{
        animation: "homeCardIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
        animationDelay: `${index * 70}ms`,
        opacity: 0,
      }}
    >
      {/* Team color radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 35%, ${color}50 0%, ${color}18 45%, #0d0d0d 100%)`,
        }}
      />

      {/* Inner border — subtle default, neon on hover */}
      <div className="absolute inset-0 rounded-2xl border border-white/[0.07] group-hover:border-[#D7FF00]/35 transition-colors duration-300 pointer-events-none z-10" />


      {/* Card content */}
      <div className="relative z-[1] h-full flex flex-col p-3.5">
        {/* Role badge */}
        <div className="flex justify-end h-5 shrink-0">
          {team.role === "admin" && (
            <span className="text-[9px] uppercase tracking-wider bg-[#D7FF00]/12 text-[#D7FF00] px-2 py-0.5 rounded-full border border-[#D7FF00]/25 leading-none flex items-center font-sans">
              Admin
            </span>
          )}
        </div>

        {/* Logo */}
        <div className="flex-1 flex items-center justify-center py-1">
          {team.logo_url ? (
            <Image
              src={team.logo_url}
              alt={team.team_name}
              width={80}
              height={80}
              className="w-[80px] h-[80px] object-contain drop-shadow-xl"
            />
          ) : (
            <div
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
              style={{
                background: `${color}18`,
                border: `1.5px solid ${color}28`,
              }}
            >
              <span
                className="font-display text-[42px] leading-none"
                style={{ color }}
              >
                {team.team_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name + member count */}
        <div className="text-center shrink-0">
          <p className="font-display text-[17px] leading-tight text-white truncate">
            {team.team_name}
          </p>
          <p className="text-[11px] text-white/30 mt-0.5 font-sans">
            {team.member_count}{" "}
            {team.member_count === 1 ? "jugador" : "jugadores"}
          </p>
        </div>
      </div>

      {/* Accent bottom bar slides in on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D7FF00] origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"
      />

      {/* Selection loading overlay */}
      {isSelecting && (
        <div className="absolute inset-0 z-20 bg-black/65 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
          <Loader2 className="h-8 w-8 text-[#D7FF00] animate-spin" />
        </div>
      )}
    </button>
  )
}

// ─── Main HomeView ────────────────────────────────────────────────────────────

export function HomeView({ teams }: { teams: UserTeam[] }) {
  const [search, setSearch] = useState("")
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  if (teams.length === 0) return <EmptyState />

  const filtered = search
    ? teams.filter((t) =>
        t.team_name.toLowerCase().includes(search.toLowerCase())
      )
    : teams

  function handleSelect(teamId: string) {
    if (selectingId) return
    setSelectingId(teamId)
    startTransition(async () => {
      await selectTeam(teamId)
    })
  }

  return (
    <div className="min-h-[100dvh] bg-black relative overflow-x-hidden">
      <SceneBackground />

      <div className="relative z-10 flex flex-col px-4 pt-10 pb-40 max-w-lg mx-auto w-full">
        {/* Season badge */}
        <div className="flex justify-center mb-7">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/35 border border-white/[0.08] rounded-full px-4 py-1.5 bg-white/[0.03] font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D7FF00] animate-pulse inline-block flex-shrink-0" />
            Temporada 2026
          </div>
        </div>

        {/* Hero title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-[clamp(52px,14vw,72px)] leading-none text-white tracking-wide">
            SELECCIONA
          </h1>
          <h1 className="font-display text-[clamp(52px,14vw,72px)] leading-none text-[#D7FF00] tracking-wide">
            TU EQUIPO
          </h1>
        </div>

        {/* Search bar — only with > 3 teams */}
        {teams.length > 3 && (
          <div className="relative mb-6">
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
        )}

        {/* Team grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((team, i) => (
            <TeamCard
              key={team.team_id}
              team={team}
              index={i}
              isSelecting={selectingId === team.team_id}
              disabled={selectingId !== null}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {filtered.length === 0 && search && (
          <p className="text-center text-white/20 text-sm py-10 font-sans">
            Sin resultados para &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      <BottomCTAs />
    </div>
  )
}
