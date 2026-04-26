'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

/**
 * Renders a share affordance for a league with `visibility ∈ ('public','unlisted')`.
 * Tries the Web Share API first; falls back to clipboard copy.
 */
export function SharePublicLeagueButton({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/public/league/${slug}`
    const title = 'Liga en LaPizarra'

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled or share failed → fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copiá el link público:', url)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={
        className ??
        'inline-flex items-center gap-1.5 bg-card border border-border/40 hover:border-border px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider'
      }
    >
      {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Share2 className="h-3.5 w-3.5" />}
      {copied ? 'Copiado' : 'Compartir'}
    </button>
  )
}
