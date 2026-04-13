'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import AuthGuard from '../components/AuthGuard'
import RamadanBanner from '../components/RamadanBanner'
import IFBanner from '../components/IFBanner'

// ── Habit SVG icons ───────────────────────────────────────────────────────────
const habitIcons = {
  sun: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="4" stroke={color} strokeWidth="1.6"/>
      <path d="M11 2V4M11 18V20M2 11H4M18 11H20M4.93 4.93L6.34 6.34M15.66 15.66L17.07 17.07M17.07 4.93L15.66 6.34M6.34 15.66L4.93 17.07" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  drop: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3C11 3 5 9.5 5 13.5C5 16.81 7.69 19.5 11 19.5C14.31 19.5 17 16.81 17 13.5C17 9.5 11 3 11 3Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M8 14.5C8.5 16 9.5 17 11 17" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  steps: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M7 18C7 18 6 14 8 12C9.5 10.5 11 11 12 10C13.5 8.5 13 6 13 6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M13 18C13 18 14 14 12 12C10.5 10.5 9 11 8 10C6.5 8.5 7 6 7 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.45"/>
      <circle cx="13" cy="4.5" r="1.5" fill={color}/>
      <circle cx="7" cy="4.5" r="1.5" fill={color} opacity="0.45"/>
    </svg>
  ),
  fork: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M8 3V8C8 9.1 8.9 10 10 10V19" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M6 3V6M10 3V6" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M14 3C14 3 16 5 16 8C16 9.1 15.1 10 14 10V19" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  phoneOff: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="6" y="2" width="10" height="16" rx="2" stroke={color} strokeWidth="1.6"/>
      <path d="M9 18.5H13" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M4 4L18 18" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  moon: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M19 12.5C17.5 16.09 13.97 18.5 10 18.5C5.86 18.5 2.5 15.14 2.5 11C2.5 7.03 4.91 3.5 8.5 2C7.5 3.5 7 5.5 7 7C7 11.97 11.03 16 16 16C17.5 16 18.86 15.62 20 14.93C19.7 14.14 19.38 13.3 19 12.5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
}

// ── Habit definitions ─────────────────────────────────────────────────────────
type HabitKey = 'sun' | 'drop' | 'steps' | 'fork' | 'phoneOff' | 'moon'

const habits: { iconKey: HabitKey; label: string; sub: string; isSteps?: boolean }[] = [
  { iconKey: 'sun',      label: 'Morning sunlight',       sub: '10–15 min outside' },
  { iconKey: 'drop',     label: '500ml on waking',         sub: 'Before anything else' },
  { iconKey: 'steps',    label: 'Steps goal',              sub: 'How many steps today?', isSteps: true },
  { iconKey: 'fork',     label: '3 structured meals',      sub: 'No constant snacking' },
  { iconKey: 'phoneOff', label: 'Phone off 1hr before bed',sub: 'Protect your sleep' },
  { iconKey: 'moon',     label: 'Sleep before midnight',   sub: '7–8 hours target' },
]

const STEP_RANGES = ['Under 5k', '5k – 7k', '7k – 8k', 'Over 10k']

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  return 'Good evening,'
}

function calcWaterGoal(weightKg: number) {
  const litres = weightKg * 0.033
  const glasses = Math.round(litres / 0.25)
  return { litres: Math.round(litres * 10) / 10, glasses: Math.max(6, Math.min(16, glasses)) }
}

async function fetchWithTimeout(url: string, options?: RequestInit, ms = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    return res
  } catch (_e) {
    clearTimeout(timer)
    throw _e
  }
}

// ── Section label component ───────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <div style={{ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2, flexShrink: 0 }}/>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#3d3d3a', letterSpacing: '0.02em' }}>{children}</div>
    </div>
  )
}

