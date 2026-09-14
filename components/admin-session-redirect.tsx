'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'
import { ADMIN_EMAIL } from '@/lib/config'

export default function AdminSessionRedirect() {
  const router = useRouter()

  useEffect(() => {
    const sb = supabaseBrowser()
    let active = true

    sb.auth.getUser().then(({ data }) => {
      if (active && data.user?.email === ADMIN_EMAIL) {
        router.replace('/admin')
      }
    })

    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        router.replace('/admin')
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [router])

  return null
}
