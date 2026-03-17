'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from './lib/supabase/client'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/dashboard')
    })
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#1a1a18',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', Arial, sans-serif",
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 340, height: 340,
        borderRadius: '50%', background: '#7db84a',
        opacity: 0.06, top: -80, right: -80,
      }}/>
      <div style={{
        position: 'absolute', width: 200, height: 200,
        borderRadius: '50%', background: '#7db84a',
        opacity: 0.06, bottom: 120, left: -60,
      }}/>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 400, width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(125,184,74,0.15)',
          border: '1px solid rgba(125,184,74,0.3)',
          borderRadius: 30, padding: '5px 14px', marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7db84a' }}/>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7db84a', letterSpacing: '0.04em' }}>
            No gym required
          </span>
        </div>

        <h1 style={{
          fontSize: 42, fontWeight: 700, color: 'white',
          lineHeight: 1.1, marginBottom: 16,
          fontFamily: "'DM Serif Display', Georgia, serif",
        }}>
          Reset your body.<br/>
          <span style={{ color: '#a8c48a', fontStyle: 'italic' }}>Slowly & surely.</span>
        </h1>

        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.7, marginBottom: 36,
        }}>
          A simple weekly routine built for people who want to feel better — without spending money on gyms or instructors.
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 36 }}>
          {[
            { num: '$0', label: 'Cost to start' },
            { num: '7', label: 'Day routine' },
            { num: '4w', label: 'To feel it' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '14px 10px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: 26, fontWeight: 700, color: '#a8c48a',
                fontFamily: "'DM Serif Display', Georgia, serif",
              }}>{s.num}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/signup')}
          style={{
            width: '100%', padding: '16px',
            background: '#5d9a3a', color: 'white',
            border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer', marginBottom: 12,
            fontFamily: "'DM Sans', Arial, sans-serif",
          }}>
          Start your reset — free
        </button>

        <button
          onClick={() => router.push('/login')}
          style={{
            width: '100%', padding: '14px',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14, fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'DM Sans', Arial, sans-serif",
          }}>
          Sign in
        </button>
      </div>
    </main>
  )
}
