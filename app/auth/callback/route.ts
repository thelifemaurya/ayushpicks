import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, SITE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/config'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/admin'
  const safeNext = next === '/admin' ? '/admin' : '/admin'

  if (!code) {
    return NextResponse.redirect(new URL('/admin?error=missing_code', SITE_URL))
  }

  const response = NextResponse.redirect(new URL(safeNext, SITE_URL))
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(error.message)}`, SITE_URL))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/admin?error=unauthorized', SITE_URL))
  }

  return response
}
