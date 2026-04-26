/**
 * Minimal PostHog wrapper — no SDK, no extra deps.
 *
 * Why hand-rolled? V1 only needs `capture` (event tracking). The official
 * `posthog-js` SDK adds ~30 KB for autocapture, session replay, feature
 * flags — none of which we need yet. Direct fetch to the capture endpoint
 * gives us a clean wire format and a tiny bundle. We can swap to the SDK
 * later without changing call sites.
 *
 * Configuration via env:
 *   NEXT_PUBLIC_POSTHOG_KEY  — project API key (public, by design)
 *   NEXT_PUBLIC_POSTHOG_HOST — defaults to https://us.i.posthog.com
 *
 * Behavior when no key is set:
 *   - All track() calls become silent no-ops.
 *   - In development we log a one-line debug to the console so callers
 *     can verify the tracking call was made.
 *
 * Tracking failures NEVER throw. Marketing surfaces and product flows
 * must keep working even if PostHog is down.
 */

const DEFAULT_HOST = 'https://us.i.posthog.com'

type TrackProps = Record<string, string | number | boolean | null | undefined>

type CommonContext = {
  /** Distinct ID — usually auth user id, or anonymous client-side id. */
  distinctId?: string
  /** Optional override for the "$current_url" property. */
  url?: string
}

function getKey(): string | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  return key && key.length > 0 ? key : null
}

function getHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_HOST
}

/**
 * Server-side or client-side fire-and-forget tracking call.
 * Safe to call from anywhere; never throws.
 */
export async function track(
  event: string,
  props: TrackProps = {},
  ctx: CommonContext = {},
): Promise<void> {
  const key = getKey()
  if (!key) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('[analytics] skipped (no PostHog key)', event, props)
    }
    return
  }

  // Resolve a distinct id. Server callers should pass it explicitly. Client
  // callers may also pass an anonymous id stored in localStorage.
  const distinctId = ctx.distinctId ?? 'anonymous'

  const payload = {
    api_key: key,
    event,
    distinct_id: distinctId,
    properties: {
      ...props,
      ...(ctx.url ? { $current_url: ctx.url } : {}),
      $lib: 'lapizarra-mini',
      $lib_version: '0.1.0',
    },
    timestamp: new Date().toISOString(),
  }

  try {
    await fetch(`${getHost()}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Best-effort; do not block server actions.
      keepalive: true,
    })
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[analytics] track failed', event, err)
    }
  }
}

/**
 * Client-side identify helper. Call once on login to associate an anonymous
 * session with the auth user id going forward. Safe to call multiple times.
 *
 * Note: server-side identify is not supported here; for server events use
 * `track(event, props, { distinctId: userId })` directly.
 */
export async function identifyClient(userId: string, traits: TrackProps = {}): Promise<void> {
  const key = getKey()
  if (!key || typeof window === 'undefined') return

  try {
    await fetch(`${getHost()}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event: '$identify',
        distinct_id: userId,
        properties: { ...traits, $set: traits },
      }),
      keepalive: true,
    })
  } catch {
    // ignore
  }
}
