'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

const publicRoutes = ['/', '/login', '/signup']

export default function SessionWatcher() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT' && !publicRoutes.includes(pathname)) {
          router.push('/login')
        }
      }
      if (event === 'USER_UPDATED') {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  return null
}