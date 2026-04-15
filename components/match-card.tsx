import Link from "next/link"
import { cn } from "@/lib/utils"

type MatchResult = "win" | "loss" | "draw" | "upcoming" | "pending"

interface MatchCardProps {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  date: string
  competition?: string
  result?: MatchResult
  className?: string
}

export function MatchCard({
  id,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
  competition,
  result = "upcoming",
  className,
}: MatchCardProps) {
  const isUpcoming = result === "upcoming" || result === "pending"
  
  return (
    <Link 
      href={`/matches/${id}`}
      className={cn(
        "block bg-card rounded-lg p-4 transition-transform active:scale-[0.98]",
        className
      )}
    >
      {/* Competition & Date */}
      <div className="flex items-center justify-between mb-3">
        {competition && (
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {competition}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      
      {/* Teams & Score */}
      <div className="flex items-center gap-4">
        {/* Home Team */}
        <div className="flex-1 text-right">
          <span className="text-sm font-medium">{homeTeam}</span>
        </div>
        
        {/* Score or VS */}
        <div className={cn(
          "flex items-center justify-center gap-2 min-w-[80px]",
          !isUpcoming && "px-3 py-1 rounded bg-muted"
        )}>
          {isUpcoming ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-muted-foreground uppercase">vs</span>
              {result === "pending" && (
                <span className="text-[9px] uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                  Pendiente
                </span>
              )}
            </div>
          ) : (
            <>
              <span className="font-display text-2xl">{homeScore}</span>
              <span className="text-muted-foreground">-</span>
              <span className="font-display text-2xl">{awayScore}</span>
            </>
          )}
        </div>
        
        {/* Away Team */}
        <div className="flex-1">
          <span className="text-sm font-medium">{awayTeam}</span>
        </div>
      </div>
      
      {/* Result indicator */}
      {!isUpcoming && (
        <div className="mt-3 flex justify-center">
          <span className={cn(
            "text-[10px] uppercase tracking-widest px-2 py-0.5 rounded",
            result === "win" && "bg-accent/20 text-accent",
            result === "loss" && "bg-destructive/20 text-destructive",
            result === "draw" && "bg-muted-foreground/20 text-muted-foreground"
          )}>
            {result === "win" && "Victoria"}
            {result === "loss" && "Derrota"}
            {result === "draw" && "Empate"}
          </span>
        </div>
      )}
    </Link>
  )
}
