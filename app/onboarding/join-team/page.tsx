"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Link2, Search, Users, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { joinByToken, searchTeams } from "./actions"

type TeamResult = {
  id: string
  name: string
  logo_url: string | null
  member_count: number
}

type Tab = "link" | "search"

export default function JoinTeamPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("link")

  // Link tab state
  const [linkInput, setLinkInput] = useState("")
  const [linkError, setLinkError] = useState<string | null>(null)
  const [isJoining, startJoining] = useTransition()

  // Search tab state
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TeamResult[]>([])
  const [isSearching, startSearch] = useTransition()
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Extract token from full URL or bare token
  function extractToken(input: string): string {
    try {
      const url = new URL(input)
      const parts = url.pathname.split("/")
      return parts[parts.length - 1]
    } catch {
      return input.trim()
    }
  }

  function handleJoinByLink() {
    const token = extractToken(linkInput)
    if (!token) {
      setLinkError("Ingresa un link o código de invitación.")
      return
    }
    setLinkError(null)
    startJoining(async () => {
      const result = await joinByToken(token)
      if (result?.error) setLinkError(result.error)
      // On success joinByToken calls redirect() — no need to handle here
    })
  }

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    setSearchError(null)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    startSearch(async () => {
      const data = await searchTeams(value)
      setResults(data)
    })
  }, [])

  function handleJoinTeam(teamId: string) {
    setJoiningTeamId(teamId)
    setSearchError(null)
    // For search-based joining, we'd need an admin to approve or use a different flow.
    // For now, show an info message — joining via search requires admin invite.
    setSearchError("Para unirte a este equipo, pide un link de invitación al administrador.")
    setJoiningTeamId(null)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 py-4">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Volver</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col px-5 pb-12">
        <div className="mb-8 pt-2">
          <h1 className="font-display text-3xl mb-1">Unirse a equipo</h1>
          <p className="text-muted-foreground text-sm">
            Usa un link de invitación o busca tu equipo
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-card rounded-xl p-1 mb-6 border border-border/40">
          {([
            { value: "link", label: "Con link", icon: Link2 },
            { value: "search", label: "Buscar", icon: Search },
          ] as { value: Tab; label: string; icon: React.ElementType }[]).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-wider rounded-lg transition-colors",
                tab === value
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Link tab */}
        {tab === "link" && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Link o código de invitación
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={linkInput}
                    onChange={(e) => {
                      setLinkInput(e.target.value)
                      setLinkError(null)
                    }}
                    placeholder="https://lapizarra.app/join/…"
                    autoFocus
                    className="w-full bg-card border border-border/40 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 pr-10 placeholder:text-muted-foreground/40"
                  />
                  {linkInput && (
                    <button
                      onClick={() => setLinkInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-2 pl-1">
                  Pega el link completo o el token que te compartió el administrador
                </p>
              </div>

              {linkError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
                  {linkError}
                </p>
              )}
            </div>

            <button
              onClick={handleJoinByLink}
              disabled={isJoining || !linkInput.trim()}
              className="w-full bg-accent text-accent-foreground font-display uppercase text-sm tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 mt-8 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uniéndose…
                </>
              ) : (
                "Unirse al equipo"
              )}
            </button>
          </div>
        )}

        {/* Search tab */}
        {tab === "search" && (
          <div className="flex-1 flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Nombre del equipo…"
                className="w-full bg-card border border-border/40 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/40"
              />
            </div>

            {searchError && (
              <p className="text-sm text-muted-foreground bg-muted rounded-xl px-4 py-3 mb-3">
                {searchError}
              </p>
            )}

            <div className="flex-1 space-y-2">
              {isSearching ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : query.trim().length > 0 && results.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No se encontraron equipos</p>
                </div>
              ) : query.trim().length < 2 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Escribe para buscar equipos</p>
                </div>
              ) : (
                results.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={joiningTeamId === team.id}
                    className="w-full flex items-center gap-4 bg-card rounded-xl p-4 text-left active:scale-[0.98] transition-transform border border-border/30"
                  >
                    <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      {team.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="font-display text-lg text-accent">
                          {team.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{team.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{team.member_count} jugadores</span>
                      </div>
                    </div>
                    {joiningTeamId === team.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
