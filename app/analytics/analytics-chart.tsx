"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type ChartPoint = { month: string; wins: number; draws: number; losses: number }
type PlayerRank = { display_name: string; value: number }

export function AnalyticsChart({
  chartData,
  topScorers,
  topAssists,
  trend,
}: {
  chartData: ChartPoint[]
  topScorers: PlayerRank[]
  topAssists: PlayerRank[]
  trend: number
}) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? "text-accent" : trend < 0 ? "text-destructive" : "text-muted-foreground"

  return (
    <div className="space-y-5">
      {/* Evolución Chart */}
      <section className="bg-card rounded-xl p-5 border border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Evolución</h2>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            </div>
          )}
        </div>

        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barGap={2} barCategoryGap="30%">
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                />
                <YAxis hide />
                <Bar dataKey="wins" fill="#D7FF00" radius={[3, 3, 0, 0]} />
                <Bar dataKey="draws" fill="#3f3f46" radius={[3, 3, 0, 0]} />
                <Bar dataKey="losses" fill="#ef4444" opacity={0.6} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-5 mt-3">
              {[
                { color: "bg-accent", label: "Victorias" },
                { color: "bg-zinc-700", label: "Empates" },
                { color: "bg-destructive/60", label: "Derrotas" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[140px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Sin partidos registrados</p>
          </div>
        )}
      </section>

      {/* Top Scorers */}
      <section>
        <h2 className="font-display text-lg mb-3">Máximos goleadores</h2>
        {topScorers.length > 0 ? (
          <div className="space-y-2">
            {topScorers.map((p, i) => (
              <RankRow key={p.display_name} rank={i + 1} name={p.display_name} value={p.value} label="Goles" />
            ))}
          </div>
        ) : (
          <EmptyRank />
        )}
      </section>

      {/* Top Assists */}
      <section>
        <h2 className="font-display text-lg mb-3">Máximos asistentes</h2>
        {topAssists.length > 0 ? (
          <div className="space-y-2">
            {topAssists.map((p, i) => (
              <RankRow key={p.display_name} rank={i + 1} name={p.display_name} value={p.value} label="Asist." />
            ))}
          </div>
        ) : (
          <EmptyRank />
        )}
      </section>
    </div>
  )
}

function RankRow({
  rank,
  name,
  value,
  label,
}: {
  rank: number
  name: string
  value: number
  label: string
}) {
  return (
    <div className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border/30">
      <span
        className={`font-display text-2xl w-8 text-center flex-shrink-0 ${
          rank === 1 ? "text-accent" : "text-muted-foreground"
        }`}
      >
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display text-2xl leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      </div>
    </div>
  )
}

function EmptyRank() {
  return (
    <div className="bg-card rounded-xl p-4 text-center border border-border/30">
      <p className="text-sm text-muted-foreground">Sin datos aún</p>
    </div>
  )
}
