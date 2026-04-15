"use client"

import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Mock chart data
const seasonData = [
  { month: "S1", wins: 2, losses: 1, draws: 1 },
  { month: "S2", wins: 3, losses: 0, draws: 1 },
  { month: "S3", wins: 2, losses: 2, draws: 0 },
  { month: "S4", wins: 3, losses: 1, draws: 0 },
  { month: "S5", wins: 4, losses: 0, draws: 1 },
]

const topScorers = [
  { name: "Juan P.", goals: 22 },
  { name: "Carlos M.", goals: 15 },
  { name: "Luis G.", goals: 8 },
]

const topAssists = [
  { name: "Carlos M.", assists: 18 },
  { name: "Andrés T.", assists: 12 },
  { name: "Juan P.", assists: 8 },
]

export default function AnalyticsPage() {
  
  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <header className="mb-6">
          <p className="label-text mb-1">Temporada 2025/26</p>
          <h1 className="font-display text-3xl">Estadísticas</h1>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Partidos" value={24} />
          <StatCard label="Victorias" value={16} variant="accent" />
          <StatCard label="Goles a favor" value={52} />
          <StatCard label="Goles en contra" value={28} />
        </div>

        {/* Win Rate Trend */}
        <section className="bg-card rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Evolución</h2>
            <div className="flex items-center gap-1 text-accent">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">+12%</span>
            </div>
          </div>
          
          {/* Recharts Bar Chart */}
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={seasonData} barGap={2}>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10 }}
              />
              <YAxis hide />
              <Bar dataKey="wins" fill="#D7FF00" radius={[2, 2, 0, 0]} />
              <Bar dataKey="draws" fill="#3f3f46" radius={[2, 2, 0, 0]} />
              <Bar dataKey="losses" fill="#ef4444" opacity={0.5} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] text-muted-foreground">Victorias</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground">Empates</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive/50" />
              <span className="text-[10px] text-muted-foreground">Derrotas</span>
            </div>
          </div>
        </section>

        {/* Goal Stats */}
        <section className="bg-card rounded-xl p-5 mb-6">
          <h2 className="font-display text-lg mb-4">Goles por partido</h2>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="font-display text-4xl text-accent">2.2</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-1">A favor</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="font-display text-4xl">1.2</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-1">En contra</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="font-display text-4xl text-accent">+1.0</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-1">Diferencia</p>
            </div>
          </div>
        </section>

        {/* Top Scorers */}
        <section className="mb-6">
          <h2 className="font-display text-lg mb-4">Máximos goleadores</h2>
          <div className="space-y-2">
            {topScorers.map((player, i) => (
              <div key={player.name} className="bg-card rounded-lg p-4 flex items-center gap-4">
                <span className={`font-display text-2xl ${i === 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl">{player.goals}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Goles</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Assists */}
        <section>
          <h2 className="font-display text-lg mb-4">Máximos asistentes</h2>
          <div className="space-y-2">
            {topAssists.map((player, i) => (
              <div key={player.name} className="bg-card rounded-lg p-4 flex items-center gap-4">
                <span className={`font-display text-2xl ${i === 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl">{player.assists}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Asist.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
