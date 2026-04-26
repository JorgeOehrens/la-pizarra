import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = pathname.startsWith('/auth')
  // Marketing surface + auxiliary routes are reachable without a session.
  // Use an explicit allowlist (rather than a prefix like /para-) so that
  // future paths cannot leak in by accident.
  const isPublic =
    pathname === '/' ||
    pathname === '/para-ligas' ||
    pathname === '/para-equipos' ||
    pathname === '/para-jugadores' ||
    pathname === '/precios' ||
    pathname === '/terminos' ||
    pathname === '/privacidad' ||
    pathname === '/blog' ||
    pathname.startsWith('/blog/') ||
    pathname.startsWith('/waitlist/') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/join') ||
    pathname.startsWith('/public')

  // Sin sesión → redirigir a login (excepto páginas públicas)
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Con sesión → no dejar entrar a /auth
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
