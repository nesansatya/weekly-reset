'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

const goals = ['More energy', 'Lose weight', 'Better sleep', 'Build habits']

const s = (o: React.CSSProperties) => o

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [goal, setGoal] = useState('')
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [weightInput, setWeightInput] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState('free')
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const saveRef = useRef(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
      const userGoal = user.user_metadata?.goal || ''
      setUserName(name)
      setNameInput(name)
      setGoal(userGoal)

      const res = await fetch('/api/profile')
      const { data } = await res.json()
      if (data?.weight_kg) {
        setWeightKg(data.weight_kg)
        setWeightInput(String(data.weight_kg))
      }
      if (data?.is_pro) setIsPro(data.is_pro)
      if (data?.subscription_status) setSubscriptionStatus(data.subscription_status)
      if (data?.subscription_period_end) setPeriodEnd(data.subscription_period_end)
    }
    load()
  }, [])

  async function saveProfile() {
    if (saveRef.current) return
    saveRef.current = true
    setSaving(true)
    let kg = weightKg
    if (weightInput) {
      let parsed = parseFloat(weightInput)
      if (!isNaN(parsed) && parsed > 0) {
        if (weightUnit === 'lbs') parsed = Math.round(parsed / 2.205 * 10) / 10
        kg = parsed
      }
    }
    await Promise.all([
      supabase.auth.updateUser({ data: { full_name: nameInput, goal } }),
      fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: kg }),
      })
    ])
    setUserName(nameInput)
    setWeightKg(kg)
    setSaving(false)
    setSaved(true)
    saveRef.current = false
    setTimeout(() => setSaved(false), 2000)
  }

  async function openBillingPortal() {
    setPortalLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setPortalLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 100 })}>

      <div style={s({
        padding: '16px 22px 16px',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        background: '#d4cfc4',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      })}>
        <div>
          <button onClick={() => router.push('/dashboard')} style={s({ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3d3d3a', marginBottom: 12, display: 'block' })}>←</button>
          <div style={s({ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif" })}>Profile</div>
          <div style={s({ fontSize: 13, color: '#7a7a72', marginTop: 4 })}>{email}</div>
        </div>
        <div style={s({ width: 52, height: 52, borderRadius: '50%', background: '#1a1a18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 40 })}>
          <span style={{ fontSize: 22 }}>🌿</span>
        </div>
      </div>

      {isPro ? (
        <div style={s({ margin: '20px 22px 0', background: '#1a1a18', borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden' })}>
          <div style={s({ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: '#7db84a', opacity: 0.1, top: -20, right: -20 })}/>
          <div style={s({ position: 'relative', zIndex: 1 })}>
            <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 })}>
              <div style={s({ fontSize: 14, fontWeight: 700, color: '#a8c48a' })}>✦ Weekly Reset Pro</div>
              <div style={s({ background: 'rgba(125,184,74,0.2)', border: '1px solid rgba(125,184,74,0.4)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#a8c48a' })}>Active</div>
            </div>
            {periodEnd && (
              <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 })}>
                Renews {new Date(periodEnd).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
            <button onClick={openBillingPortal} disabled={portalLoading} style={s({
              padding: '8px 16px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
              color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
            })}>
              {portalLoading ? 'Loading...' : 'Manage subscription →'}
            </button>
          </div>
        </div>
      ) : (
        <div style={s({ margin: '20px 22px 0', background: 'linear-gradient(135deg, #e8f5e0, #f0f7e8)', border: '1px solid #97C459', borderRadius: 14, padding: 16 })}>
          <div style={s({ fontSize: 14, fontWeight: 700, color: '#27500A', marginBottom: 4 })}>Upgrade to Pro 🚀</div>
          <div style={s({ fontSize: 12, color: '#3B6D11', marginBottom: 12, lineHeight: 1.5 })}>
            Unlock custom workouts, meal plans, AI check-ins and extended history.
          </div>
          <button onClick={() => router.push('/upgrade')} style={s({
            padding: '10px 20px', background: '#4a7c2f', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
          })}>
            See plans →
          </button>
        </div>
      )}

      <div style={s({ margin: '16px 22px 0', background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 16 })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Your name</div>
        <input
          type="text"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          style={s({ width: '100%', padding: '11px 12px', border: '1.5px solid #e4e0d8', borderRadius: 8, fontSize: 14, color: '#1a1a18', background: '#faf8f4', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', Arial, sans-serif" })}
        />
      </div>

      <div style={s({ margin: '12px 22px 0', background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 16 })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 12 })}>Your main goal</div>
        <div style={s({ display: 'flex', gap: 8, flexWrap: 'wrap' })}>
          {goals.map(g => (
            <button key={g} onClick={() => setGoal(g)} style={s({
              padding: '8px 16px', borderRadius: 30, cursor: 'pointer',
              border: `1.5px solid ${goal === g ? '#4a7c2f' : '#e4e0d8'}`,
              background: goal === g ? '#e8f5e0' : 'white',
              color: goal === g ? '#4a7c2f' : '#3d3d3a',
              fontSize: 13, fontWeight: 500,
              fontFamily: "'DM Sans', Arial, sans-serif",
            })}>{g}</button>
          ))}
        </div>
      </div>

      <div style={s({ margin: '12px 22px 0', background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 16 })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Weight</div>
        <div style={s({ display: 'flex', gap: 8, marginBottom: 10 })}>
          <button onClick={() => setWeightUnit('kg')} style={s({ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${weightUnit === 'kg' ? '#4a7c2f' : '#e4e0d8'}`, background: weightUnit === 'kg' ? '#4a7c2f' : 'white', color: weightUnit === 'kg' ? 'white' : '#4a7c2f', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>kg</button>
          <button onClick={() => setWeightUnit('lbs')} style={s({ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${weightUnit === 'lbs' ? '#4a7c2f' : '#e4e0d8'}`, background: weightUnit === 'lbs' ? '#4a7c2f' : 'white', color: weightUnit === 'lbs' ? 'white' : '#4a7c2f', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>lbs</button>
        </div>
        <input
          type="number"
          placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
          value={weightInput}
          onChange={e => setWeightInput(e.target.value)}
          style={s({ width: '100%', padding: '11px 12px', border: '1.5px solid #e4e0d8', borderRadius: 8, fontSize: 14, color: '#1a1a18', background: '#faf8f4', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', Arial, sans-serif" })}
        />
        {weightKg && (
          <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 8 })}>
            Current: {weightKg}kg / {Math.round(weightKg * 2.205)}lbs · Water goal: {Math.round(weightKg * 0.033 * 10) / 10}L
          </div>
        )}
      </div>

      <div style={s({ margin: '16px 22px 0' })}>
        <button onClick={saveProfile} disabled={saving} style={s({
          width: '100%', padding: 15, background: '#1a1a18', color: 'white',
          border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          fontFamily: "'DM Sans', Arial, sans-serif",
        })}>
          {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      <div style={s({ margin: '12px 22px 0', background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', overflow: 'hidden' })}>
        {[
          { label: 'Version', value: isPro ? 'Pro · v1.0' : 'Free · v1.0' },
          { label: 'Plan', value: isPro ? '✦ Weekly Reset Pro' : 'Free' },
          { label: 'Data', value: 'Stored securely' },
        ].map((item, i, arr) => (
          <div key={item.label} style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
            <div style={s({ fontSize: 13, color: '#3d3d3a', fontWeight: 500 })}>{item.label}</div>
            <div style={s({ fontSize: 13, color: isPro && item.label === 'Plan' ? '#4a7c2f' : '#7a7a72', fontWeight: isPro && item.label === 'Plan' ? 600 : 400 })}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={s({ margin: '12px 22px 0' })}>
        <button onClick={signOut} style={s({
          width: '100%', padding: 15,
          background: 'white', color: '#dc2626',
          border: '1.5px solid #fca5a5', borderRadius: 14,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'DM Sans', Arial, sans-serif",
        })}>
          Sign out
        </button>
      </div>

    </main>
  )
}