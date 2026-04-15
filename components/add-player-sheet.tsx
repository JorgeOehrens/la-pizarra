"use client"

import { useState, useTransition } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Mail,
  Copy,
  Check,
  ChevronLeft,
  Link2,
  Loader2,
  Share2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateInviteLink } from "./add-player-actions"

type FlowStep = "options" | "link"

interface AddPlayerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  isAdmin: boolean
}

export function AddPlayerSheet({ open, onOpenChange, teamId }: AddPlayerSheetProps) {
  const [step, setStep] = useState<FlowStep>("options")

  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [isGenerating, startGenerating] = useTransition()

  const inviteUrl = inviteToken
    ? `${typeof window !== "undefined" ? window.location.origin : "https://lapizarra.app"}/join/${inviteToken}`
    : null

  function handleGoToLink() {
    setStep("link")
    setLinkError(null)
    setLinkCopied(false)
    setCodeCopied(false)
    if (!inviteToken) {
      startGenerating(async () => {
        const result = await generateInviteLink(teamId)
        if ("error" in result) {
          setLinkError(result.error)
        } else {
          setInviteToken(result.token)
          setInviteCode(result.code)
        }
      })
    }
  }

  async function handleCopyCode() {
    if (!inviteCode) return
    try { await navigator.clipboard.writeText(inviteCode) } catch {}
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2500)
  }

  async function handleCopyLink() {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = inviteUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  async function handleShare() {
    if (!inviteUrl) return
    if (navigator.share) {
      await navigator.share({ title: "Únete al equipo", url: inviteUrl }).catch(() => {})
    } else {
      handleCopyLink()
    }
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(() => {
      setStep("options")
      setLinkError(null)
      setLinkCopied(false)
      setCodeCopied(false)
      // Keep token/code cached so we don't regenerate on reopen
    }, 300)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-0 bg-card px-0 pb-10 pt-0 max-h-[85vh] overflow-hidden"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        {/* ── OPTIONS ── */}
        {step === "options" && (
          <div className="px-6 pt-4">
            <SheetHeader className="p-0 mb-7">
              <SheetTitle className="font-display text-3xl uppercase text-left tracking-tight">
                Agregar jugador
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-3">
              {/* Copiar link — active */}
              <button
                onClick={handleGoToLink}
                className="w-full bg-background rounded-2xl p-5 text-left active:scale-[0.98] transition-all border border-transparent hover:border-accent/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                    <Link2 className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg uppercase mb-0.5 tracking-tight">
                      Copiar link
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Compartir link de invitación
                    </p>
                  </div>
                </div>
              </button>

              {/* Invitar por correo — coming soon */}
              <div
                className="w-full bg-background/50 rounded-2xl p-5 border border-border/30 opacity-50 cursor-not-allowed"
                aria-disabled="true"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-display text-lg uppercase tracking-tight text-muted-foreground/70">
                        Invitar por correo
                      </h3>
                      <span className="text-[10px] uppercase tracking-widest bg-muted text-muted-foreground/60 px-2 py-0.5 rounded-full border border-border/30 font-medium leading-none">
                        Próximamente
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/50">
                      Disponible en una próxima versión
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LINK ── */}
        {step === "link" && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 mb-7">
              <button
                onClick={() => setStep("options")}
                className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="font-display text-2xl uppercase tracking-tight">
                Link de invitación
              </h2>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm text-muted-foreground">Generando link…</p>
              </div>
            ) : linkError ? (
              <div className="bg-destructive/10 rounded-2xl p-4">
                <p className="text-sm text-destructive">{linkError}</p>
              </div>
            ) : inviteUrl ? (
              <div className="space-y-4">
                {/* Code — hero */}
                <div className="bg-background rounded-2xl p-5 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    Código del equipo
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-display text-5xl tracking-[0.25em] text-accent">
                      {inviteCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        codeCopied
                          ? "bg-accent/20 text-accent"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Comparte este código o el link completo
                  </p>
                </div>

                {/* Link row */}
                <div className="bg-background rounded-2xl px-4 py-3 flex items-center gap-2">
                  <p className="flex-1 text-xs text-muted-foreground truncate font-mono">
                    {inviteUrl}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      "flex-1 py-4 rounded-2xl font-display uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                      linkCopied
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {linkCopied ? (
                      <><Check className="h-4 w-4" />Copiado</>
                    ) : (
                      <><Copy className="h-4 w-4" />Copiar link</>
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-4 rounded-2xl font-display uppercase text-sm tracking-wider flex items-center justify-center gap-2 bg-accent text-accent-foreground active:scale-[0.98] transition-all"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </button>
                </div>

                <p className="text-xs text-muted-foreground/50 text-center">
                  Válido 30 días · Cualquier jugador puede usarlo
                </p>
              </div>
            ) : null}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