// ── SVG checkmark ─────────────────────────────────────────────────────────────
function Checkmark() {
  return (
    <div style={{
      position: 'absolute', top: 8, right: 8,
      width: 18, height: 18, borderRadius: '50%',
      background: '#4a7c2f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4l2.8 2.8L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [userName, setUserName]         = useState('there')
  const [streak, setStreak]             = useState(0)
  const [isPro, setIsPro]               = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [isOffline, setIsOffline]       = useState(false)
  const [saving, setSaving]             = useState(false)

  // water
  const [water, setWater]               = useState(0)
  const [weightKg, setWeightKg]         = useState<number | null>(null)
  const [showWeightPrompt, setShowWeightPrompt] = useState(false)
  const [weightInput, setWeightInput]   = useState('')
  const [weightUnit, setWeightUnit]     = useState<'kg' | 'lbs'>('kg')
  const [tappedGlass, setTappedGlass]   = useState<number | null>(null)

  // habits
  const [checkedHabits, setCheckedHabits] = useState<Record<number, boolean>>({})
  const [stepsRange, setStepsRange]       = useState<string | null>(null)
  const [stepsOpen, setStepsOpen]         = useState(false)
  const [bouncingHabit, setBouncingHabit] = useState<number | null>(null)

  // check-in
  const [checkinDone, setCheckinDone]   = useState(false)
  const [checkinMoodLabel, setCheckinMoodLabel] = useState('')

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Offline detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline  = () => setIsOffline(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)
    setIsOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
    }
  }, [])

  // ── Data init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
      setUserName(name.split(' ')[0])

      const today = new Date().toISOString().split('T')[0]

      try {
        // fast cache load
        try {
          const cached = localStorage.getItem('wr_profile')
          if (cached) {
            const p = JSON.parse(cached)
            if (p.weight_kg) { setWeightKg(p.weight_kg); setShowWeightPrompt(false) }
            if (p.is_pro)    setIsPro(p.is_pro)
            if (p.full_name) setUserName(p.full_name.split(' ')[0])
          }
        } catch (_e) {}

        const [dailyRes, habitRes, streakRes, profileRes, checkinRes] = await Promise.all([
          fetchWithTimeout(`/api/logs/daily?date=${today}`),
          fetchWithTimeout(`/api/logs/habits?date=${today}`),
          fetchWithTimeout('/api/streak'),
          fetchWithTimeout('/api/profile'),
          fetchWithTimeout(`/api/checkin?date=${today}`),
        ])

        const [daily, habit, streakData, profile, checkin] = await Promise.all([
          dailyRes.json(), habitRes.json(), streakRes.json(),
          profileRes.json(), checkinRes.json(),
        ])

        if (daily.data) {
          setWater(daily.data.water_glasses || 0)
        }

        if (habit.data?.checked_habits) {
          setCheckedHabits(habit.data.checked_habits)
          if (habit.data.steps_range) setStepsRange(habit.data.steps_range)
        }

        if (streakData.data) setStreak(streakData.data.current_streak || 0)

        if (profile.data?.weight_kg) {
          setWeightKg(profile.data.weight_kg)
          setShowWeightPrompt(false)
        } else {
          setShowWeightPrompt(true)
        }

        if (profile.data?.is_pro) setIsPro(profile.data.is_pro)
        if (profile.data) {
          try { localStorage.setItem('wr_profile', JSON.stringify(profile.data)) } catch (_e) {}
        }

        if (checkin.data?.wake_feeling) {
          setCheckinDone(true)
          const moodMap: Record<number, string> = { 1: 'rough', 2: 'okay', 3: 'good', 4: 'great', 5: 'amazing' }
          setCheckinMoodLabel(moodMap[checkin.data.wake_feeling] || 'good')
        }

      } catch (_e) {
        setShowWeightPrompt(true)
      } finally {
        setProfileLoaded(true)
      }
    }
    init()
  }, [])

  // ── Save helpers ────────────────────────────────────────────────────────────
  const saveData = useCallback(async (updates: {
    water?: number
    habits?: Record<number, boolean>
    stepsRange?: string | null
  }) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true)
      const w = updates.water   ?? water
      const h = updates.habits  ?? checkedHabits
      const sr = updates.stepsRange !== undefined ? updates.stepsRange : stepsRange
      try {
        await Promise.all([
          fetch('/api/logs/daily', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ waterGlasses: w }),
          }),
          fetch('/api/logs/habits', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkedHabits: h, stepsRange: sr }),
          }),
        ])
        const habitsCount = Object.values(h).filter(Boolean).length
        if (habitsCount >= 3 || w >= 5) {
          const res = await fetch('/api/streak', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habitsCompleted: habitsCount }),
          })
          const { data } = await res.json()
          if (data) setStreak(data.current_streak || 0)
        }
      } catch (_e) {}
      setSaving(false)
    }, 600)
  }, [water, checkedHabits, stepsRange])

  async function saveWeight() {
    let kg = parseFloat(weightInput)
    if (isNaN(kg) || kg <= 0 || kg > 300) return
    if (weightUnit === 'lbs') kg = Math.round(kg / 2.205 * 10) / 10
    try {
      const res = await fetch('/api/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: kg }),
      })
      const { data } = await res.json()
      if (data) { setWeightKg(kg); setShowWeightPrompt(false); setWeightInput('') }
    } catch (_e) {}
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const waterGoal   = weightKg ? calcWaterGoal(weightKg) : { litres: 2.5, glasses: 10 }
  const lbsDisplay  = weightKg ? Math.round(weightKg * 2.205) : null
  const fillPct     = Math.max(4, Math.round((water / waterGoal.glasses) * 100))
  const habitsTotal = habits.length
  const habitsDone  = Object.values(checkedHabits).filter(Boolean).length
  const s           = (obj: React.CSSProperties) => obj

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (!profileLoaded) return (
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif" })}>
      <div style={s({ padding: '20px 22px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)', background: '#1a1a18' })}>
        <div className="shimmer-dark" style={s({ width: 80, height: 11, marginBottom: 8 })}/>
        <div className="shimmer-dark" style={s({ width: 140, height: 26, borderRadius: 6, marginBottom: 10 })}/>
      </div>
      <div style={s({ padding: '20px 22px 0' })}>
        <div className="shimmer" style={s({ width: 100, height: 10, marginBottom: 14 })}/>
        <div className="shimmer" style={s({ height: 90, borderRadius: 16, marginBottom: 20 })}/>
        <div className="shimmer" style={s({ width: 100, height: 10, marginBottom: 14 })}/>
        <div className="shimmer" style={s({ height: 180, borderRadius: 16, marginBottom: 20 })}/>
        <div className="shimmer" style={s({ width: 100, height: 10, marginBottom: 14 })}/>
        <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 })}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="shimmer" style={s({ height: 96, borderRadius: 14 })}/>
          ))}
        </div>
      </div>
    </main>
  )

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <AuthGuard>
      <main style={s({
        minHeight: '100dvh',
        background: '#faf8f4',
        fontFamily: "'DM Sans', Arial, sans-serif",
        paddingBottom: 'calc(70px + env(safe-area-inset-bottom))',
      })}>

        {/* Offline bar */}
        {isOffline && (
          <div style={s({ background: '#1a1a18', color: 'white', textAlign: 'center', padding: '8px 16px', fontSize: 12, fontWeight: 600 })}>
            You're offline — changes will not be saved
          </div>
        )}

        {/* ── Header ── */}
        <div style={s({
          background: '#1a1a18',
          padding: '20px 22px 20px',
          paddingTop: isOffline ? '20px' : 'calc(env(safe-area-inset-top) + 20px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        })}>
          <div>
            <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 })}>{getGreeting()}</div>
            <div style={s({ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif", marginTop: 2 })}>
              {userName}
            </div>
            {streak >= 3 && (
              <div style={s({ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(196,163,90,0.15)', border: '1px solid rgba(196,163,90,0.35)', borderRadius: 30, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#f0d080', marginTop: 6 })}>
                <svg width="11" height="13" viewBox="0 0 12 14" fill="none">
                  <path d="M6 1C6 1 9.5 4 9.5 7.5C9.5 9.43 7.93 11 6 11C4.07 11 2.5 9.43 2.5 7.5C2.5 6.5 3 5.5 3 5.5C3 5.5 3.5 7 5 7C5 7 3.5 5 6 1Z" fill="#f0d080" opacity="0.9"/>
                </svg>
                {streak} day streak
              </div>
            )}
          </div>
          <div style={s({ display: 'flex', gap: 8, alignItems: 'center' })}>
            {saving && <div style={s({ fontSize: 10, color: 'rgba(255,255,255,0.3)' })}>Saving…</div>}
            <button onClick={() => router.push('/dashboard/profile')} style={s({ width: 40, height: 40, borderRadius: '50%', background: 'rgba(125,184,74,0.15)', border: '1px solid rgba(125,184,74,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })}>
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="8" r="3.5" stroke="#a8c48a" strokeWidth="1.6"/>
                <path d="M4 19C4 15.69 7.13 13 11 13C14.87 13 18 15.69 18 19" stroke="#a8c48a" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <RamadanBanner />
        <IFBanner isPro={isPro} />

        <div style={s({ padding: '20px 22px 0' })}>

          {/* ── Daily Check-in ── */}
          <div style={s({ marginBottom: 24 })}>
            <SectionLabel>Daily check-in</SectionLabel>
            {checkinDone ? (
              <div style={s({ background: '#e8f5e0', border: '1px solid #97C459', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 })}>
                <div style={s({ width: 36, height: 36, borderRadius: '50%', background: '#4a7c2f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })}>
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <path d="M1 7l4.5 4.5L15 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: '#27500A' })}>
                    Check-in done — feeling {checkinMoodLabel} today
                  </div>
                  <div style={s({ fontSize: 11, color: '#4a7c2f', marginTop: 2 })}>Morning check-in complete</div>
                </div>
              </div>
            ) : (
              <div style={s({ background: '#1a1a18', border: '1px solid rgba(125,184,74,0.2)', borderRadius: 16, padding: '18px', position: 'relative', overflow: 'hidden' })}>
                <div style={s({ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: '#7db84a', opacity: 0.06, top: -40, right: -30, pointerEvents: 'none' })}/>
                <div style={s({ position: 'relative', zIndex: 1 })}>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4 })}>How are you feeling today?</div>
                  <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 16 })}>
                    A 2-minute check-in sets your day up right.
                  </div>
                  <button onClick={() => router.push('/checkin?type=morning')} style={s({ width: '100%', padding: '12px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
                    Start check-in →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Water Intake ── */}
          <div style={s({ marginBottom: 24 })}>
            <SectionLabel>Water intake</SectionLabel>

            {/* Weight prompt — only shows if no weight set */}
            {showWeightPrompt && (
              <div style={s({ background: '#e8f5e0', border: '1px solid #97C459', borderRadius: 14, padding: 14, marginBottom: 10 })}>
                <div style={s({ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 4 })}>Set your water goal</div>
                <div style={s({ fontSize: 12, color: '#3B6D11', marginBottom: 10, lineHeight: 1.5 })}>Enter your weight to get a personalised daily target.</div>
                <div style={s({ display: 'flex', gap: 6, marginBottom: 8 })}>
                  <button onClick={() => setWeightUnit('kg')} style={s({ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${weightUnit === 'kg' ? '#4a7c2f' : '#c0dd97'}`, background: weightUnit === 'kg' ? '#4a7c2f' : 'white', color: weightUnit === 'kg' ? 'white' : '#4a7c2f', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>kg</button>
                  <button onClick={() => setWeightUnit('lbs')} style={s({ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${weightUnit === 'lbs' ? '#4a7c2f' : '#c0dd97'}`, background: weightUnit === 'lbs' ? '#4a7c2f' : 'white', color: weightUnit === 'lbs' ? 'white' : '#4a7c2f', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>lbs</button>
                </div>
                <div style={s({ display: 'flex', gap: 8 })}>
                  <input
                    type="number" placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                    min="1" max="300" value={weightInput}
                    onChange={e => { const v = e.target.value; if (v === '' || parseFloat(v) > 0) setWeightInput(v) }}
                    onKeyDown={e => e.key === 'Enter' && saveWeight()}
                    style={s({ flex: 1, padding: '9px 12px', border: '1.5px solid #97C459', borderRadius: 8, fontSize: 14, color: '#1a1a18', background: 'white', outline: 'none', fontFamily: "'DM Sans', Arial, sans-serif" })}
                  />
                  <button onClick={saveWeight} style={s({ padding: '9px 18px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>Save</button>
                </div>
              </div>
            )}

            <div style={s({ background: 'white', borderRadius: 16, border: '1px solid #e4e0d8', padding: 16 })}>
              {/* Top row */}
              <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 })}>
                <div>
                  <div style={s({ fontSize: 12, fontWeight: 600, color: '#3d3d3a' })}>
                    Goal: {waterGoal.litres}L
                    {weightKg && <span style={s({ fontSize: 11, color: '#9a9a92', fontWeight: 400 })}> · {weightKg}kg{lbsDisplay ? ` / ${lbsDisplay}lbs` : ''}</span>}
                  </div>
                  <div style={s({ fontSize: 11, color: '#9a9a92', marginTop: 2 })}>Each glass = 250ml</div>
                </div>
                <div style={s({ display: 'flex', alignItems: 'center', gap: 6 })}>
                  <div style={s({ background: water >= waterGoal.glasses ? '#1a1a18' : '#e8f5e0', color: water >= waterGoal.glasses ? '#a8c48a' : '#4a7c2f', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, transition: 'all 0.3s ease' })}>{water} / {waterGoal.glasses}</div>
                  {weightKg && (
                    <button onClick={() => setShowWeightPrompt(!showWeightPrompt)} style={s({ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' })}>
                      <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="2.5" stroke="#9a9a92" strokeWidth="1.4"/>
                        <path d="M9 1.5V3M9 15V16.5M1.5 9H3M15 9H16.5M3.22 3.22L4.28 4.28M13.72 13.72L14.78 14.78M14.78 3.22L13.72 4.28M4.28 13.72L3.22 14.78" stroke="#9a9a92" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Bottle + percentage */}
              <div style={s({ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 })}>
                <div style={s({ flexShrink: 0 })}>
                  <div style={s({ width: 28, height: 12, background: '#e4f0ff', borderRadius: '3px 3px 0 0', border: '1.5px solid #bdd6f5', borderBottom: 'none', margin: '0 auto' })}/>
                  <div style={s({ width: 64, height: 80, borderRadius: '6px 6px 12px 12px', border: '1.5px solid #bdd6f5', background: '#f0f8ff', overflow: 'hidden', position: 'relative' })}>
                    <div style={s({
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: water >= waterGoal.glasses ? '#4a9de8' : '#60a5e8',
                      height: `${fillPct}%`,
                      transition: 'height 0.5s cubic-bezier(0.34,1.2,0.64,1)',
                      borderRadius: '0 0 10px 10px',
                    })}>
                      <div style={s({ position: 'absolute', top: -4, left: '-10%', width: '120%', height: 8, background: '#7bb8f0', borderRadius: '50%', animation: 'waterWave 2s ease-in-out infinite' })}/>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={s({ fontSize: 28, fontWeight: 700, lineHeight: 1, color: water >= waterGoal.glasses ? '#4a7c2f' : '#0c447c', fontFamily: "'DM Serif Display', Georgia, serif", transition: 'color 0.3s ease' })}>
                    {Math.round((water / waterGoal.glasses) * 100)}%
                  </div>
                  <div style={s({ fontSize: 11, color: '#9a9a92', fontWeight: 500, marginTop: 3 })}>
                    {water >= waterGoal.glasses ? 'Goal reached' : `${waterGoal.glasses - water} glass${waterGoal.glasses - water === 1 ? '' : 'es'} to go`}
                  </div>
                </div>
              </div>

              {/* Glass grid */}
              <div style={s({ display: 'flex', gap: 6, flexWrap: 'wrap' })}>
                {Array.from({ length: waterGoal.glasses }, (_, i) => (
                  <div key={i} onClick={() => {
                    const newW = i < water ? i : i + 1
                    setWater(newW)
                    saveData({ water: newW })
                    setTappedGlass(i)
                    setTimeout(() => setTappedGlass(null), 350)
                  }} style={s({
                    width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${i < water ? '#93c5fd' : '#e4e0d8'}`,
                    background: i < water ? '#dbeeff' : '#f9f7f3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: tappedGlass === i ? 'glassPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  })}>
                    <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                      <path d="M11 3C11 3 5 9.5 5 13.5C5 16.81 7.69 19.5 11 19.5C14.31 19.5 17 16.81 17 13.5C17 9.5 11 3 11 3Z" stroke={i < water ? '#60a5e8' : '#c4c0b8'} strokeWidth="1.6" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>

              {/* Goal reached banner */}
              <div style={s({
                marginTop: 12, background: '#1a1a18', borderRadius: 12, padding: '11px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: water >= waterGoal.glasses ? 1 : 0,
                transform: water >= waterGoal.glasses ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
                pointerEvents: 'none',
              })}>
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                  <path d="M11 3C11 3 5 9.5 5 13.5C5 16.81 7.69 19.5 11 19.5C14.31 19.5 17 16.81 17 13.5C17 9.5 11 3 11 3Z" stroke="#a8c48a" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
                <div>
                  <div style={s({ fontSize: 13, fontWeight: 600, color: '#a8c48a' })}>Hydration goal reached!</div>
                  <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 })}>Your body thanks you</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Daily Habits ── */}
          <div style={s({ marginBottom: 24 })}>
            <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 })}>
              <div style={s({ display: 'flex', alignItems: 'center', gap: 8 })}>
                <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
                <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a', letterSpacing: '0.02em' })}>Daily habits</div>
              </div>
              <div style={s({ fontSize: 12, fontWeight: 600, color: habitsDone === habitsTotal ? '#4a7c2f' : '#9a9a92' })}>
                {habitsDone}/{habitsTotal}
              </div>
            </div>

            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 })}>
              {habits.map((h, i) => {
                const isChecked = !!checkedHabits[i]
                const isStepsCard = h.isSteps

                // steps card sub-label
                const stepsSub = isChecked && stepsRange
                  ? stepsRange + ' steps today'
                  : stepsOpen
                  ? 'Tap your range'
                  : h.sub

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (isStepsCard) {
                        if (isChecked) {
                          // uncheck steps
                          const updated = { ...checkedHabits, [i]: false }
                          setCheckedHabits(updated)
                          setStepsRange(null)
                          setStepsOpen(false)
                          saveData({ habits: updated, stepsRange: null })
                        } else {
                          setStepsOpen(o => !o)
                        }
                        return
                      }
                      const updated = { ...checkedHabits, [i]: !checkedHabits[i] }
                      setCheckedHabits(updated)
                      saveData({ habits: updated })
                      setBouncingHabit(i)
                      setTimeout(() => setBouncingHabit(null), 400)
                    }}
                    style={s({
                      background: isChecked ? '#e8f5e0' : 'white',
                      border: `1.5px solid ${isChecked ? '#7db84a' : stepsOpen && isStepsCard ? '#4a7c2f' : '#e4e0d8'}`,
                      borderRadius: 14, padding: 14, cursor: 'pointer', position: 'relative',
                      animation: bouncingHabit === i
                        ? (isChecked ? 'habitUncheck 0.2s ease forwards' : 'habitBounce 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards')
                        : 'none',
                    })}
                  >
                    {isChecked && <Checkmark />}

                    <div style={{
                      marginBottom: 8,
                      animation: bouncingHabit === i && !isChecked ? 'iconPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
                    }}>
                      {habitIcons[h.iconKey](isChecked ? '#4a7c2f' : '#b4b2a9')}
                    </div>

                    <div style={s({ fontSize: 13, fontWeight: 600, color: isChecked ? '#4a7c2f' : '#3d3d3a' })}>{h.label}</div>
                    <div style={s({ fontSize: 11, color: isChecked ? '#7db84a' : '#9a9a92', marginTop: 2 })}>{stepsSub}</div>

                    {/* Steps pill selector */}
                    {isStepsCard && stepsOpen && !isChecked && (
                      <div style={s({ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 })} onClick={e => e.stopPropagation()}>
                        {STEP_RANGES.map(range => (
                          <button
                            key={range}
                            onClick={() => {
                              const updated = { ...checkedHabits, [i]: true }
                              setCheckedHabits(updated)
                              setStepsRange(range)
                              setStepsOpen(false)
                              saveData({ habits: updated, stepsRange: range })
                              setBouncingHabit(i)
                              setTimeout(() => setBouncingHabit(null), 400)
                            }}
                            style={s({ padding: '5px 9px', borderRadius: 20, border: '1.5px solid #e4e0d8', background: 'white', fontSize: 11, fontWeight: 600, color: '#7a7a72', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", transition: 'all 0.15s ease' })}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* ── Bottom nav ── */}
        <div style={s({
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'white', borderTop: '1px solid #e4e0d8',
          display: 'flex', paddingTop: 10,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
          zIndex: 100,
        })}>
          {/* Today */}
          <button onClick={() => router.push('/dashboard')} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0', background: 'none', border: 'none' })}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V14H8V20H4C3.45 20 3 19.55 3 19V9.5Z" stroke="#4a7c2f" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(74,124,47,0.12)"/>
            </svg>
            <div style={s({ fontSize: 10, fontWeight: 700, color: '#4a7c2f', fontFamily: "'DM Sans', Arial, sans-serif" })}>Today</div>
            <div style={s({ width: 4, height: 4, borderRadius: '50%', background: '#4a7c2f' })}/>
          </button>

          {/* Meals */}
          <button onClick={() => router.push('/dashboard/meals')} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0', background: 'none', border: 'none' })}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 6C4 5.45 4.45 5 5 5H17C17.55 5 18 5.45 18 6V8C18 10.76 15.31 13 12 13H10C6.69 13 4 10.76 4 8V6Z" stroke="#9a9a92" strokeWidth="1.6"/>
              <path d="M11 13V18M8 18H14" stroke="#9a9a92" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M4 7H3C2.45 7 2 7.45 2 8V9C2 10.1 2.9 11 4 11" stroke="#9a9a92" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M18 7H19C19.55 7 20 7.45 20 8V9C20 10.1 19.1 11 18 11" stroke="#9a9a92" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <div style={s({ fontSize: 10, fontWeight: 500, color: '#7a7a72', fontFamily: "'DM Sans', Arial, sans-serif" })}>Meals</div>
          </button>

          {/* Workout */}
          <button onClick={() => router.push('/dashboard/workout')} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0', background: 'none', border: 'none' })}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="9" width="4" height="4" rx="1" stroke="#9a9a92" strokeWidth="1.6"/>
              <rect x="16" y="9" width="4" height="4" rx="1" stroke="#9a9a92" strokeWidth="1.6"/>
              <path d="M6 11H16" stroke="#9a9a92" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M8 7V15M14 7V15" stroke="#9a9a92" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <div style={s({ fontSize: 10, fontWeight: 500, color: '#7a7a72', fontFamily: "'DM Sans', Arial, sans-serif" })}>Workout</div>
          </button>

          {/* Progress */}
          <button onClick={() => router.push('/dashboard/progress')} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0', background: 'none', border: 'none' })}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 16L8 10L12 13L16 7L19 9" stroke="#9a9a92" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 7H19V10" stroke="#9a9a92" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={s({ fontSize: 10, fontWeight: 500, color: '#7a7a72', fontFamily: "'DM Sans', Arial, sans-serif" })}>Progress</div>
          </button>
        </div>

      </main>
    </AuthGuard>
  )
}
