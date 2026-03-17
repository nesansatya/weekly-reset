'use client'
import { useState } from 'react'
import { createClient } from './lib/supabase/client'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [dbStatus, setDbStatus] = useState('')

  const supabase = createClient()

  async function testConnection() {
    setDbStatus('Testing...')
    const { error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      setDbStatus('❌ Connection failed: ' + error.message)
    } else {
      setDbStatus('✅ Supabase connected successfully!')
    }
  }

  async function handleSignup() {
    setLoading(true)
    setStatus('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setStatus('❌ ' + error.message)
    } else {
      setStatus('✅ Account created! Check your email to confirm.')
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#faf8f4',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a18', marginBottom: 4 }}>
            Weekly Reset
          </h1>
          <p style={{ color: '#7a7a72', fontSize: 14 }}>
            Trial run — testing the full stack
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '1.5rem',
          border: '1px solid #e4e0d8',
          marginBottom: '1rem'
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#3d3d3a', marginBottom: 12 }}>
            1. Test Supabase connection
          </h2>
          <button
            onClick={testConnection}
            style={{
              width: '100%',
              padding: '10px',
              background: '#1a1a18',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: 8
            }}>
            Test database connection
          </button>
          {dbStatus && (
            <p style={{ fontSize: 13, color: '#4a7c2f', margin: 0 }}>{dbStatus}</p>
          )}
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '1.5rem',
          border: '1px solid #e4e0d8'
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#3d3d3a', marginBottom: 12 }}>
            2. Test signup
          </h2>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e4e0d8',
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 8,
              boxSizing: 'border-box'
            }}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e4e0d8',
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 8,
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e4e0d8',
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 12,
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: '#4a7c2f',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: 8
            }}>
            {loading ? 'Creating account...' : 'Create test account'}
          </button>
          {status && (
            <p style={{ fontSize: 13, color: '#4a7c2f', margin: 0 }}>{status}</p>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#7a7a72', marginTop: 16 }}>
          Infrastructure: Next.js + Supabase + Vercel ✓
        </p>
      </div>
    </main>
  )
}