"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PerformanceRing } from "@/components/performance-ring"
import { PlayerCard } from "@/components/player-card"
import { AddPlayerSheet } from "@/components/add-player-sheet"
import { Plus, Settings } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Mock data
const teamStats = {
  name: "LA MÁQUINA FC",
  attack: 85,
  defense: 70,
  agility: 92,
}

const positions = ["Todos", "Porteros", "Defensas", "Mediocampistas", "Delanteros"]

const players = [
  { id: "1", name: "Carlos M.", position: "Mediocampista", number: 10, matches: 42, goals: 15 },
  { id: "2", name: "Juan P.", position: "Delantero", number: 9, matches: 38, goals: 22 },
  { id: "3", name: "Miguel R.", position: "Defensa", number: 4, matches: 40, goals: 2 },
  { id: "4", name: "Pedro S.", position: "Portero", number: 1, matches: 42, goals: 0 },
  { id: "5", name: "Luis G.", position: "Mediocampista", number: 8, matches: 35, goals: 8 },
  { id: "6", name: "Andrés T.", position: "Defensa", number: 5, matches: 30, goals: 1 },
]

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<"stats" | "lineup">("stats")
  const [activePosition, setActivePosition] = useState("Todos")
  const [addPlayerOpen, setAddPlayerOpen] = useState(false)

  const filteredPlayers = activePosition === "Todos" 
    ? players 
    : players.filter(p => p.position + "s" === activePosition || p.position === activePosition.slice(0, -1))

  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="label-text mb-1">Equipo</p>
            <h1 className="font-display text-3xl">{teamStats.name}</h1>
          </div>
          <Link href="/team/settings" className="p-2 rounded-lg bg-card">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex bg-card rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("stats")}
            className={cn(
              "flex-1 py-2.5 text-sm uppercase tracking-wider rounded-md transition-colors",
              activeTab === "stats" 
                ? "bg-accent text-accent-foreground font-medium" 
                : "text-muted-foreground"
            )}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab("lineup")}
            className={cn(
              "flex-1 py-2.5 text-sm uppercase tracking-wider rounded-md transition-colors",
              activeTab === "lineup" 
                ? "bg-accent text-accent-foreground font-medium" 
                : "text-muted-foreground"
            )}
          >
            Plantilla
          </button>
        </div>

        {activeTab === "stats" ? (
          <>
            {/* Performance Section */}
            <section className="bg-card rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg">Rendimiento</h2>
                <span className="label-text">Forma</span>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Main Ring */}
                <PerformanceRing value={teamStats.attack} label="Ataque" size="lg" />
                
                {/* Side Stats */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground uppercase">Defensa</span>
                      <span className="font-display text-lg">{teamStats.defense}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-1000"
                        style={{ width: `${teamStats.defense}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground uppercase">Agilidad</span>
                      <span className="font-display text-lg">{teamStats.agility}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-1000"
                        style={{ width: `${teamStats.agility}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Top Players */}
            <section>
              <h2 className="font-display text-lg mb-4">Jugadores destacados</h2>
              <div className="grid grid-cols-2 gap-3">
                {players.slice(0, 4).map((player) => (
                  <PlayerCard 
                    key={player.id} 
                    {...player}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Position Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setActivePosition(pos)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs uppercase tracking-wider whitespace-nowrap transition-colors",
                    activePosition === pos 
                      ? "bg-accent text-accent-foreground" 
                      : "bg-card text-muted-foreground"
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>

            {/* Players List */}
            <div className="space-y-2">
              {filteredPlayers.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center gap-4 bg-card rounded-lg p-4 active:scale-[0.98] transition-transform"
                >
                  {/* Number */}
                  <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center">
                    <span className="font-display text-xl">{player.number}</span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-medium">{player.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase">{player.position}</p>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="text-right">
                    <p className="font-display text-lg">{player.goals}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Goles</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Add Player Button */}
            <button
              onClick={() => setAddPlayerOpen(true)}
              className="fixed bottom-24 right-4 w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg shadow-accent/25 active:scale-95 transition-transform"
            >
              <Plus className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Add Player Sheet */}
      <AddPlayerSheet open={addPlayerOpen} onOpenChange={setAddPlayerOpen} />
    </AppShell>
  )
}
