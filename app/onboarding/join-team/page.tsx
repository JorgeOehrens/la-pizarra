"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Search, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock teams data
const searchResults = [
  { id: "1", name: "La Máquina FC", category: "Liga Amateur", members: 18 },
  { id: "2", name: "Real Norte", category: "Liga Amateur", members: 22 },
  { id: "3", name: "Deportivo Sur", category: "Fútbol 7", members: 12 },
]

export default function JoinTeamPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"code" | "search">("code")
  const [inviteCode, setInviteCode] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push("/home")
  }

  const handleJoinTeam = async (teamId: string) => {
    setSelectedTeam(teamId)
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push("/home")
  }

  const filteredTeams = searchQuery.length > 0 
    ? searchResults.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Volver</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col px-6 pb-12">
        {/* Title */}
        <div className="mb-8 pt-4">
          <h1 className="font-display text-3xl mb-2">Unirse a equipo</h1>
          <p className="text-muted-foreground text-sm">Únete con un código o busca tu equipo</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-card rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode("code")}
            className={cn(
              "flex-1 py-2.5 text-sm uppercase tracking-wider rounded-md transition-colors",
              mode === "code" 
                ? "bg-accent text-accent-foreground font-medium" 
                : "text-muted-foreground"
            )}
          >
            Con código
          </button>
          <button
            onClick={() => setMode("search")}
            className={cn(
              "flex-1 py-2.5 text-sm uppercase tracking-wider rounded-md transition-colors",
              mode === "search" 
                ? "bg-accent text-accent-foreground font-medium" 
                : "text-muted-foreground"
            )}
          >
            Buscar
          </button>
        </div>

        {mode === "code" ? (
          /* Join by Code */
          <form onSubmit={handleJoinByCode} className="flex-1 flex flex-col">
            <div className="flex-1">
              <label className="label-text block mb-2">Código de invitación</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                maxLength={6}
                className="w-full bg-card border border-border rounded-lg px-4 py-4 text-center text-2xl font-display tracking-[0.5em] text-foreground placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                required
              />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Pide el código de invitación al administrador de tu equipo
              </p>
            </div>

            <button
              type="submit"
              disabled={inviteCode.length < 6 || isLoading}
              className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Uniéndose..." : "Unirse"}
            </button>
          </form>
        ) : (
          /* Search Teams */
          <div className="flex-1 flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar equipo..."
                className="w-full bg-card border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Results */}
            <div className="flex-1 space-y-2">
              {searchQuery.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">Escribe para buscar equipos</p>
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No se encontraron equipos</p>
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={isLoading && selectedTeam === team.id}
                    className="w-full flex items-center gap-4 bg-card rounded-lg p-4 text-left active:scale-[0.98] transition-transform disabled:opacity-50"
                  >
                    {/* Logo placeholder */}
                    <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                      <span className="font-display text-lg text-accent-foreground">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-medium">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{team.category}</p>
                    </div>
                    
                    {/* Members */}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{team.members}</span>
                    </div>
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
