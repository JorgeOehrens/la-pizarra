import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { unsubscribeWaitlist } from '@/lib/marketing/waitlist'

type Params = Promise<{ token: string }>

export const metadata: Metadata = {
  title: 'Darse de baja · LaPizarra',
  description: 'Eliminamos tu email de la lista de espera de LaPizarra.',
}

// Tokens are UUIDs — basic syntactic check before hitting the RPC.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function WaitlistUnsubscribePage({ params }: { params: Params }) {
  const { token } = await params

  let success = false
  let error: string | null = null

  if (!UUID_RE.test(token)) {
    error = 'Token inválido.'
  } else {
    const res = await unsubscribeWaitlist(token)
    if ('ok' in res) {
      success = true
    } else if ('error' in res) {
      error =
        res.error === 'token_not_found'
          ? 'Este link ya no está activo. Probablemente ya te diste de baja.'
          : 'No pudimos darte de baja. Probá de nuevo o escribinos.'
    }
  }

  return (
    <div className="min-h-[100dvh] bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border/30 rounded-2xl p-8 text-center">
        {success ? (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-accent/15 text-accent flex items-center justify-center mb-4">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl mb-3">Listo, te dimos de baja.</h1>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              No te vamos a escribir más. Si en algún momento querés volver, siempre podés anotarte de nuevo desde la página.
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-destructive/15 text-destructive flex items-center justify-center mb-4">
              <X className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl mb-3">No pudimos completar la baja.</h1>
            <p className="text-sm text-white/60 leading-relaxed mb-6">{error}</p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-white/15 text-white text-xs uppercase tracking-[0.18em] hover:border-white/30"
          >
            Volver al inicio
          </Link>
          <a
            href="mailto:hola@lapizarra.app"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-accent-foreground text-xs uppercase tracking-[0.18em] hover:bg-[#BFE600]"
          >
            Escribirnos
          </a>
        </div>
      </div>
    </div>
  )
}
