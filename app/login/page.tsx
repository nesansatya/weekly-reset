'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const input = {
    width: '100%', padding: '13px 14px',
    border: '1.5px solid #e4e0d8', borderRadius: 9,
    fontSize: 14, marginBottom: 12,
    fontFamily: "'DM Sans', Arial, sans-serif",
    color: '#1a1a18', background: 'white', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#faf8f4',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem',
      fontFamily: "'DM Sans', Arial, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <button onClick={() => router.push('/')} style={{
          background: 'none', border: 'none',
          fontSize: 22, cursor: 'pointer',
          marginBottom: 24, color: '#3d3d3a',
        }}>←</button>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#4a7c2f', textTransform: 'uppercase', marginBottom: 6 }}>
            Welcome back
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a18', marginBottom: 6, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Sign in
          </h1>
          <p style={{ fontSize: 13, color: '#7a7a72' }}>
            Continue your wellness journey
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fde8e8', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: '#dc2626', marginBottom: 16,
          }}>{error}</div>
        )}

        <input
          type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)}
          style={input}
        />
        <input
          type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={input}
        />

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: 15,
          background: '#1a1a18', color: 'white',
          border: 'none', borderRadius: 14,
          fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          fontFamily: "'DM Sans', Arial, sans-serif",
          marginBottom: 20,
        }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#7a7a72' }}>
          No account?{' '}
          <span
            onClick={() => router.push('/signup')}
            style={{ color: '#4a7c2f', fontWeight: 600, cursor: 'pointer' }}>
            Create one free
          </span>
        </p>

      </div>
    </main>
  )
}