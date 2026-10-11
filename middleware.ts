import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/config'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Keep the public admin sign-in page reachable. Every nested admin route is private.
  if (pathname === '/admin') return NextResponse.next()

  if (pathname.startsWith('/admin/')) {
    let response = NextResponse.next({ request })
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
