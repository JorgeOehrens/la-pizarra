import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { MatchCard } from "@/components/match-card"
import { ChevronRight, Calendar, Users } from "lucide-react"
import Link from "next/link"

// Mock data
const teamData = {
  name: "LA MÁQUINA FC",
  winRate: 68,
  recentForm: ["W", "W", "L", "W", "D"],
}

const upcomingMatch = {
  id: "1",
  homeTeam: "La Máquina FC",
  awayTeam: "Deportivo Sur",
  date: "Dom 20 Abr · 10:00",
  competition: "Liga Amateur",
}

const recentMatches = [
  { id: "2", homeTeam: "La Máquina FC", awayTeam: "Real Norte", homeScore: 3, awayScore: 1, date: "13 Abr", result: "win" as const },
  { id: "3", homeTeam: "Atlético Centro", awayTeam: "La Máquina FC", homeScore: 2, awayScore: 2, date: "6 Abr", result: "draw" as const },
  { id: "4", homeTeam: "La Máquina FC", awayTeam: "FC Oeste", homeScore: 0, awayScore: 2, date: "30 Mar", result: "loss" as const },
]

const quickStats = [
  { label: "Partidos", value: 24 },
  { label: "Victorias", value: 16 },
  { label: "Goles", value: 52 },
]

export default function HomePage() {
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <header className="mb-6">
          <p className="label-text mb-1">Bienvenido a</p>
          <h1 className="font-display text-4xl">{teamData.name}</h1>
        </header>
        
        {/* Win Rate Card */}
        <div className="bg-accent text-accent-foreground rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-70">Tasa de victoria</p>
              <p className="font-display text-5xl mt-1">{teamData.winRate}%</p>
            </div>
            <div className="flex gap-1">
              {teamData.recentForm.map((result, i) => (
                <div
                  key={i}
                  className={`w-6 h-8 rounded flex items-center justify-center text-xs font-bold ${
                    result === "W" ? "bg-black text-accent" :
                    result === "L" ? "bg-black/20 text-black" :
                    "bg-black/40 text-black"
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickStats.map((stat) => (
            <StatCard key={stat.label} {...stat} size="sm" />
          ))}
        </div>
        
        {/* Upcoming Match */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl">Próximo partido</h2>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <MatchCard {...upcomingMatch} />
        </section>
        
        {/* Recent Matches */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl">Últimos resultados</h2>
            <Link href="/matches" className="text-accent text-xs uppercase tracking-wider flex items-center gap-1">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentMatches.map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
          </div>
        </section>
        
        {/* Quick Actions */}
        <section>
          <h2 className="font-display text-xl mb-3">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/team"
              className="bg-card rounded-lg p-4 flex flex-col gap-2 active:scale-[0.98] transition-transform"
            >
              <Users className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Ver plantilla</span>
            </Link>
            <Link 
              href="/matches/new"
              className="bg-card rounded-lg p-4 flex flex-col gap-2 active:scale-[0.98] transition-transform"
            >
              <Calendar className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Registrar partido</span>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
