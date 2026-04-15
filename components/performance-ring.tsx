"use client"

import { cn } from "@/lib/utils"

interface PerformanceRingProps {
  value: number
  label: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PerformanceRing({ 
  value, 
  label, 
  size = "md",
  className 
}: PerformanceRingProps) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (value / 100) * circumference
  
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40"
  }
  
  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl"
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted"
        />
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-accent transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display", textSizes[size])}>
          {value}%
        </span>
        <span className="label-text text-[8px]">{label}</span>
      </div>
    </div>
  )
}
