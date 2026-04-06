'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

const goals = ['More energy', 'Lose weight', 'Better sleep', 'Build habits']

const religions = [
  { label: 'Islam', icon: '🌙' },
  { label: 'Christianity', icon: '✝️' },
  { label: 'Hinduism', icon: '🕉️' },
  { label: 'Buddhism', icon: '☸️' },
  { label: 'Others', icon: '✡️' },
  { label: 'Prefer not to say', icon: '🤐' },
]

export default function SignupPage() {
  const [step, setStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [dir, setDir] = useState<'right' | 'left'>('right')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [goal, setGoal] = useState('')
  const [religion, setReligion] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const TOTAL_STEPS = 4

  function goNext() {
    setError('')
    setDir('right')
    setAnimKey(k => k + 1)
    setStep(s => s + 1)
  }

  function goPrev() {
    setError('')
    setDir('left')
    setAnimKey(k => k + 1)
    setStep(s => s - 1)
  }

  async function handleSignup() {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, goal, religion } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/onboarding')
  }

  const s = (obj: React.CSSProperties) => obj

  const inputStyle = s({
    width: '100%', padding: '13px 14px',
    border: '1.5px solid #e4e0d8', borderRadius: 9,
    fontSize: 14, marginBottom: 12,
    fontFamily: "'DM Sans', Arial, sans-serif",
    color: '#1a1a18', background: 'white', outline: 'none',
    boxSizing: 'border-box',
  })

  const ctaStyle = (disabled: boolean) => s({
    width: '100%', padding: 15,
    background: '#4a7c2f', color: 'white',
    border: 'none', borderRadius: 12,
    fontSize: 15, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    fontFamily: "'DM Sans', Arial, sans-serif",
    marginBottom: 12,
    transition: 'opacity 0.15s ease',
  })

  const backStyle = s({
    width: '100%', padding: '10px',
    background: 'none', border: 'none',
    fontSize: 13, color: '#7a7a72',
    cursor: 'pointer',
    fontFamily: "'DM Sans', Arial, sans-serif",
  })

  const slideClass = dir === 'right' ? 'onboard-slide-in-right' : 'onboard-slide-in-left'

  return (
    <main style={s({
      minHeight: '100vh', background: '#faf8f4',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem',
      fontFamily: "'DM Sans', Arial, sans-serif",
    })}>
      <div style={s({ width: '100%', maxWidth: 380 })}>

        {/* Back to home — only on step 0 */}
        {step === 0 && (
          <button onClick={() => router.push('/')} style={s({
            background: 'none', border: 'none',
            fontSize: 22, cursor: 'pointer',
            marginBottom: 24, color: '#3d3d3a',
          })}>←</button>
        )}

        {/* Progress bar */}
        <div style={s({ display: 'flex', gap: 5, marginBottom: 6 })}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={s({ flex: 1, height: 3, borderRadius: 2, background: '#e4e0d8', overflow: 'hidden' })}>
              <div style={s({
                height: '100%', borderRadius: 2, background: '#4a7c2f',
                width: i <= step ? '100%' : '0%',
                transition: 'width 0.4s ease',
              })}/>
            </div>
          ))}
        </div>
        <div style={s({ fontSize: 11, color: '#7a7a72', fontWeight: 500, marginBottom: 28 })}>
          Step {step + 1} of {TOTAL_STEPS}
        </div>

        {/* Error banner */}
        {error && (
          <div style={s({
            background: '#fde8e8', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: '#dc2626', marginBottom: 16,
          })}>{error}</div>
        )}

        {/* Animated slide content */}
        <div key={animKey} className={slideClass}>

          {/* ── Step 0: Account details ── */}
          {step === 0 && (
            <div>
              <div style={s({ fontSize: 40, marginBottom: 14 })}>👋</div>
              <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#4a7c2f', textTransform: 'uppercase', marginBottom: 6 })}>
                Get started
              </div>
              <h1 style={s({ fontSize: 26, fontWeight: 700, color: '#1a1a18', marginBottom: 6, fontFamily: "'DM Serif Display', Georgia, serif" })}>
                Create your account
              </h1>
              <p style={s({ fontSize: 13, color: '#7a7a72', marginBottom: 24 })}>
                Free forever · no credit card needed
              </p>

              <input
                type="text" placeholder="Your name" value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password" placeholder="Password (min 6 characters)" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name && email && password.length >= 6 && goNext()}
                style={{ ...inputStyle, marginBottom: 20 }}
              />

              <button
                onClick={goNext}
                disabled={!name || !email || password.length < 6}
                style={ctaStyle(!name || !email || password.length < 6)}
              >
                Continue →
              </button>

              <p style={s({ textAlign: 'center', fontSize: 13, color: '#7a7a72', marginTop: 8 })}>
                Already have an account?{' '}
                <span onClick={() => router.push('/login')} style={s({ color: '#4a7c2f', fontWeight: 600, cursor: 'pointer' })}>
                  Sign in
                </span>
              </p>
            </div>
          )}

          {/* ── Step 1: Main goal ── */}
          {step === 1 && (
            <div>
              <div style={s({ fontSize: 40, marginBottom: 14 })}>🎯</div>
              <h1 style={s({ fontSize: 26, fontWeight: 700, color: '#1a1a18', marginBottom: 6, fontFamily: "'DM Serif Display', Georgia, serif" })}>
                What's your main goal?
              </h1>
              <p style={s({ fontSize: 13, color: '#7a7a72', marginBottom: 24, lineHeight: 1.6 })}>
                We'll build your plan around this. You can change it anytime.
              </p>

              <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 })}>
                {goals.map(g => (
                  <div key={g} onClick={() => setGoal(g)} style={s({
                    padding: '14px 10px', borderRadius: 12,
                    border: `1.5px solid ${goal === g ? '#7db84a' : '#e4e0d8'}`,
                    background: goal === g ? '#e8f5e0' : 'white',
                    color: goal === g ? '#27500A' : '#3d3d3a',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.15s ease',
                  })}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>
                      {g === 'More energy' ? '⚡' : g === 'Lose weight' ? '⚖️' : g === 'Better sleep' ? '😴' : '✅'}
                    </div>
                    {g}
                  </div>
                ))}
              </div>

              <button onClick={goNext} disabled={!goal} style={ctaStyle(!goal)}>
                Continue →
              </button>
              <button onClick={goPrev} style={backStyle}>← Back</button>
            </div>
          )}

          {/* ── Step 2: Religion ── */}
          {step === 2 && (
            <div>
              <div style={s({ fontSize: 40, marginBottom: 14 })}>🌍</div>
              <h1 style={s({ fontSize: 26, fontWeight: 700, color: '#1a1a18', marginBottom: 6, fontFamily: "'DM Serif Display', Georgia, serif" })}>
                What is your religion?
              </h1>
              <p style={s({ fontSize: 13, color: '#7a7a72', marginBottom: 24, lineHeight: 1.6 })}>
                Optional — helps us personalise reminders and fasting features for you.
              </p>

              <div style={s({ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 })}>
                {religions.map(r => (
                  <button key={r.label} onClick={() => setReligion(r.label)} style={s({
                    padding: '8px 14px', borderRadius: 30,
                    border: `1.5px solid ${religion === r.label ? '#4a7c2f' : '#e4e0d8'}`,
                    background: religion === r.label ? '#e8f5e0' : 'white',
                    color: religion === r.label ? '#4a7c2f' : '#3d3d3a',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    fontFamily: "'DM Sans', Arial, sans-serif",
                    transition: 'all 0.15s ease',
                  })}>{r.icon} {r.label}</button>
                ))}
              </div>

              <button onClick={goNext} style={ctaStyle(false)}>
                {religion ? 'Continue →' : 'Skip →'}
              </button>
              <button onClick={goPrev} style={backStyle}>← Back</button>
            </div>
          )}

          {/* ── Step 3: Create account ── */}
          {step === 3 && (
            <div>
              <div style={s({ fontSize: 40, marginBottom: 14 })}>🌿</div>
              <h1 style={s({ fontSize: 26, fontWeight: 700, color: '#1a1a18', marginBottom: 6, fontFamily: "'DM Serif Display', Georgia, serif" })}>
                You're all set, {name.split(' ')[0]}!
              </h1>
              <p style={s({ fontSize: 13, color: '#7a7a72', marginBottom: 20, lineHeight: 1.6 })}>
                Here's your plan summary before we create your account.
              </p>

              {/* Summary card */}
              <div style={s({
                background: '#1a1a18', borderRadius: 16,
                padding: '16px 18px', marginBottom: 24,
                position: 'relative', overflow: 'hidden',
              })}>
                <div style={s({ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: '#7db84a', opacity: 0.07, top: -30, right: -30 })}/>
                {[
                  { icon: '🎯', label: 'Goal', value: goal },
                  { icon: '🌍', label: 'Religion', value: religion || 'Not specified' },
                  { icon: '📅', label: 'Plan', value: '7-day bodyweight plan' },
                  { icon: '💰', label: 'Cost', value: 'Free forever' },
                ].map(row => (
                  <div key={row.label} style={s({ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 })}>
                    <span style={{ fontSize: 16 }}>{row.icon}</span>
                    <div style={s({ fontSize: 13, color: 'rgba(255,255,255,0.5)' })}>{row.label}:</div>
                    <div style={s({ fontSize: 13, color: '#a8c48a', fontWeight: 600 })}>{row.value}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSignup}
                disabled={loading}
                style={ctaStyle(loading)}
              >
                {loading ? 'Creating account...' : 'Create my account →'}
              </button>
              <button onClick={goPrev} style={backStyle}>← Back</button>
            </div>
          )}

        </div>

      </div>
    </main>
  )
}
