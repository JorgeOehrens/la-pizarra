"use client"

import { AppShell } from "@/components/app-shell"
import { ChevronLeft, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { cn } from "@/lib/utils"

// Mock match data
const getMatch = (id: string) => ({
  id,
  homeTeam: "La Máquina FC",
  awayTeam: "Real Norte",
  homeScore: 3,
  awayScore: 1,
  date: "Sábado 13 Abril 2026",
  time: "10:00",
  venue: "Campo Municipal #3",
  competition: "Liga Amateur",
  result: "win" as const,
  events: [
    { minute: 12, type: "goal", player: "Juan P.", team: "home" },
    { minute: 34, type: "goal", player: "Carlos M.", team: "home" },
    { minute: 56, type: "yellow", player: "Miguel R.", team: "home" },
    { minute: 67, type: "goal", player: "Opponent Player", team: "away" },
    { minute: 78, type: "goal", player: "Luis G.", team: "home" },
  ],
  lineup: [
    { number: 1, name: "Pedro S.", position: "POR", rating: 7.5 },
    { number: 4, name: "Miguel R.", position: "DEF", rating: 7.0 },
    { number: 5, name: "Andrés T.", position: "DEF", rating: 7.2 },
    { number: 8, name: "Luis G.", position: "MED", rating: 8.5 },
    { number: 10, name: "Carlos M.", position: "MED", rating: 8.8 },
    { number: 9, name: "Juan P.", position: "DEL", rating: 9.0 },
  ],
})

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const match = getMatch(id)

  return (
    <AppShell showNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/matches" className="p-2 -ml-2 rounded-lg hover:bg-card">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl">{match.competition}</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* Score Card */}
        <div className="bg-card rounded-xl p-6 mb-6">
          {/* Date */}
          <p className="text-center text-xs text-muted-foreground mb-4">{match.date}</p>
          
          {/* Teams & Score */}
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-lg bg-accent mx-auto flex items-center justify-center mb-2">
                <span className="font-display text-2xl text-accent-foreground">
                  {match.homeTeam.charAt(0)}
                </span>
              </div>
              <p className="text-sm font-medium">{match.homeTeam}</p>
            </div>
            
            <div className="px-6">
              <div className="flex items-center gap-3">
                <span className="font-display text-5xl">{match.homeScore}</span>
                <span className="text-2xl text-muted-foreground">-</span>
                <span className="font-display text-5xl">{match.awayScore}</span>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">Final</p>
            </div>
            
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-lg bg-muted mx-auto flex items-center justify-center mb-2">
                <span className="font-display text-2xl text-muted-foreground">
                  {match.awayTeam.charAt(0)}
                </span>
              </div>
              <p className="text-sm font-medium">{match.awayTeam}</p>
            </div>
          </div>
          
          {/* Result badge */}
          <div className="flex justify-center mt-4">
            <span className={cn(
              "px-3 py-1 rounded text-xs uppercase tracking-wider",
              match.result === "win" && "bg-accent/20 text-accent",
              match.result === "loss" && "bg-destructive/20 text-destructive",
              match.result === "draw" && "bg-muted text-muted-foreground"
            )}>
              {match.result === "win" && "Victoria"}
              {match.result === "loss" && "Derrota"}
              {match.result === "draw" && "Empate"}
            </span>
          </div>
        </div>

        {/* Match Info */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-card rounded-lg p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Hora</p>
              <p className="font-medium">{match.time}</p>
            </div>
          </div>
          <div className="flex-1 bg-card rounded-lg p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Lugar</p>
              <p className="font-medium text-sm">{match.venue}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <section className="mb-6">
          <h2 className="font-display text-lg mb-4">Cronología</h2>
          <div className="bg-card rounded-xl p-4 space-y-3">
            {match.events.map((event, i) => (
              <div 
                key={i}
                className={cn(
                  "flex items-center gap-3",
                  event.team === "away" && "flex-row-reverse"
                )}
              >
                <span className="w-8 text-xs text-muted-foreground">
                  {event.minute}&apos;
                </span>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  event.type === "goal" && "bg-accent text-accent-foreground",
                  event.type === "yellow" && "bg-yellow-500 text-black",
                  event.type === "red" && "bg-destructive text-white"
                )}>
                  {event.type === "goal" && "⚽"}
                  {event.type === "yellow" && "🟨"}
                  {event.type === "red" && "🟥"}
                </div>
                <span className="text-sm">{event.player}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Lineup */}
        <section>
          <h2 className="font-display text-lg mb-4">Alineación</h2>
          <div className="space-y-2">
            {match.lineup.map((player) => (
              <div 
                key={player.number}
                className="bg-card rounded-lg p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full border border-accent flex items-center justify-center">
                  <span className="font-display">{player.number}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.position}</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-sm font-display",
                  player.rating >= 8 && "bg-accent/20 text-accent",
                  player.rating >= 7 && player.rating < 8 && "bg-muted text-foreground",
                  player.rating < 7 && "bg-destructive/20 text-destructive"
                )}>
                  {player.rating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
