'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitWaitlist, type WaitlistAudience } from '@/lib/marketing/waitlist'

const ERROR_COPY: Record<string, string> = {
  invalid_email: 'Email inválido. Revisa el formato.',
  invalid_audience: 'Audiencia inválida.',
}

export function WaitlistForm({
  audience,
  source,
  placeholder = 'tu@email.com',
  successCopy = 'Listo. Te avisamos cuando haya novedades.',
  compact = false,
  variant = 'default',
}: {
  audience: WaitlistAudience
  source: string
  placeholder?: string
  successCopy?: string
  /** Layout: input + button on the same row vs stacked block. */
  compact?: boolean
  /** `on-accent` flips colors when rendered inside a lime-yellow CTA band. */
  variant?: 'default' | 'on-accent'
}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, startTransition] = useTransition()

  const isOnAccent = variant === 'on-accent'

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Email inválido. Revisa el formato.')
      return
    }
    startTransition(async () => {
      const utm = readUtmFromBrowser()
      const res = await submitWaitlist({ email: email.trim(), audience, source, utm })
      if ('ok' in res) {
        setSuccess(true)
      } else if ('error' in res) {
        setError(ERROR_COPY[res.error] ?? 'No se pudo guardar. Probá de nuevo.')
      }
    })
  }

  if (success) {
    return (
      <div
        className={cn(
          'rounded-xl border p-4 flex items-center gap-3',
          isOnAccent
            ? 'border-black/20 bg-black/5 text-black'
            : 'border-accent/30 bg-accent/5 text-white',
        )}
      >
        <Check className={cn('h-5 w-5 shrink-0', isOnAccent ? 'text-black' : 'text-accent')} />
        <p className="text-sm leading-relaxed">{successCopy}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className={cn('flex gap-2', compact ? 'flex-col sm:flex-row' : 'flex-col')}>
        <input
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className={cn(
            'flex-1 rounded-xl px-4 py-3 text-base font-sans focus:outline-none focus:ring-2',
            isOnAccent
              ? 'bg-black/5 border border-black/15 text-black placeholder:text-black/40 focus:ring-black'
              : 'bg-card border border-border text-white placeholder:text-white/30 focus:ring-accent',
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-display uppercase tracking-wide text-sm transition-all active:scale-[0.98] disabled:opacity-60',
            isOnAccent
              ? 'bg-black text-white hover:bg-black/90'
              : 'bg-accent text-accent-foreground hover:bg-[#BFE600]',
          )}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {pending ? 'Enviando' : 'Anotarme'}
        </button>
      </div>
      {error && (
        <p
          className={cn(
            'mt-2 text-xs',
            isOnAccent ? 'text-red-700' : 'text-red-400',
          )}
        >
          {error}
        </p>
      )}
      <p
        className={cn(
          'mt-2 text-[10px] leading-relaxed',
          isOnAccent ? 'text-black/50' : 'text-white/30',
        )}
      >
        Al anotarte aceptas que te contactemos sobre LaPizarra.{' '}
        <a
          href="/privacidad"
          className={cn(
            'underline',
            isOnAccent ? 'text-black/70 hover:text-black' : 'text-white/50 hover:text-white/70',
          )}
        >
          Privacidad
        </a>
        .
      </p>
    </form>
  )
}

function readUtmFromBrowser(): Record<string, string> | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const params = new URLSearchParams(window.location.search)
    const utm: Record<string, string> = {}
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = params.get(key)
      if (v) utm[key] = v
    }
    return Object.keys(utm).length > 0 ? utm : undefined
  } catch {
    return undefined
  }
}
