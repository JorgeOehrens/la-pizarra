"use client"

import { useState, useCallback } from "react"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    Fintoc?: {
      create: (opts: {
        widgetToken: string
        product: "payments"
        publicKey: string
        onSuccess: () => void
        onExit: () => void
        onError: (err: { message?: string }) => void
      }) => { open: () => void; destroy: () => void }
    }
  }
}

function loadFintocScript(): Promise<void> {
  if (window.Fintoc) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("fintoc-js")
    if (existing) { existing.addEventListener("load", () => resolve()); return }
    const script = document.createElement("script")
    script.id = "fintoc-js"
    script.src = "https://js.fintoc.com/v1/"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("No se pudo cargar Fintoc"))
    document.head.appendChild(script)
  })
}

interface FintocPayButtonProps {
  distributionIds: string[]
  totalCLP: number
  onSuccess: () => void
  onError: (msg: string) => void
}

export function FintocPayButton({
  distributionIds,
  totalCLP,
  onSuccess,
  onError,
}: FintocPayButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(async () => {
    setLoading(true)
    try {
      await loadFintocScript()

      const res = await fetch("/api/payment/fintoc-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distributionIds }),
      })
      const { widgetToken, error } = await res.json() as {
        widgetToken?: string
        error?: string
      }

      if (error || !widgetToken) {
        onError(error ?? "No se pudo iniciar el pago")
        setLoading(false)
        return
      }

      if (!window.Fintoc) {
        onError("Widget de Fintoc no disponible")
        setLoading(false)
        return
      }

      const widget = window.Fintoc.create({
        widgetToken,
        product: "payments",
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY!,
        onSuccess: () => {
          widget.destroy()
          onSuccess()
        },
        onExit: () => {
          widget.destroy()
          setLoading(false)
        },
        onError: (err) => {
          widget.destroy()
          onError(err.message ?? "Error en el pago")
          setLoading(false)
        },
      })

      widget.open()
      setLoading(false)
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error inesperado")
      setLoading(false)
    }
  }, [distributionIds, onSuccess, onError])

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full py-4 rounded-2xl font-display text-base uppercase tracking-wide flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-60"
      style={{ background: "#1B1464", color: "#fff" }}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <FintocIcon />
          Pagar con Fintoc
        </>
      )}
    </button>
  )
}

function FintocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.15" />
      <path
        d="M9 10h14M9 16h10M9 22h7"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
