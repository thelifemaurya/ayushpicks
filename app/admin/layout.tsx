import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { ADMIN_EMAIL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/lib/config'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll() {},
    },
  })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    redirect('/admin')
  }

  return (
    <>
      {children}
      <Link href="/admin/ai" className="adminAiSwitch" aria-label="Open AI Product Writer">
        <span className="adminAiIcon">✦</span>
        <span>AI Writer</span>
      </Link>
      <style>{`
        .adminAiSwitch{position:fixed;right:22px;bottom:22px;z-index:50;display:flex;align-items:center;gap:8px;padding:11px 15px;border:1px solid var(--line);border-radius:999px;background:var(--panel);color:var(--text);text-decoration:none;font:800 12px Manrope,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.28);transition:transform .18s ease,border-color .18s ease,background .18s ease}
        .adminAiSwitch:hover{transform:translateY(-2px);border-color:var(--accent);background:var(--panel2)}
        .adminAiIcon{color:var(--accent);font-size:16px;line-height:1}
        @media(max-width:560px){.adminAiSwitch{right:14px;bottom:14px;padding:10px 13px;font-size:11px}}
      `}</style>
    </>
  )
}
