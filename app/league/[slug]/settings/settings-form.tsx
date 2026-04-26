'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Globe, Lock, UserCheck, Upload, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateLeagueSettings, deleteLeague } from './actions'

const COLORS = [
  '#16a34a', '#dc2626', '#2563eb', '#9333ea',
  '#ea580c', '#0891b2', '#ca8a04', '#db2777',
  '#000000', '#ffffff',
]

const VISIBILITY_OPTIONS = [
  { value: 'private',  label: 'Privada',    desc: 'Solo miembros invitados.' },
  { value: 'unlisted', label: 'No listada', desc: 'Visible con link directo.' },
  { value: 'public',   label: 'Pública',    desc: 'Aparece en directorio.' },
] as const

const JOIN_MODE_OPTIONS = [
  { value: 'invite_only', label: 'Solo invitación', icon: Lock,      desc: 'Solo con link o código.' },
  { value: 'request',     label: 'Solicitud',       icon: UserCheck, desc: 'El admin aprueba cada equipo.' },
  { value: 'open',        label: 'Abierto',         icon: Globe,     desc: 'Cualquier equipo puede unirse.' },
] as const

type League = {
  id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
  visibility: 'public' | 'unlisted' | 'private'
  join_mode: 'open' | 'request' | 'invite_only'
}

export function SettingsForm({ league, isOwner }: { league: League; isOwner: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(league.logo_url)
  const [name, setName] = useState(league.name)
  const [description, setDescription] = useState(league.description ?? '')
  const [primaryColor, setPrimaryColor] = useState(league.primary_color)
  const [secondaryColor, setSecondaryColor] = useState(league.secondary_color)
  const [visibility, setVisibility] = useState(league.visibility)
  const [joinMode, setJoinMode] = useState(league.join_mode)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function clearLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function submit() {
    setError(null)
    setSuccess(false)

    const fd = new FormData()
    fd.append('name', name)
    fd.append('description', description)
    fd.append('primary_color', primaryColor)
    fd.append('secondary_color', secondaryColor)
    fd.append('visibility', visibility)
    fd.append('join_mode', joinMode)
    if (logoFile) fd.append('logo', logoFile)

    startTransition(async () => {
      const res = await updateLeagueSettings(league.id, league.slug, fd)
      if ('error' in res) setError(res.error)
      else setSuccess(true)
    })
  }

  function handleDelete() {
    if (!isOwner) return
    const phrase = `eliminar ${league.name}`
    const input = prompt(`Para borrar la liga, escribí: ${phrase}`)
    if (input !== phrase) return
    setError(null)
    startTransition(async () => {
      const res = await deleteLeague(league.id)
      if ('error' in res) setError(res.error)
    })
  }

  return (
    <div className="space-y-6">
      {/* Logo + name + description */}
      <section className="bg-card rounded-xl p-5 border border-border/40 space-y-4">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleLogoChange}
          />
          {logoPreview ? (
            <div className="relative w-16 h-16">
              <Image src={logoPreview} alt="Logo" fill className="rounded-xl object-cover" />
              <button
                type="button"
                onClick={clearLogo}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl bg-background border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-accent transition-colors"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-accent uppercase tracking-wider"
          >
            {logoPreview ? 'Cambiar logo' : 'Subir logo'}
          </button>
        </div>

        <div>
          <label className="label-text block mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="label-text block mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={240}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            placeholder="¿De qué se trata tu liga?"
          />
        </div>
      </section>

      {/* Colors */}
      <section className="bg-card rounded-xl p-5 border border-border/40 space-y-4">
        <div>
          <label className="label-text block mb-3">Color principal</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPrimaryColor(c)}
                className={cn(
                  'w-8 h-8 rounded-lg border-2 transition-transform',
                  primaryColor === c ? 'border-accent scale-110' : 'border-border',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="label-text block mb-3">Color secundario</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSecondaryColor(c)}
                className={cn(
                  'w-8 h-8 rounded-lg border-2 transition-transform',
                  secondaryColor === c ? 'border-accent scale-110' : 'border-border',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Visibility */}
      <section className="bg-card rounded-xl p-5 border border-border/40">
        <h2 className="font-display text-base mb-1">Visibilidad</h2>
        <p className="text-xs text-muted-foreground mb-3">Quién puede ver tu liga.</p>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => {
            const isActive = visibility === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVisibility(opt.value)}
                className={cn(
                  'w-full flex flex-col gap-0.5 p-3 rounded-lg border text-left transition-all',
                  isActive ? 'bg-accent/10 border-accent/40' : 'bg-background border-border/40 hover:border-border',
                )}
              >
                <span className={cn('text-sm font-medium', isActive && 'text-accent')}>{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Join mode */}
      <section className="bg-card rounded-xl p-5 border border-border/40">
        <h2 className="font-display text-base mb-1">Modo de acceso de equipos</h2>
        <p className="text-xs text-muted-foreground mb-3">Cómo se incorporan los equipos a la liga.</p>
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
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                  isActive ? 'bg-accent/10 border-accent/40' : 'bg-background border-border/40 hover:border-border',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-accent' : 'text-muted-foreground')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', isActive && 'text-accent')}>{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>
      )}

      {success && (
        <p className="text-sm text-accent bg-accent/10 rounded-lg px-4 py-3">
          Cambios guardados.
        </p>
      )}

      <button
        onClick={submit}
        disabled={pending || !name.trim()}
        className="w-full bg-accent text-accent-foreground py-3 rounded-lg uppercase tracking-wider text-sm disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </button>

      {isOwner && (
        <section className="bg-destructive/5 rounded-xl p-5 border border-destructive/20">
          <h2 className="font-display text-base text-destructive mb-1">Zona de peligro</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Borrar la liga es irreversible. Todos los datos asociados quedarán inaccesibles.
          </p>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 bg-destructive text-white py-2.5 rounded-lg uppercase tracking-wider text-xs disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Borrar liga
          </button>
        </section>
      )}
    </div>
  )
}
