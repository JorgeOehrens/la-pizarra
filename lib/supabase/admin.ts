import { createClient } from "@supabase/supabase-js"

/**
 * Admin client with service role key — bypasses RLS.
 * Only usable in server-side code (Server Actions, API routes).
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local to enable manual account creation."
    )
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export function isAdminClientAvailable(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}
