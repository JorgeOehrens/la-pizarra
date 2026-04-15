import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  variant?: "default" | "accent" | "light"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatCard({ 
  label, 
  value, 
  variant = "default",
  size = "md",
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-4 rounded-lg",
      variant === "default" && "bg-card",
      variant === "accent" && "bg-accent text-accent-foreground",
      variant === "light" && "bg-secondary text-secondary-foreground",
      className
    )}>
      <span className={cn(
        "font-display",
        size === "sm" && "text-2xl",
        size === "md" && "text-4xl",
        size === "lg" && "text-5xl"
      )}>
        {value}
      </span>
      <span className={cn(
        "label-text mt-1",
        variant === "accent" && "text-accent-foreground/70",
        variant === "light" && "text-secondary-foreground/60"
      )}>
        {label}
      </span>
    </div>
  )
}
