import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PlayerCardProps {
  id: string
  name: string
  position: string
  number: number
  imageUrl?: string
  matches?: number
  goals?: number
  variant?: "dark" | "light"
  className?: string
}

export function PlayerCard({
  id,
  name,
  position,
  number,
  imageUrl,
  matches,
  goals,
  variant = "dark",
  className,
}: PlayerCardProps) {
  return (
    <Link 
      href={`/players/${id}`}
      className={cn(
        "block rounded-xl overflow-hidden transition-transform active:scale-[0.98]",
        variant === "dark" ? "bg-card" : "bg-card-light",
        className
      )}
    >
      {/* Player Image */}
      <div className="relative aspect-[4/5] bg-gradient-to-b from-muted/50 to-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-6xl text-muted-foreground/30">
              {number}
            </span>
          </div>
        )}
        
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="font-display text-2xl text-white">{name}</h3>
          <p className="text-accent text-xs uppercase tracking-wider">
            {position} | #{number}
          </p>
        </div>
      </div>
      
      {/* Stats */}
      {(matches !== undefined || goals !== undefined) && (
        <div className={cn(
          "flex divide-x",
          variant === "dark" ? "divide-border bg-card" : "divide-border-light bg-white"
        )}>
          {matches !== undefined && (
            <div className="flex-1 py-3 text-center">
              <span className={cn(
                "block font-display text-xl",
                variant === "dark" ? "text-foreground" : "text-secondary-foreground"
              )}>
                {matches}
              </span>
              <span className="label-text">Partidos</span>
            </div>
          )}
          {goals !== undefined && (
            <div className="flex-1 py-3 text-center">
              <span className={cn(
                "block font-display text-xl",
                variant === "dark" ? "text-foreground" : "text-secondary-foreground"
              )}>
                {goals}
              </span>
              <span className="label-text">Goles</span>
            </div>
          )}
        </div>
      )}
    </Link>
  )
}
