import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo / Brand */}
        <div className="mb-12">
          <h1 className="font-display text-6xl md:text-8xl text-foreground leading-none">
            LA<br/>PIZARRA
          </h1>
          <div className="h-1 w-16 bg-accent mt-4" />
        </div>
        
        {/* Tagline */}
        <p className="text-lg text-muted-foreground max-w-xs leading-relaxed">
          Gestión de equipo y seguimiento del rendimiento histórico para equipos de fútbol amateur.
        </p>
      </div>
      
      {/* Actions */}
      <div className="px-6 pb-12 space-y-3">
        <Link
          href="/onboarding/create-team"
          className="flex items-center justify-between w-full bg-accent text-accent-foreground px-6 py-4 rounded-lg font-medium transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          <span className="uppercase tracking-wider text-sm">Crear equipo</span>
          <ChevronRight className="h-5 w-5" />
        </Link>
        
        <Link
          href="/onboarding/join-team"
          className="flex items-center justify-between w-full bg-card text-foreground px-6 py-4 rounded-lg font-medium border border-border transition-colors hover:bg-muted active:scale-[0.98]"
        >
          <span className="uppercase tracking-wider text-sm">Unirse a equipo</span>
          <ChevronRight className="h-5 w-5" />
        </Link>
        
        <div className="pt-4 text-center">
          <Link 
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ¿Ya tienes cuenta? <span className="text-accent">Iniciar sesión</span>
          </Link>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-1/2 h-1/3 bg-gradient-to-bl from-accent/5 to-transparent pointer-events-none" />
    </div>
  )
}
