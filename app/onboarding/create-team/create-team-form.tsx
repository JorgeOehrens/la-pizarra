"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createTeam } from "@/app/onboarding/actions"

const COLORS = [
  "#16a34a", "#dc2626", "#2563eb", "#9333ea",
  "#ea580c", "#0891b2", "#ca8a04", "#db2777",
  "#000000", "#ffffff",
]

export function CreateTeamForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [teamName, setTeamName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState("#16a34a")
  const [secondaryColor, setSecondaryColor] = useState("#ffffff")

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleCreate() {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("name", teamName)
    formData.append("primary_color", primaryColor)
    formData.append("secondary_color", secondaryColor)
    if (logoFile) formData.append("logo", logoFile)

    const result = await createTeam(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1)
            else router.back()
          }}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Volver</span>
        </button>

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

        <div className="w-16" />
      </header>

      <div className="flex-1 flex flex-col px-6 pb-12 max-w-lg mx-auto w-full">
        {step === 1 ? (
          <>
            <div className="mb-8 pt-4">
              <p className="label-text mb-2">Paso 1 de 2</p>
              <h1 className="font-display text-3xl mb-2">Crear equipo</h1>
              <p className="text-muted-foreground text-sm">Información básica de tu equipo</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              {/* Logo */}
              <div>
                <label className="label-text block mb-2">Escudo del equipo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                {logoPreview ? (
                  <div className="relative w-24 h-24">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-accent transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase">Subir</span>
                  </button>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="label-text block mb-2">Nombre del equipo</label>
                <input
                  type="text"
                  placeholder="Ej: La Máquina FC"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  maxLength={50}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!teamName.trim()) return
                setStep(2)
              }}
              disabled={!teamName.trim()}
              className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continuar
            </button>
          </>
        ) : (
          <>
            <div className="mb-8 pt-4">
              <p className="label-text mb-2">Paso 2 de 2</p>
              <h1 className="font-display text-3xl mb-2">Personalizar</h1>
              <p className="text-muted-foreground text-sm">Colores de tu equipo</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              {/* Color principal */}
              <div>
                <label className="label-text block mb-3">Color principal</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setPrimaryColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-transform",
                        primaryColor === color ? "border-accent scale-110" : "border-border"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Color secundario */}
              <div>
                <label className="label-text block mb-3">Color secundario</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSecondaryColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-transform",
                        secondaryColor === color ? "border-accent scale-110" : "border-border"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ backgroundColor: primaryColor }}
              >
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo"
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg border-2"
                    style={{ borderColor: secondaryColor, backgroundColor: secondaryColor + "33" }}
                  />
                )}
                <span
                  className="font-display text-xl font-bold"
                  style={{ color: secondaryColor }}
                >
                  {teamName}
                </span>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? "Creando equipo..." : "Crear equipo"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
