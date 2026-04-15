"use client"

import { useState } from "react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from "@/components/ui/sheet"
import { 
  Mail, 
  UserPlus, 
  Copy, 
  Check,
  ChevronLeft,
  Send,
  Link2
} from "lucide-react"
import { cn } from "@/lib/utils"

type FlowStep = "options" | "link" | "invite" | "manual" | "success"

interface AddPlayerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const positions = [
  { value: "portero", label: "POR", fullLabel: "Portero" },
  { value: "defensa", label: "DEF", fullLabel: "Defensa" },
  { value: "mediocampista", label: "MED", fullLabel: "Mediocampista" },
  { value: "delantero", label: "DEL", fullLabel: "Delantero" },
]

// Get next available number (mock - would come from existing players)
const usedNumbers = [1, 4, 5, 8, 9, 10]
const getNextAvailableNumber = () => {
  for (let i = 1; i <= 99; i++) {
    if (!usedNumbers.includes(i)) return i
  }
  return 99
}

const suggestedNumbers = [7, 11, 14, 23, 6, 3].filter(n => !usedNumbers.includes(n)).slice(0, 4)

// Generate random team code
const generateTeamCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function AddPlayerSheet({ open, onOpenChange }: AddPlayerSheetProps) {
  const [step, setStep] = useState<FlowStep>("options")
  const [inviteEmail, setInviteEmail] = useState("")
  const [teamCode] = useState(generateTeamCode())
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    number: getNextAvailableNumber().toString(),
  })

  const inviteLink = `lapizarra.app/join/${teamCode}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${inviteLink}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = `https://${inviteLink}`
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(teamCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmitInvite = () => {
    // Mock submit - would call API to send email invite
    setStep("success")
    setTimeout(() => {
      onOpenChange(false)
      setStep("options")
      setInviteEmail("")
    }, 2000)
  }

  const handleSubmitManual = () => {
    // Mock submit - would call API to create player
    setStep("success")
    setTimeout(() => {
      onOpenChange(false)
      setStep("options")
      setFormData({
        name: "",
        position: "",
        number: getNextAvailableNumber().toString(),
      })
    }, 2000)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep("options")
      setInviteEmail("")
      setFormData({
        name: "",
        position: "",
        number: getNextAvailableNumber().toString(),
      })
    }, 300)
  }

  const handleBack = () => {
    setStep("options")
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl border-0 bg-card px-0 pb-8 pt-0 max-h-[90vh] overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        {step === "options" && (
          <div className="px-6">
            <SheetHeader className="p-0 mb-8">
              <SheetTitle className="font-display text-3xl uppercase text-left tracking-tight">
                Agregar Jugador
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4">
              {/* Option 1: Copy Invite Link */}
              <button
                onClick={() => setStep("link")}
                className="w-full bg-background rounded-2xl p-6 text-left active:scale-[0.98] transition-all group border border-transparent hover:border-accent/20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                    <Link2 className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl uppercase mb-1 tracking-tight">
                      Copiar link
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Compartir código de invitación
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Invite with Email */}
              <button
                onClick={() => setStep("invite")}
                className="w-full bg-background rounded-2xl p-6 text-left active:scale-[0.98] transition-all group border border-transparent hover:border-accent/20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl uppercase mb-1 tracking-tight">
                      Invitar por correo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enviar invitación por email
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 3: Add Manually */}
              <button
                onClick={() => setStep("manual")}
                className="w-full bg-background rounded-2xl p-6 text-left active:scale-[0.98] transition-all group border border-transparent hover:border-accent/20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl uppercase mb-1 tracking-tight">
                      Agregar manualmente
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Crear jugador directamente
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "link" && (
          <div className="px-6">
            <div className="flex items-center gap-3 mb-8">
              <button 
                onClick={handleBack}
                className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h2 className="font-display text-3xl uppercase tracking-tight">Invitar</h2>
            </div>

            <div className="space-y-6">
              {/* Team Code Display */}
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                  Código del equipo
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-display text-6xl tracking-[0.2em] text-accent">
                    {teamCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-3 rounded-xl bg-background hover:bg-accent/20 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-accent" />
                    ) : (
                      <Copy className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Invite Link */}
              <div className="bg-background rounded-2xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Link de invitación
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-card rounded-xl px-4 py-3 text-muted-foreground truncate">
                    {inviteLink}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      "shrink-0 px-5 py-3 rounded-xl font-display uppercase text-sm tracking-wide transition-all",
                      copied 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-muted hover:bg-accent/20"
                    )}
                  >
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
                <p className="text-sm text-accent leading-relaxed">
                  Comparte este código o link con el jugador. Podrá unirse al equipo y completar su perfil.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "invite" && (
          <div className="px-6">
            <div className="flex items-center gap-3 mb-8">
              <button 
                onClick={handleBack}
                className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h2 className="font-display text-3xl uppercase tracking-tight">Invitar</h2>
            </div>

            <div className="space-y-6">
              {/* Email Input - Large and Prominent */}
              <div>
                <label className="block font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Correo del jugador
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jugador@email.com"
                  autoFocus
                  className="w-full bg-background rounded-2xl px-6 py-5 text-xl placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              {/* Info Note */}
              <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
                <p className="text-sm text-accent leading-relaxed">
                  El jugador recibirá un correo con un link para registrarse y completar su perfil.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleSubmitInvite}
              disabled={!inviteEmail || !inviteEmail.includes("@")}
              className="w-full bg-accent text-accent-foreground font-display text-xl uppercase py-5 rounded-2xl mt-8 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Send className="h-5 w-5" />
              Enviar invitación
            </button>
          </div>
        )}

        {step === "manual" && (
          <div className="px-6 overflow-y-auto max-h-[75vh]">
            <div className="flex items-center gap-3 mb-8">
              <button 
                onClick={handleBack}
                className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h2 className="font-display text-3xl uppercase tracking-tight">Crear jugador</h2>
            </div>

            <div className="space-y-8">
              {/* Name - Large Input */}
              <div>
                <label className="block font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del jugador"
                  autoFocus
                  className="w-full bg-background rounded-2xl px-6 py-5 text-xl placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              {/* Position - Button Grid */}
              <div>
                <label className="block font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Posición
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {positions.map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, position: pos.value })}
                      className={cn(
                        "py-4 rounded-2xl font-display text-lg uppercase tracking-wider transition-all",
                        formData.position === pos.value
                          ? "bg-accent text-accent-foreground"
                          : "bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number - Visual Circle + Quick Picks */}
              <div>
                <label className="block font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Número
                </label>
                <div className="flex items-center gap-6">
                  {/* Main Number Circle */}
                  <div className="w-28 h-28 rounded-full border-4 border-accent flex items-center justify-center bg-background shrink-0">
                    <input
                      type="number"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      min="1"
                      max="99"
                      className="w-20 text-center bg-transparent font-display text-5xl focus:outline-none"
                    />
                  </div>
                  
                  {/* Quick Suggestions */}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      Disponibles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedNumbers.map((n) => (
                        <button
                          key={n}
                          onClick={() => setFormData({ ...formData, number: n.toString() })}
                          className={cn(
                            "w-12 h-12 rounded-xl font-display text-lg transition-all",
                            formData.number === n.toString()
                              ? "bg-accent text-accent-foreground"
                              : "bg-background text-foreground hover:bg-accent/20"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleSubmitManual}
              disabled={!formData.name || !formData.position}
              className="w-full bg-accent text-accent-foreground font-display text-xl uppercase py-5 rounded-2xl mt-8 mb-4 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <UserPlus className="h-5 w-5" />
              Crear jugador
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="px-6 py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
              <Check className="h-12 w-12 text-accent-foreground" />
            </div>
            <h2 className="font-display text-3xl uppercase mb-2 tracking-tight">Listo</h2>
            <p className="text-lg text-muted-foreground">
              {inviteEmail ? "Invitación enviada" : "Jugador creado"}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
