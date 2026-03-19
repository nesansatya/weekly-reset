'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setChecked(true)
    })
  }, [])

  if (!checked) return (
    <div style={{
      minHeight: '100dvh', background: '#faf8f4',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column',
      fontFamily: "'DM Sans', Arial, sans-serif",
    }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>🌿</div>
      <div style={{ fontSize: 13, color: '#7a7a72' }}>Loading...</div>
    </div>
  )

  return <>{children}</>
}