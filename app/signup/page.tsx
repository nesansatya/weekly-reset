'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [goal, setGoal] = useState('')
  const [religion, setReligion] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup() {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, goal, religion } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  const input = {
    width: '100%', padding: '13px 14px',
    border: '1.5px solid #e4e0d8', borderRadius: 9,
    fontSize: 14, marginBottom: 12,
    fontFamily: "'DM Sans', Arial, sans-serif",
    color: '#1a1a18', background: 'white', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const goals = ['More energy', 'Lose weight', 'Better sleep', 'Build habits']

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
            Get started
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a18', marginBottom: 6, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13, color: '#7a7a72' }}>
            Free forever · no credit card needed
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fde8e8', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: '#dc2626', marginBottom: 16,
          }}>{error}</div>
        )}

        <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={input}/>
        <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={input}/>
        <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} style={input}/>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 8 }}>
            What's your main goal?
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {goals.map(g => (
              <button key={g} onClick={() => setGoal(g)} style={{
                padding: '7px 14px', borderRadius: 30,
                border: `1.5px solid ${goal === g ? '#4a7c2f' : '#e4e0d8'}`,
                background: goal === g ? '#e8f5e0' : 'white',
                color: goal === g ? '#4a7c2f' : '#3d3d3a',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                fontFamily: "'DM Sans', Arial, sans-serif",
              }}>{g}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 8 }}>
            What is your religion? <span style={{ color: '#7a7a72', fontWeight: 400 }}>(optional)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Islam', icon: '🌙' },
              { label: 'Christianity', icon: '✝️' },
              { label: 'Hinduism', icon: '🕉️' },
              { label: 'Buddhism', icon: '☸️' },
              { label: 'Others', icon: '✡️' },
              { label: 'Prefer not to say', icon: '🤐' },
            ].map(r => (
              <button key={r.label} onClick={() => setReligion(r.label)} style={{
                padding: '7px 14px', borderRadius: 30,
                border: `1.5px solid ${religion === r.label ? '#4a7c2f' : '#e4e0d8'}`,
                background: religion === r.label ? '#e8f5e0' : 'white',
                color: religion === r.label ? '#4a7c2f' : '#3d3d3a',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                fontFamily: "'DM Sans', Arial, sans-serif",
              }}>{r.icon} {r.label}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSignup} disabled={loading} style={{
          width: '100%', padding: 15,
          background: '#1a1a18', color: 'white',
          border: 'none', borderRadius: 14,
          fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          fontFamily: "'DM Sans', Arial, sans-serif",
          marginBottom: 20,
        }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#7a7a72' }}>
          Already have an account?{' '}
          <span onClick={() => router.push('/login')} style={{ color: '#4a7c2f', fontWeight: 600, cursor: 'pointer' }}>
            Sign in
          </span>
        </p>

      </div>
    </main>
  )
}
