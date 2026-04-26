'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { unwrapRpc, type ActionResult } from '@/lib/rpc'
import { track } from '@/lib/analytics'
import { sendEmail, waitlistConfirmationHtml } from '@/lib/marketing/email'

export type WaitlistAudience = 'ligas' | 'equipos' | 'jugadores' | 'general'

type SubmitInput = {
  email: string
  audience: WaitlistAudience
  source?: string
  utm?: Record<string, string | undefined>
}

/**
 * Persist a waitlist intent and (best-effort) send a confirmation email.
 *
 * - Email is normalised + validated server-side via the RPC.
 * - Duplicates per (email, audience) are silently merged.
 * - Email send failures do NOT bubble up to the caller — the user
 *   already saw the success state. Failures are logged.
 */
export async function submitWaitlist(input: SubmitInput): Promise<ActionResult<{ unsubscribe_token: string }>> {
  const supabase = await createClient()

  const res = unwrapRpc<{ unsubscribe_token: string }>(
    await supabase.rpc('submit_marketing_waitlist', {
      p_email: input.email,
      p_audience: input.audience,
      p_source: input.source ?? null,
      p_utm: input.utm ?? null,
    }),
  )

  if ('error' in res) return res

  // Track conversion event (best-effort). Email stays out of analytics —
  // audience and source are the signals we care about.
  void track('waitlist_submit', {
    audience: input.audience,
    source: input.source,
    utm_source: input.utm?.utm_source,
    utm_medium: input.utm?.utm_medium,
    utm_campaign: input.utm?.utm_campaign,
  }).catch(() => undefined)

  // Best-effort confirmation email. The host header lets us link to the
  // canonical environment (preview vs prod) without hardcoding a domain.
  const token = res.data?.unsubscribe_token
  if (token) {
    const h = await headers()
    const proto = h.get('x-forwarded-proto') ?? 'https'
    const host = h.get('host') ?? 'lapizarra.app'
    const origin = `${proto}://${host}`
    const unsubscribeUrl = `${origin}/waitlist/unsubscribe/${token}`
    const { subject, html } = waitlistConfirmationHtml({
      audience: input.audience,
      unsubscribeUrl,
      appUrl: origin,
    })
    // Fire-and-forget; never throw.
    void sendEmail({ to: input.email, subject, html }).catch(() => undefined)
  }

  return res
}

export async function unsubscribeWaitlist(token: string): Promise<ActionResult> {
  const supabase = await createClient()
  return unwrapRpc(await supabase.rpc('unsubscribe_waitlist', { p_token: token }))
}
