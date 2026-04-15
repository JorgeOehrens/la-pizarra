"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  "Liga Amateur",
  "Fútbol 7",
  "Fútbol Sala",
  "Veteranos",
  "Empresas",
  "Otro",
]

export default function CreateTeamPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      setStep(2)
      return
    }
    
    setIsLoading(true)
    // Simulate team creation
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push("/home")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <Link 
          href={step === 1 ? "/" : "#"} 
          onClick={(e) => {
            if (step > 1) {
              e.preventDefault()
              setStep(step - 1)
            }
          }}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Volver</span>
        </Link>
        
        {/* Step indicator */}
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={cn(
                "w-8 h-1 rounded-full transition-colors",
                s <= step ? "bg-accent" : "bg-muted"
              )}
            />
          ))}
        </div>
        
        <div className="w-16" /> {/* Spacer */}
      </header>

      <div className="flex-1 flex flex-col px-6 pb-12">
        {step === 1 ? (
          <>
            {/* Step 1: Basic Info */}
            <div className="mb-8 pt-4">
              <p className="label-text mb-2">Paso 1 de 2</p>
              <h1 className="font-display text-3xl mb-2">Crear equipo</h1>
              <p className="text-muted-foreground text-sm">Información básica de tu equipo</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="space-y-6 flex-1">
                {/* Logo Upload */}
                <div>
                  <label className="label-text block mb-2">Escudo del equipo</label>
                  <button
                    type="button"
                    className="w-24 h-24 rounded-xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-accent transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase">Subir</span>
                  </button>
                </div>

                {/* Team Name */}
                <div>
                  <label className="label-text block mb-2">Nombre del equipo</label>
                  <input
                    type="text"
                    placeholder="Ej: La Máquina FC"
                    className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="label-text block mb-3">Categoría</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm transition-colors",
                          selectedCategory === cat
                            ? "bg-accent text-accent-foreground"
                            : "bg-card text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover mt-8"
              >
                Continuar
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Step 2: Customize */}
            <div className="mb-8 pt-4">
              <p className="label-text mb-2">Paso 2 de 2</p>
              <h1 className="font-display text-3xl mb-2">Personalizar</h1>
              <p className="text-muted-foreground text-sm">Colores y detalles adicionales</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="space-y-6 flex-1">
                {/* Team Colors */}
                <div>
                  <label className="label-text block mb-3">Colores del equipo</label>
                  <div className="flex gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Principal</p>
                      <button
                        type="button"
                        className="w-12 h-12 rounded-lg bg-accent border-2 border-border"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Secundario</p>
                      <button
                        type="button"
                        className="w-12 h-12 rounded-lg bg-foreground border-2 border-border"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="label-text block mb-2">Ciudad (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Madrid"
                    className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="label-text block mb-2">Descripción (opcional)</label>
                  <textarea
                    placeholder="Cuéntanos sobre tu equipo..."
                    rows={3}
                    className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {isLoading ? "Creando equipo..." : "Crear equipo"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
