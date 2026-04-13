'use client'
import { useState, useEffect, useRef } from 'react'
import { sanitizeName } from '../../lib/sanitize'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

const goals = ['More energy', 'Lose weight', 'Better sleep', 'Build habits']
const religions = ['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Others', 'Prefer not to say']

const s = (o: React.CSSProperties) => o

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <div style={{ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 }}/>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#3d3d3a', letterSpacing: '0.02em' }}>{children}</div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const saveRef = useRef(false)

  const [userName, setUserName]           = useState('')
  const [email, setEmail]                 = useState('')
  const [goal, setGoal]                   = useState('')
  const [weightKg, setWeightKg]           = useState<number | null>(null)
  const [weightInput, setWeightInput]     = useState('')
  const [weightUnit, setWeightUnit]       = useState<'kg' | 'lbs'>('kg')
  const [nameInput, setNameInput]         = useState('')
  const [religion, setReligion]           = useState('')
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [isPro, setIsPro]                 = useState(false)
  const [periodEnd, setPeriodEnd]         = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  // delete flow
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput]     = useState('')
  const [deleting, setDeleting]           = useState(false)
  const [deleteError, setDeleteError]     = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
      setNameInput(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
      setGoal(user.user_metadata?.goal || '')

      const res = await fetch('/api/profile')
      const { data } = await res.json()
      if (data?.weight_kg) { setWeightKg(data.weight_kg); setWeightInput(String(data.weight_kg)) }
      if (data?.is_pro) setIsPro(data.is_pro)
      if (data?.religion) setReligion(data.religion)
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
    try {
      await Promise.all([
        supabase.auth.updateUser({ data: { full_name: sanitizeName(nameInput), goal } }),
        fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight_kg: kg, religion }),
        }),
      ])
      setUserName(nameInput)
      setWeightKg(kg)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (_e) {}
    setSaving(false)
    saveRef.current = false
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

  async function deleteAccount() {
    if (deleteInput.trim().toLowerCase() !== 'delete') {
      setDeleteError('Type "delete" to confirm.')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (res.ok) {
        await supabase.auth.signOut()
        router.push('/?deleted=true')
      } else {
        setDeleteError('Something went wrong. Please try again.')
        setDeleting(false)
      }
    } catch (_e) {
      setDeleteError('Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  // initials for avatar
  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase()

  const lbsDisplay = weightKg ? Math.round(weightKg * 2.205) : null

  return (
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 40 })}>

      {/* Header */}
      <div style={s({
        background: '#1a1a18',
        padding: '16px 22px 24px',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
      })}>
        <button onClick={() => router.push('/dashboard')} style={s({ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: 0 })}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={s({ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', Arial, sans-serif" })}>Back</span>
        </button>

        <div style={s({ display: 'flex', alignItems: 'center', gap: 14 })}>
          <div style={s({
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(125,184,74,0.2)', border: '1.5px solid rgba(125,184,74,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#a8c48a',
            fontFamily: "'DM Sans', Arial, sans-serif", flexShrink: 0,
          })}>
            {initials}
          </div>
          <div>
            <div style={s({ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif" })}>{userName || 'Your profile'}</div>
            <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 })}>{email}</div>
            {isPro && (
              <div style={s({ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(125,184,74,0.15)', border: '1px solid rgba(125,184,74,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#a8c48a', marginTop: 6 })}>
                ✦ Pro
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={s({ padding: '20px 22px 0' })}>

        {/* Subscription */}
        {isPro ? (
          <div style={s({ marginBottom: 24 })}>
            <SectionLabel>Subscription</SectionLabel>
            <div style={s({ background: '#1a1a18', borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden' })}>
              <div style={s({ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: '#7db84a', opacity: 0.08, top: -20, right: -20, pointerEvents: 'none' })}/>
              <div style={s({ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
                <div>
                  <div style={s({ fontSize: 14, fontWeight: 700, color: '#a8c48a', marginBottom: 4 })}>Weekly Reset Pro</div>
                  {periodEnd && (
                    <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.4)' })}>
                      Renews {new Date(periodEnd).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div style={s({ background: 'rgba(125,184,74,0.2)', border: '1px solid rgba(125,184,74,0.4)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#a8c48a' })}>Active</div>
              </div>
              <button onClick={openBillingPortal} disabled={portalLoading} style={s({ marginTop: 14, padding: '8px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
                {portalLoading ? 'Loading…' : 'Manage subscription →'}
              </button>
            </div>
          </div>
        ) : (
          <div style={s({ marginBottom: 24 })}>
            <SectionLabel>Subscription</SectionLabel>
            <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
              <div style={s({ fontSize: 14, fontWeight: 700, color: '#1a1a18', marginBottom: 4 })}>Free plan</div>
              <div style={s({ fontSize: 12, color: '#7a7a72', lineHeight: 1.5, marginBottom: 14 })}>Unlock custom workouts, meal plans, AI check-ins and extended history with Pro.</div>
              <button onClick={() => router.push('/upgrade')} style={s({ padding: '10px 20px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
                Upgrade to Pro →
              </button>
            </div>
          </div>
        )}

        {/* Personal details */}
        <div style={s({ marginBottom: 24 })}>
          <SectionLabel>Personal details</SectionLabel>
          <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, overflow: 'hidden' })}>

            {/* Name */}
            <div style={s({ padding: '14px 16px', borderBottom: '1px solid #f5f2ec' })}>
              <div style={s({ fontSize: 11, fontWeight: 600, color: '#9a9a92', marginBottom: 6 })}>Name</div>
              <input
                type="text" value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                style={s({ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e0d8', borderRadius: 8, fontSize: 14, color: '#1a1a18', background: '#faf8f4', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', Arial, sans-serif" })}
              />
            </div>

            {/* Weight */}
            <div style={s({ padding: '14px 16px', borderBottom: '1px solid #f5f2ec' })}>
              <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 })}>
                <div style={s({ fontSize: 11, fontWeight: 600, color: '#9a9a92' })}>Weight</div>
                {weightKg && <div style={s({ fontSize: 11, color: '#9a9a92' })}>{weightKg}kg / {lbsDisplay}lbs · Water goal: {Math.round(weightKg * 0.033 * 10) / 10}L</div>}
              </div>
              <div style={s({ display: 'flex', gap: 8, marginBottom: 8 })}>
                <button onClick={() => setWeightUnit('kg')} style={s({ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${weightUnit === 'kg' ? '#4a7c2f' : '#e4e0d8'}`, background: weightUnit === 'kg' ? '#4a7c2f' : 'white', color: weightUnit === 'kg' ? 'white' : '#4a7c2f', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>kg</button>
                <button onClick={() => setWeightUnit('lbs')} style={s({ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${weightUnit === 'lbs' ? '#4a7c2f' : '#e4e0d8'}`, background: weightUnit === 'lbs' ? '#4a7c2f' : 'white', color: weightUnit === 'lbs' ? 'white' : '#4a7c2f', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>lbs</button>
              </div>
              <input
                type="number" placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                value={weightInput} onChange={e => setWeightInput(e.target.value)}
                style={s({ width: '100%', padding: '9px 12px', border: '1.5px solid #e4e0d8', borderRadius: 8, fontSize: 14, color: '#1a1a18', background: '#faf8f4', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', Arial, sans-serif" })}
              />
            </div>

            {/* Goal */}
            <div style={s({ padding: '14px 16px', borderBottom: '1px solid #f5f2ec' })}>
              <div style={s({ fontSize: 11, fontWeight: 600, color: '#9a9a92', marginBottom: 8 })}>Main goal</div>
              <div style={s({ display: 'flex', gap: 6, flexWrap: 'wrap' })}>
                {goals.map(g => (
                  <button key={g} onClick={() => setGoal(g)} style={s({
                    padding: '6px 14px', borderRadius: 30, cursor: 'pointer',
                    border: `1.5px solid ${goal === g ? '#4a7c2f' : '#e4e0d8'}`,
                    background: goal === g ? '#e8f5e0' : 'white',
                    color: goal === g ? '#4a7c2f' : '#3d3d3a',
                    fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', Arial, sans-serif",
                  })}>{g}</button>
                ))}
              </div>
            </div>

            {/* Religion — drives Ramadan Mode */}
            <div style={s({ padding: '14px 16px' })}>
              <div style={s({ fontSize: 11, fontWeight: 600, color: '#9a9a92', marginBottom: 4 })}>Religion <span style={s({ fontWeight: 400, color: '#c4c0b8' })}>· optional</span></div>
              <div style={s({ fontSize: 11, color: '#c4c0b8', marginBottom: 8 })}>Used to personalise app features like Ramadan Mode</div>
              <div style={s({ display: 'flex', gap: 6, flexWrap: 'wrap' })}>
                {religions.map(r => (
                  <button key={r} onClick={() => setReligion(prev => prev === r ? '' : r)} style={s({
                    padding: '6px 12px', borderRadius: 30, cursor: 'pointer',
                    border: `1.5px solid ${religion === r ? '#4a7c2f' : '#e4e0d8'}`,
                    background: religion === r ? '#e8f5e0' : 'white',
                    color: religion === r ? '#4a7c2f' : '#3d3d3a',
                    fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', Arial, sans-serif",
                  })}>{r}</button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Save button */}
        <button onClick={saveProfile} disabled={saving} style={s({
          width: '100%', padding: 14, background: '#1a1a18', color: 'white',
          border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          fontFamily: "'DM Sans', Arial, sans-serif", marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        })}>
          {saved ? (
            <>
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                <path d="M1 7l4.5 4.5L15 1" stroke="#a8c48a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved
            </>
          ) : saving ? 'Saving…' : 'Save changes'}
        </button>

        {/* Account actions */}
        <div style={s({ marginBottom: 24 })}>
          <SectionLabel>Account</SectionLabel>
          <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, overflow: 'hidden' })}>
            <button onClick={signOut} style={s({ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f5f2ec', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif' " })}>
              <span style={s({ fontSize: 14, fontWeight: 500, color: '#1a1a18' })}>Sign out</span>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M7 9H15M15 9L12 6M15 9L12 12" stroke="#9a9a92" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 4H4C3.45 4 3 4.45 3 5V13C3 13.55 3.45 14 4 14H10" stroke="#9a9a92" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} style={s({ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif'" })}>
              <span style={s({ fontSize: 14, fontWeight: 500, color: '#dc2626' })}>Delete account</span>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M3 5H15M6 5V3.5C6 3.22 6.22 3 6.5 3H11.5C11.78 3 12 3.22 12 3.5V5M7 8.5V13M11 8.5V13M4 5L5 15C5 15.55 5.45 16 6 16H12C12.55 16 13 15.55 13 15L14 5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div style={s({ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,10,8,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 env(safe-area-inset-bottom)' })}>
            <div style={s({ width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', padding: '24px 22px 32px' })}>
              <div style={s({ width: 36, height: 4, borderRadius: 2, background: '#e4e0d8', margin: '0 auto 20px' })}/>
              <div style={s({ fontSize: 18, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 8 })}>Delete your account?</div>
              <div style={s({ fontSize: 13, color: '#7a7a72', lineHeight: 1.6, marginBottom: 6 })}>
                Your account will be flagged for deletion. All your data — habits, streaks, logs — will be permanently removed after <strong style={{ color: '#1a1a18' }}>30 days</strong>.
              </div>
              <div style={s({ fontSize: 13, color: '#7a7a72', lineHeight: 1.6, marginBottom: 20 })}>
                If you change your mind, simply log back in within 30 days to restore your account.
              </div>
              <div style={s({ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 8 })}>Type <strong>delete</strong> to confirm</div>
              <input
                type="text" placeholder='delete'
                value={deleteInput} onChange={e => { setDeleteInput(e.target.value); setDeleteError('') }}
                style={s({ width: '100%', padding: '11px 12px', border: `1.5px solid ${deleteError ? '#dc2626' : '#e4e0d8'}`, borderRadius: 8, fontSize: 14, color: '#1a1a18', background: '#faf8f4', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', Arial, sans-serif", marginBottom: 6 })}
              />
              {deleteError && <div style={s({ fontSize: 12, color: '#dc2626', marginBottom: 10 })}>{deleteError}</div>}
              <div style={s({ display: 'flex', gap: 10, marginTop: 10 })}>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteError('') }} style={s({ flex: 1, padding: '12px', background: '#f5f2ec', color: '#3d3d3a', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
                  Cancel
                </button>
                <button onClick={deleteAccount} disabled={deleting} style={s({ flex: 1, padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, fontFamily: "'DM Sans', Arial, sans-serif" })}>
                  {deleting ? 'Deleting…' : 'Delete account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version */}
        <div style={s({ textAlign: 'center', fontSize: 11, color: '#c4c0b8', paddingBottom: 8 })}>
          Weekly Reset · v1.0 · {isPro ? 'Pro' : 'Free'}
        </div>

      </div>
    </main>
  )
}
