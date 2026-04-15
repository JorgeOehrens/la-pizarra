"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate signup
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Volver</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display text-4xl mb-2">Crear cuenta</h1>
          <p className="text-muted-foreground">Regístrate para empezar a usar LaPizarra</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text block mb-2">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="label-text block mb-2">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="label-text block mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-card border border-border rounded-lg px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                required
                className="mt-1 w-4 h-4 rounded border-border bg-card accent-accent"
              />
              <span className="text-sm text-muted-foreground">
                Acepto los{" "}
                <Link href="/terms" className="text-accent hover:underline">términos de servicio</Link>
                {" "}y la{" "}
                <Link href="/privacy" className="text-accent hover:underline">política de privacidad</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-accent hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
