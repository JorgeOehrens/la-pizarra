"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Eye, EyeOff, Mail } from "lucide-react"
import { signup } from "@/app/auth/actions"

function SignupForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? ""
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)

    if (result?.error === 'CONFIRM_EMAIL') {
      setEmailSent(true)
      setIsLoading(false)
      return
    }

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
          <Mail className="h-8 w-8 text-accent" />
        </div>
        <h1 className="font-display text-3xl mb-3 text-center">Revisa tu correo</h1>
        <p className="text-muted-foreground text-center text-sm max-w-xs">
          Te enviamos un enlace de confirmación. Haz clic en él y luego inicia sesión.
        </p>
        <Link href="/auth/login" className="mt-8 text-accent hover:underline text-sm">
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl mb-2">Crear cuenta</h1>
        <p className="text-muted-foreground">Regístrate para empezar a usar LaPizarra</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label className="label-text block mb-2">Nombre</label>
          <input
            name="display_name"
            type="text"
            placeholder="Tu nombre completo"
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="label-text block mb-2">Usuario</label>
          <input
            name="username"
            type="text"
            placeholder="ej: juanito10"
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <p className="text-xs text-muted-foreground mt-1">Solo letras, números y guión bajo</p>
        </div>

        <div>
          <label className="label-text block mb-2">Correo electrónico</label>
          <input
            name="email"
            type="email"
            placeholder="tu@correo.com"
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            required
            autoCapitalize="none"
          />
        </div>

        <div>
          <label className="label-text block mb-2">Contraseña</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              required
              minLength={6}
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

        {error && (
          <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="text-accent hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Volver</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <Suspense>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
