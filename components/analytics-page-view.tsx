'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { track } from '@/lib/analytics'

/**
 * Fires a $pageview event on every client-side route change.
 *
 * Mounted once (in the marketing layout). Server-rendered pages emit a
 * pageview on initial load via the `useEffect` first run, and subsequent
 * client navigations re-fire on pathname changes.
 *
 * Distinct id is read from / written to localStorage to keep an anonymous
 * id stable across visits without setting cookies.
 */
export function AnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    if (lastUrlRef.current === url) return
    lastUrlRef.current = url

    const distinctId = getOrCreateAnonId()

    // Best-effort — never blocks render.
    void track(
      '$pageview',
      {
        path: pathname,
        utm_source: searchParams?.get('utm_source') ?? undefined,
        utm_medium: searchParams?.get('utm_medium') ?? undefined,
        utm_campaign: searchParams?.get('utm_campaign') ?? undefined,
      },
      {
        distinctId,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
    )
  }, [pathname, searchParams])

  return null
}

function getOrCreateAnonId(): string {
  try {
    const KEY = 'lp_anon_id'
    const existing = window.localStorage.getItem(KEY)
    if (existing) return existing
    const fresh = `anon_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    return 'anonymous'
  }
}
