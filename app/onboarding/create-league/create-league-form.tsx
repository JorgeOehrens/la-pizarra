'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Globe, Lock, UserCheck, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createLeague } from './actions'

const COLORS = [
  '#16a34a', '#dc2626', '#2563eb', '#9333ea',
  '#ea580c', '#0891b2', '#ca8a04', '#db2777',
  '#000000', '#ffffff',
]

const VISIBILITY_OPTIONS = [
  { value: 'private',  label: 'Privada',   desc: 'Solo miembros invitados ven la liga.' },
  { value: 'unlisted', label: 'No listada', desc: 'Visible con el link directo.' },
  { value: 'public',   label: 'Pública',   desc: 'Aparece en el directorio.' },
] as const

const JOIN_MODE_OPTIONS = [
  { value: 'invite_only', label: 'Solo invitación', icon: Lock,      desc: 'Solo con link o código.' },
  { value: 'request',     label: 'Solicitud',       icon: UserCheck, desc: 'El admin aprueba cada equipo.' },
  { value: 'open',        label: 'Abierto',         icon: Globe,     desc: 'Cualquier equipo puede unirse.' },
] as const

export function CreateLeagueForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#16a34a')
  const [secondaryColor, setSecondaryColor] = useState('#ffffff')
  const [visibility, setVisibility] = useState<typeof VISIBILITY_OPTIONS[number]['value']>('private')
  const [joinMode, setJoinMode] = useState<typeof JOIN_MODE_OPTIONS[number]['value']>('invite_only')

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleCreate() {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('primary_color', primaryColor)
    formData.append('secondary_color', secondaryColor)
    formData.append('visibility', visibility)
    formData.append('join_mode', joinMode)
    if (logoFile) formData.append('logo', logoFile)

    const result = await createLeague(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'w-8 h-1 rounded-full transition-colors',
                s <= step ? 'bg-accent' : 'bg-muted',
              )}
            />
          ))}
        </div>

        <div className="w-16" />
      </header>

      <div className="flex-1 flex flex-col px-6 pb-12 max-w-lg mx-auto w-full">
        {step === 1 && (
          <>
            <div className="mb-8 pt-4">
              <p className="label-text mb-2">Paso 1 de 3</p>
              <h1 className="font-display text-3xl mb-2">Crear liga</h1>
              <p className="text-muted-foreground text-sm">Información básica de tu liga.</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div>
                <label className="label-text block mb-2">Logo de la liga</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                {logoPreview ? (
                  <div className="relative w-24 h-24">
                    <Image src={logoPreview} alt="Logo preview" fill className="rounded-xl object-cover" />
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

              <div>
                <label className="label-text block mb-2">Nombre de la liga</label>
                <input
                  type="text"
                  placeholder="Ej: Liga Amateur Sur"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="label-text block mb-2">Descripción (opcional)</label>
                <textarea
                  placeholder="¿De qué se trata tu liga?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                  maxLength={240}
                />
              </div>
            </div>

            <button
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continuar
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-8 pt-4">
              <p className="label-text mb-2">Paso 2 de 3</p>
              <h1 className="font-display text-3xl mb-2">Personalizar</h1>
              <p className="text-muted-foreground text-sm">Colores e identidad visual.</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div>
                <label className="label-text block mb-3">Color principal</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPrimaryColor(c)}
                      className={cn(
                        'w-10 h-10 rounded-lg border-2 transition-transform',
                        primaryColor === c ? 'border-accent scale-110' : 'border-border',
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="label-text block mb-3">Color secundario</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSecondaryColor(c)}
                      className={cn(
                        'w-10 h-10 rounded-lg border-2 transition-transform',
                        secondaryColor === c ? 'border-accent scale-110' : 'border-border',
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: primaryColor }}>
                {logoPreview ? (
                  <Image src={logoPreview} alt="Logo" width={48} height={48} className="rounded-lg object-cover" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg border-2"
                    style={{ borderColor: secondaryColor, backgroundColor: secondaryColor + '33' }}
                  />
                )}
                <span className="font-display text-xl font-bold" style={{ color: secondaryColor }}>
                  {name || 'Mi liga'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-medium uppercase tracking-wider transition-colors hover:bg-accent-hover mt-8"
            >
              Continuar
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-8 pt-4">
              <p className="label-text mb-2">Paso 3 de 3</p>
              <h1 className="font-display text-3xl mb-2">Acceso</h1>
              <p className="text-muted-foreground text-sm">Quién puede ver y unirse a la liga.</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div>
                <label className="label-text block mb-3">Visibilidad</label>
                <div className="space-y-2">
                  {VISIBILITY_OPTIONS.map((opt) => {
                    const isActive = visibility === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setVisibility(opt.value)}
                        className={cn(
                          'w-full flex flex-col gap-1 p-4 rounded-xl border text-left transition-all',
                          isActive ? 'bg-accent/10 border-accent/40' : 'bg-card border-border/40 hover:border-border',
                        )}
                      >
                        <span className={cn('text-sm font-medium', isActive && 'text-accent')}>{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="label-text block mb-3">Modo de acceso de equipos</label>
                <div className="space-y-2">
                  {JOIN_MODE_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const isActive = joinMode === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setJoinMode(opt.value)}
                        className={cn(
                          'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                          isActive ? 'bg-accent/10 border-accent/40' : 'bg-card border-border/40 hover:border-border',
                        )}
                      >
                        <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-accent' : 'text-muted-foreground')} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium', isActive && 'text-accent')}>{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
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
              {isLoading ? 'Creando liga…' : 'Crear liga'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
