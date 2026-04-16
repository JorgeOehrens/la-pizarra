"use client"

import { useEffect, useState, useCallback } from "react"
import { loadStripe, type PaymentRequest, type StripeError } from "@stripe/stripe-js"
import { Loader2 } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type WalletType = "apple_pay" | "google_pay" | "browser_card" | null

interface WalletPayButtonProps {
  distributionIds: string[]
  totalCLP: number
  label: string
  onSuccess: () => void
  onError: (msg: string) => void
}

export function WalletPayButton({
  distributionIds,
  totalCLP,
  label,
  onSuccess,
  onError,
}: WalletPayButtonProps) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)
  const [walletType, setWalletType]         = useState<WalletType>(null)
  const [loading, setLoading]               = useState(true)
  const [paying, setPaying]                 = useState(false)

  const initPaymentRequest = useCallback(async () => {
    const stripe = await stripePromise
    if (!stripe) return

    const pr = stripe.paymentRequest({
      country: "CL",
      currency: "clp",
      total: { label, amount: totalCLP },
      requestPayerName: false,
      requestPayerEmail: false,
    })

    const result = await pr.canMakePayment()
    if (!result) {
      setLoading(false)
      return
    }

    if (result.applePay) setWalletType("apple_pay")
    else if (result.googlePay) setWalletType("google_pay")
    else setWalletType("browser_card")

    pr.on("paymentmethod", async (ev) => {
      setPaying(true)
      try {
        // Create PaymentIntent
        const res = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ distributionIds }),
        })
        const { clientSecret, error: createError } = await res.json() as {
          clientSecret?: string
          error?: string
        }

        if (createError || !clientSecret) {
          ev.complete("fail")
          onError(createError ?? "Error al iniciar pago")
          setPaying(false)
          return
        }

        const stripe2 = await stripePromise
        if (!stripe2) { ev.complete("fail"); return }

        const { error, paymentIntent } = await stripe2.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        )

        if (error) {
          ev.complete("fail")
          onError(error.message ?? "Pago rechazado")
          setPaying(false)
          return
        }

        ev.complete("success")

        // If requires 3DS, let Stripe handle it
        if (paymentIntent.status === "requires_action") {
          const { error: actionError } = await stripe2.confirmCardPayment(clientSecret)
          if (actionError) {
            onError(actionError.message ?? "Error de verificación")
            setPaying(false)
            return
          }
        }

        onSuccess()
      } catch {
        ev.complete("fail")
        onError("Error inesperado")
      } finally {
        setPaying(false)
      }
    })

    setPaymentRequest(pr)
    setLoading(false)
  }, [distributionIds, label, totalCLP, onSuccess, onError])

  useEffect(() => {
    initPaymentRequest()
  }, [initPaymentRequest])

  if (loading) {
    return (
      <div className="w-full py-4 flex items-center justify-center bg-muted/40 rounded-2xl">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!paymentRequest || !walletType) return null

  return (
    <button
      onClick={() => { if (!paying) paymentRequest.show() }}
      disabled={paying}
      className="w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-60"
      style={
        walletType === "apple_pay"
          ? { background: "#000", color: "#fff" }
          : { background: "#1a73e8", color: "#fff" }
      }
    >
      {paying ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : walletType === "apple_pay" ? (
        <>
          <ApplePayMark />
          <span className="text-white font-medium" style={{ fontFamily: "-apple-system, sans-serif" }}>
             Pay
          </span>
        </>
      ) : walletType === "google_pay" ? (
        <>
          <GooglePayMark />
        </>
      ) : (
        <span>Pagar con tarjeta</span>
      )}
    </button>
  )
}

function ApplePayMark() {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden>
      <path
        d="M11.5 3.5c.7-.8 1.1-1.9 1-3-.9.1-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9.9.1 2-.5 2.7-1.3z"
        fill="white"
      />
      <path
        d="M12.5 5c-1.5-.1-2.8.9-3.5.9-.7 0-1.8-.8-2.9-.8C4.6 5.2 3 6.3 2.2 8c-1.6 2.8-.4 7 1.1 9.3.7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 2-1.1 2.7-2.2.8-1.2 1.1-2.4 1.1-2.4s-2.2-.8-2.2-3.3c0-2.1 1.8-3.1 1.8-3.1s-1-1.5-2.5-1.5z"
        fill="white"
      />
    </svg>
  )
}

function GooglePayMark() {
  return (
    <svg width="58" height="24" viewBox="0 0 58 24" aria-hidden>
      <text x="0" y="18" fontSize="16" fontWeight="500" fontFamily="'Roboto', sans-serif" fill="white">
        G Pay
      </text>
    </svg>
  )
}

export type { StripeError }
