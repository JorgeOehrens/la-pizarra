import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Action shape used everywhere in the app.
 *
 * We deliberately keep `ok`/`error` discriminated by the presence of a
 * single key so callers can do `if ('ok' in res)` without juggling status
 * codes. This mirrors what server actions return to client components.
 */
export type ActionResult<T = unknown> = { ok: true; data?: T } | { error: string }

/**
 * Normalises Supabase RPC responses into an `ActionResult`.
 *
 * Most of our RPCs are SECURITY DEFINER functions that return either:
 *   - a `jsonb` envelope with an `error` key on validation failures, or
 *   - a `jsonb` payload on success.
 *
 * This helper unifies the two failure modes (Postgrest error vs. RPC-level
 * error envelope) so calling code stays a one-liner.
 *
 *   const res = unwrapRpc(await supabase.rpc('foo', { ... }))
 *   if ('error' in res) return res
 */
export function unwrapRpc<T = unknown>(
  result: { data: unknown; error: PostgrestError | null },
): ActionResult<T> {
  if (result.error) return { error: result.error.message }
  const data = result.data as { error?: string } | T | null
  if (data && typeof data === 'object' && 'error' in data && typeof (data as { error?: unknown }).error === 'string') {
    return { error: (data as { error: string }).error }
  }
  return { ok: true, data: (data ?? undefined) as T | undefined }
}
