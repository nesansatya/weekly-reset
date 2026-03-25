'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import AuthGuard from '../components/AuthGuard'
import RamadanBanner from '../components/RamadanBanner'

const days = [
  { name: 'Monday', type: 'Strength', duration: '30–40 min', exercises: [
    { name: 'Push-ups', sets: '3 × 12' },
    { name: 'Bodyweight squats', sets: '3 × 12' },
    { name: 'Plank', sets: '3 × 30 sec' },
    { name: 'Lunges', sets: '3 × 10 each' },
    { name: '20-min walk', sets: '' },
  ]},
  { name: 'Tuesday', type: 'Movement', duration: '8k–10k steps', exercises: [
    { name: '8k–10k steps', sets: '' },
    { name: 'Light stretching', sets: '' },
    { name: 'Yoga (optional)', sets: '' },
  ]},
  { name: 'Wednesday', type: 'Strength', duration: '30–40 min', exercises: [
    { name: 'Push-ups', sets: '3 × 12' },
    { name: 'Bodyweight squats', sets: '3 × 12' },
    { name: 'Plank', sets: '3 × 30 sec' },
    { name: 'Resistance band rows', sets: '3 × 12' },
  ]},
  { name: 'Thursday', type: 'Recovery', duration: '30–40 min', exercises: [
    { name: '30–40 min walk', sets: '' },
    { name: 'Stretching', sets: '' },
  ]},
  { name: 'Friday', type: 'Strength', duration: '30–40 min', exercises: [
    { name: 'Push-ups', sets: '3 × 14' },
    { name: 'Bodyweight squats', sets: '3 × 14' },
    { name: 'Plank', sets: '3 × 35 sec' },
    { name: 'Lunges', sets: '3 × 12 each' },
  ]},
  { name: 'Saturday', type: 'Outdoors', duration: '45–60 min', exercises: [
    { name: 'Hiking / badminton / swimming / cycling', sets: '' },
  ]},
  { name: 'Sunday', type: 'Rest', duration: 'Easy day', exercises: [
    { name: 'Light walk', sets: '' },
    { name: 'Stretching', sets: '' },
    { name: 'Meal prep', sets: '' },
  ]},
]

const habits = [
  { icon: '☀️', label: 'Morning sunlight', sub: '10–15 min outside' },
  { icon: '💧', label: '500ml on waking', sub: 'Before anything else' },
  { icon: '🚶', label: 'Steps goal', sub: 'Check Galaxy Watch' },
  { icon: '🥗', label: '3 structured meals', sub: 'No constant snacking' },
  { icon: '📵', label: 'Phone off 1hr before bed', sub: 'Protect your sleep' },
  { icon: '🌙', label: 'Sleep before midnight', sub: '7–8 hours target' },
]

const moods = [
  { e: '😔', l: 'Low' }, { e: '😐', l: 'Meh' }, { e: '🙂', l: 'Okay' },
  { e: '😊', l: 'Good' }, { e: '😄', l: 'Great' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  return 'Good evening,'
}

function getRecommendation(mood: number, energy: number) {
  if (mood === 0 && energy === 0) return null
  const m = mood || 3
  const e = energy || 3
  if (m <= 2 && e <= 2) return {
    message: "Rough day — and that's completely okay.",
    action: "Skip the hard stuff today. One 10-min walk outside will shift your energy more than anything else right now.",
    highlight: [0, 1, 5], highlightLabel: "Focus on just these 3 today",
    bg: '#fde8e0', border: '#f0997b', text: '#712b13', dot: '#D85A30',
  }
  if (m <= 2 && e >= 3) return {
    message: "Feeling down but your body has energy.",
    action: "Use that energy — move your body for 20 minutes. Physical activity is the fastest natural mood booster.",
    highlight: [0, 2, 3], highlightLabel: "These will lift your mood today",
    bg: '#fff4e0', border: '#f5d58a', text: '#633806', dot: '#BA7517',
  }
  if (m >= 3 && e <= 2) return {
    message: "Good mindset, but your body needs fuel.",
    action: "Drink 500ml of water right now, eat a proper meal, and get to bed before midnight tonight.",
    highlight: [1, 3, 5], highlightLabel: "Your energy boosters for today",
    bg: '#e0eeff', border: '#85B7EB', text: '#0C447C', dot: '#185FA5',
  }
  if (m >= 4 && e >= 4) return {
    message: "You're in the zone today! 🔥",
    action: "Great day to push harder — add an extra set, go for a longer walk, or tick off every habit on the list.",
    highlight: [], highlightLabel: "",
    bg: '#e8f5e0', border: '#97C459', text: '#27500A', dot: '#4a7c2f',
  }
  return {
    message: "Steady day — stick to the plan.",
    action: "Consistency on average days is what builds the habit. Complete your routine and keep the streak alive.",
    highlight: [], highlightLabel: "",
    bg: '#f0f7e8', border: '#c0dd97', text: '#3B6D11', dot: '#639922',
  }
}

const quotes = [
  "Consistency beats intensity. You don't need a perfect plan — you need a routine you can follow for years.",
  "Small daily improvements are the key to staggering long-term results.",
  "You don't rise to the level of your goals — you fall to the level of your systems.",
  "The best workout is the one you actually do.",
  "Sleep, water, movement. Master the basics before anything else.",
  "Rest is not laziness — it's where your body rebuilds.",
  "You don't need a gym. You need a decision.",
  "Progress is progress, no matter how small.",
  "A 30-minute walk beats zero hours at the gym.",
  "Discipline is just doing it even when you don't feel like it.",
  "Your future self is being built by your habits today.",
  "The only bad workout is the one that didn't happen.",
  "Eat well, move daily, sleep enough. That's the whole secret.",
  "Motivation gets you started. Habit keeps you going.",
  "Every expert was once a beginner who simply didn't quit.",
  "Your body can do it. It's your mind you need to convince.",
  "One percent better every day. That's all it takes.",
  "You are one good night's sleep away from a better mood.",
  "Drink your water. Go outside. It really is that simple.",
  "Health is not a destination — it's a way of living.",
  "Show up on your worst days and the best days will take care of themselves.",
  "The pain of discipline weighs ounces. The pain of regret weighs tonnes.",
  "Strong is not a size. Strong is showing up.",
  "Your habits are your future self in disguise.",
  "Make the choice today that your future self will thank you for.",
  "It's not about having time. It's about making time.",
  "A walk a day keeps the doctor away — and the bad mood too.",
  "Real change happens in the quiet, unglamorous daily moments.",
  "You don't have to be extreme — just consistent.",
  "Take care of your body. It's the only place you have to live.",
]

function QuoteBanner() {
  const [current, setCurrent] = React.useState(() => {
    const day = new Date().getDay()
    const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
    return (day + week) % quotes.length
  })

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % quotes.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      margin: '16px 22px 20px',
      background: '#fef3d0',
      border: '1px solid #f5d58a',
      borderRadius: 14,
      padding: '20px 18px',
    }}>
      <div style={{
        fontSize: 42, lineHeight: 1, marginBottom: 4,
        fontFamily: "'Playfair Display', 'DM Serif Display', Georgia, serif",
        color: '#ba7517',
      }}>"</div>
      <div style={{
        fontFamily: "'Playfair Display', 'DM Serif Display', Georgia, serif",
        fontStyle: 'italic', fontWeight: 700, fontSize: 15,
        color: '#633806', lineHeight: 1.6, marginBottom: 12,
      }}>
        {quotes[current]}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#ba7517',
        fontFamily: "'DM Sans', Arial, sans-serif", marginBottom: 12,
      }}>— Your Weekly Reset</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ width: 16, height: 5, borderRadius: 3, background: '#ba7517' }}/>
        <div style={{ width: 5, height: 5, borderRadius: 3, background: '#f5d58a' }}/>
        <div style={{ width: 5, height: 5, borderRadius: 3, background: '#f5d58a' }}/>
        <div style={{ fontSize: 10, color: '#ba7517', fontWeight: 600, fontFamily: "'DM Sans', Arial, sans-serif", marginLeft: 2 }}>
          {current + 1} / {quotes.length}
        </div>
      </div>
    </div>
  )
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

type DifficultyLevel = 'easy' | 'moderate' | 'hard' | 'push'

function getWorkoutDifficulty(
  fitnessLevel: string,
  mood: number,
  energy: number,
  streak: number,
  dayIndex: number
): {
  level: DifficultyLevel
  badge: string
  color: string
  bg: string
  border: string
  coachMessage: string
  multiplier: number
} {
  // Base level from fitness
  let base: DifficultyLevel =
    fitnessLevel === 'Complete beginner' ? 'easy' :
    fitnessLevel === 'Some experience' ? 'moderate' :
    fitnessLevel === 'Intermediate' ? 'hard' :
    fitnessLevel === 'Pretty active' ? 'push' : 'moderate'

  // Day modifier — Wednesday & Thursday are lighter days
  const isLighterDay = dayIndex === 2 || dayIndex === 3
  if (isLighterDay && base === 'push') base = 'hard'
  if (isLighterDay && base === 'hard') base = 'moderate'

  // Mood & energy override — if user is having a rough day, drop one level
  const moodEnergy = (mood + energy) / 2
  let level = base
  if (mood > 0 && energy > 0) {
    if (moodEnergy <= 2) {
      // Rough day — drop one level but never skip
      level = base === 'push' ? 'hard' :
              base === 'hard' ? 'moderate' :
              base === 'moderate' ? 'easy' : 'easy'
    } else if (moodEnergy >= 4.5 && streak >= 7) {
      // Feeling great + strong streak — push harder
      level = base === 'easy' ? 'moderate' :
              base === 'moderate' ? 'hard' :
              base === 'hard' ? 'push' : 'push'
    }
  }

  // Streak booster — 7+ day streak nudges up
  if (streak >= 14 && level !== 'push') {
    level = level === 'easy' ? 'moderate' :
            level === 'moderate' ? 'hard' : 'push'
  }

  const configs = {
    easy: {
      badge: '🌱 Easy',
      color: '#27500A',
      bg: '#e8f5e0',
      border: '#97C459',
      multiplier: 0.7,
      coachMessage: mood > 0 && energy > 0 && moodEnergy <= 2
        ? "Rough day detected — we've lightened today's load. But you're still showing up and that's what counts. 💪"
        : "We've set a beginner-friendly pace. Consistency beats intensity every single time. Just start! 🌱",
    },
    moderate: {
      badge: '💪 Moderate',
      color: '#633806',
      bg: '#fff4e0',
      border: '#f5d58a',
      multiplier: 1.0,
      coachMessage: mood > 0 && energy > 0 && moodEnergy <= 2
        ? "Not your best day — but moderate effort today keeps the streak alive. Keep going! 🙌"
        : "Solid day ahead. Stick to the plan, complete your sets, and build on yesterday. 💪",
    },
    hard: {
      badge: '🔥 Hard',
      color: '#7c2f0c',
      bg: '#fde8e0',
      border: '#f0997b',
      multiplier: 1.25,
      coachMessage: mood > 0 && energy > 0 && moodEnergy >= 4
        ? "You're feeling good and your body is ready — push through today's harder sets! 🔥"
        : `${streak >= 7 ? `${streak}-day streak — your body is adapting. Time to push harder!` : "Your fitness level is ready for a challenge. Go get it!"} 🔥`,
    },
    push: {
      badge: '⚡ Push Mode',
      color: '#1a1a18',
      bg: '#1a1a18',
      border: '#7db84a',
      multiplier: 1.5,
      coachMessage: mood > 0 && energy > 0 && moodEnergy >= 4.5 && streak >= 7
        ? `${streak}-day streak and feeling great — this is your peak. Push harder than yesterday! ⚡`
        : "You're experienced and your body is built for this. No holding back today! ⚡",
    },
  }

  return { level, ...configs[level] }
}

function adjustSets(sets: string, multiplier: number): string {
  if (!sets) return sets
  // Handle "3 × 12" format
  const match = sets.match(/^(\d+)\s*[×x]\s*(\d+)(.*)$/)
  if (match) {
    const reps = Math.round(parseInt(match[2]) * multiplier)
    return `${match[1]} × ${reps}${match[3]}`
  }
  // Handle "3 × 30 sec" format
  const timeMatch = sets.match(/^(\d+)\s*[×x]\s*(\d+)\s*(sec|min)(.*)$/)
  if (timeMatch) {
    const time = Math.round(parseInt(timeMatch[2]) * multiplier)
    return `${timeMatch[1]} × ${time} ${timeMatch[3]}${timeMatch[4]}`
  }
  return sets
}

function calcWaterGoal(weightKg: number) {
  const litres = weightKg * 0.033
  const glasses = Math.round(litres / 0.25)
  return { litres: Math.round(litres * 10) / 10, glasses: Math.max(6, Math.min(16, glasses)) }
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const [currentDay, setCurrentDay] = useState(todayIdx)
  const [checkedEx, setCheckedEx] = useState<Record<number, boolean>>({})
  const [checkedHabits, setCheckedHabits] = useState<Record<number, boolean>>({})
  const [water, setWater] = useState(0)
  const [mood, setMood] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [userName, setUserName] = useState('there')
  const [streak, setStreak] = useState(0)
  const [saving, setSaving] = useState(false)
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [showWeightPrompt, setShowWeightPrompt] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [isOffline, setIsOffline] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [sleepQuality, setSleepQuality] = useState('')
  const [healthChallenge, setHealthChallenge] = useState('')
  const [workSchedule, setWorkSchedule] = useState('')
  const [waterIntake, setWaterIntake] = useState('')
  const [stressLevel, setStressLevel] = useState('')
  const [isPro, setIsPro] = useState(false)

  // #5 — Offline detection
  useEffect(() => {
    function handleOffline() { setIsOffline(true) }
    function handleOnline() { setIsOffline(false) }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    setIsOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
      setUserName(name.split(' ')[0])
      const today = new Date().toISOString().split('T')[0]
      try {
        const [dailyRes, exerciseRes, habitRes, streakRes, profileRes] = await Promise.all([
          fetchWithTimeout(`/api/logs/daily?date=${today}`),
          fetchWithTimeout(`/api/logs/exercise?date=${today}`),
          fetchWithTimeout(`/api/logs/habits?date=${today}`),
          fetchWithTimeout('/api/streak'),
          fetchWithTimeout('/api/profile'),
        ])
        const [daily, exercise, habit, streakData, profile] = await Promise.all([
          dailyRes.json(), exerciseRes.json(), habitRes.json(), streakRes.json(), profileRes.json()
        ])
        if (daily.data) {
          setMood(daily.data.mood || 0)
          setEnergy(daily.data.energy || 0)
          setWater(daily.data.water_glasses || 0)
        }
        if (exercise.data?.completed_exercises) setCheckedEx(exercise.data.completed_exercises)
        if (habit.data?.checked_habits) setCheckedHabits(habit.data.checked_habits)
        // #6 — streak only set once here, not again in saveData
        if (streakData.data) setStreak(streakData.data.current_streak || 0)
        if (profile.data?.weight_kg) {
          setWeightKg(profile.data.weight_kg)
          setShowWeightPrompt(false)
        } else {
          setShowWeightPrompt(true)
        }
        if (profile.data?.is_pro) setIsPro(profile.data.is_pro)
        if (profile.data?.fitness_level) setFitnessLevel(profile.data.fitness_level)
        if (profile.data?.sleep_quality) setSleepQuality(profile.data.sleep_quality)
        if (profile.data?.health_challenge) setHealthChallenge(profile.data.health_challenge)
        if (profile.data?.work_schedule) setWorkSchedule(profile.data.work_schedule)
        if (profile.data?.water_intake) setWaterIntake(profile.data.water_intake)
        if (profile.data?.stress_level) setStressLevel(profile.data.stress_level)
        setProfileLoaded(true)
      } catch (_e) {
        setShowWeightPrompt(true)
        setProfileLoaded(true)
      }
    }
    init()
  }, [])

  async function saveWeight() {
    let kg = parseFloat(weightInput)
    if (isNaN(kg) || kg <= 0 || kg > 300) return
    if (weightUnit === 'lbs') kg = Math.round(kg / 2.205 * 10) / 10
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: kg }),
      })
      const { data } = await res.json()
      if (data) {
        setWeightKg(kg)
        setShowWeightPrompt(false)
        setWeightInput('')
      }
    } catch (_e) { }
  }

  // #7 — debounced saveData to prevent race conditions
  const saveData = useCallback(async (updates: {
    mood?: number, energy?: number, water?: number,
    habits?: Record<number, boolean>, exercises?: Record<number, boolean>
  }) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true)
      const m = updates.mood ?? mood
      const e = updates.energy ?? energy
      const w = updates.water ?? water
      const h = updates.habits ?? checkedHabits
      const ex = updates.exercises ?? checkedEx
      try {
        await Promise.all([
          fetch('/api/logs/daily', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood: m, energy: e, waterGlasses: w }),
          }),
          fetch('/api/logs/habits', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkedHabits: h }),
          }),
          fetch('/api/logs/exercise', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dayIndex: currentDay, completedExercises: ex }),
          }),
        ])
        const habitsCount = Object.values(h).filter(Boolean).length
        if (habitsCount >= 3 || Object.values(ex).some(Boolean) || w >= 5 || m > 0) {
          const res = await fetch('/api/streak', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habitsCompleted: habitsCount }),
          })
          const { data } = await res.json()
          if (data) setStreak(data.current_streak || 0)
        }
      } catch (_e) { }
      setSaving(false)
    }, 600)
  }, [mood, energy, water, checkedHabits, checkedEx, currentDay])

  const rec = getRecommendation(mood, energy)
  const dayData = days[currentDay]
  const difficulty = getWorkoutDifficulty(fitnessLevel, mood, energy, streak, currentDay)
  const adjustedExercises = dayData.exercises.map(ex => ({
    ...ex,
    sets: adjustSets(ex.sets, difficulty.multiplier)
  }))
  const exDone = Object.values(checkedEx).filter(Boolean).length
  const exTotal = adjustedExercises.length
  const pct = exTotal > 0 ? Math.round(exDone / exTotal * 100) : 0
  const waterGoal = weightKg ? calcWaterGoal(weightKg) : { litres: 2.5, glasses: 10 }
  const lbsDisplay = weightKg ? Math.round(weightKg * 2.205) : null

  const s = (obj: React.CSSProperties) => obj

  const BOTTOM_NAV_HEIGHT = 70

  return (
  <AuthGuard>
    <main style={s({
      minHeight: '100dvh',
      background: '#faf8f4',
      fontFamily: "'DM Sans', Arial, sans-serif",
      paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
    })}>

      {/* Offline banner */}
      {isOffline && (
        <div style={s({
          background: '#1a1a18', color: 'white',
          textAlign: 'center', padding: '8px 16px',
          fontSize: 12, fontWeight: 600,
          fontFamily: "'DM Sans', Arial, sans-serif",
        })}>
          ⚠️ You're offline — changes will not be saved
        </div>
      )}

      {/* Header */}
      <div style={s({
        padding: '16px 22px 0',
        paddingTop: isOffline ? '16px' : 'calc(env(safe-area-inset-top) + 16px)',
        background: '#d4cfc4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      })}>
        <div>
          <div style={s({ fontSize: 12, color: '#7a7a72', fontWeight: 500 })}>{getGreeting()}</div>
          <div style={s({ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif", marginTop: 2 })}>
            {userName} 👋
          </div>
          <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 })}>
            {streak > 0 && (
              <div style={s({ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff4e0', border: '1px solid #f5d58a', borderRadius: 30, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#8a6200' })}>
                🔥 {streak} day streak
              </div>
            )}
            {saving && <div style={s({ fontSize: 11, color: '#7a7a72' })}>Saving...</div>}
          </div>
        </div>
        <button onClick={() => router.push('/dashboard/profile')} style={s({ width: 42, height: 42, borderRadius: '50%', background: '#1a1a18', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginTop: 8, flexShrink: 0 })}>
          🌿
        </button>
      </div>

      {/* Hero card */}
      <div style={s({ margin: '16px 22px 0', background: '#1a1a18', borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden' })}>
        <div style={s({ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: '#7db84a', opacity: 0.08, top: -40, right: -40 })}/>
        <div style={s({ position: 'relative', zIndex: 1 })}>
          <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 })}>
            {dayData.name} · {dayData.type}
          </div>
          <div style={s({ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 6 })}>
            {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={s({ display: 'inline-block', background: 'rgba(125,184,74,0.25)', border: '1px solid rgba(125,184,74,0.4)', color: '#a8c48a', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, marginBottom: 14 })}>
            {dayData.type} · {dayData.duration}
          </div>
          <div style={s({ display: 'flex', alignItems: 'center', gap: 10 })}>
            <div style={s({ flex: 1, height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' })}>
              <div style={s({ height: '100%', borderRadius: 10, background: '#7db84a', width: `${pct}%`, transition: 'width 0.3s' })}/>
            </div>
            <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.6)' })}>{exDone}/{exTotal}</div>
          </div>
        </div>
      </div>

      {/* Ramadan Banner */}
      <RamadanBanner />

      {/* Personalised Insight Banner */}
      {(() => {
        const banners = []

        // Sleep
        if (sleepQuality === 'Very poor' || sleepQuality === 'Could be better') banners.push(
          <div key="sleep" style={s({ margin: '12px 22px 0', background: '#e0eeff', border: '1px solid #85B7EB', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#0C447C', marginBottom: 2 })}>😴 Sleep is your #1 priority</div>
            <div style={s({ fontSize: 12, color: '#185FA5', lineHeight: 1.5 })}>Based on your profile, improving sleep will have the biggest impact on your energy and mood.</div>
          </div>
        )
        if (sleepQuality === 'Decent' || sleepQuality === 'Pretty good') banners.push(
          <div key="sleep" style={s({ margin: '12px 22px 0', background: '#e8f5e0', border: '1px solid #97C459', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 2 })}>😴 Great sleep habits!</div>
            <div style={s({ fontSize: 12, color: '#3B6D11', lineHeight: 1.5 })}>You're sleeping well — keep protecting that routine. Good sleep is the foundation of everything else.</div>
          </div>
        )

        // Stress
        if (stressLevel === 'Very high' || stressLevel === 'High') banners.push(
          <div key="stress" style={s({ margin: '12px 22px 0', background: '#f0e8ff', border: '1px solid #b085eb', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#4a0c7c', marginBottom: 2 })}>🧘 High stress detected</div>
            <div style={s({ fontSize: 12, color: '#6a1fa5', lineHeight: 1.5 })}>Take it easy today. Recovery and light movement will serve you better than intense workouts right now.</div>
          </div>
        )
        if (stressLevel === 'Moderate' || stressLevel === 'Low') banners.push(
          <div key="stress" style={s({ margin: '12px 22px 0', background: '#e8f5e0', border: '1px solid #97C459', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 2 })}>🧘 Great headspace today!</div>
            <div style={s({ fontSize: 12, color: '#3B6D11', lineHeight: 1.5 })}>Your stress is under control — this is the perfect mental state to build strong habits. Make it count!</div>
          </div>
        )

        // Work schedule
        if (workSchedule === 'Desk job — mostly sitting') banners.push(
          <div key="work" style={s({ margin: '12px 22px 0', background: '#fff4e0', border: '1px solid #f5d58a', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#633806', marginBottom: 2 })}>💼 Desk job reminder</div>
            <div style={s({ fontSize: 12, color: '#BA7517', lineHeight: 1.5 })}>You sit most of the day — make your steps goal and morning sunlight non-negotiable today.</div>
          </div>
        )
        if (workSchedule === 'On my feet most of the day' || workSchedule === 'Physical/manual work') banners.push(
          <div key="work" style={s({ margin: '12px 22px 0', background: '#e8f5e0', border: '1px solid #97C459', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 2 })}>💪 Active job advantage!</div>
            <div style={s({ fontSize: 12, color: '#3B6D11', lineHeight: 1.5 })}>Your body is already moving at work — focus on recovery, sleep and nutrition to complement your active lifestyle.</div>
          </div>
        )

        // Water intake
        if (waterIntake === 'Less than 1L' || waterIntake === '1–1.5L') banners.push(
          <div key="water" style={s({ margin: '12px 22px 0', background: '#e0f4ff', border: '1px solid #85d4eb', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#0c4a5c', marginBottom: 2 })}>💧 You need more water</div>
            <div style={s({ fontSize: 12, color: '#185a7c', lineHeight: 1.5 })}>Your profile shows low daily water intake. Hit your water goal today — it will improve your energy within hours.</div>
          </div>
        )
        if (waterIntake === '1.5–2L' || waterIntake === 'More than 2L') banners.push(
          <div key="water" style={s({ margin: '12px 22px 0', background: '#e8f5e0', border: '1px solid #97C459', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 2 })}>💧 Great hydration habits!</div>
            <div style={s({ fontSize: 12, color: '#3B6D11', lineHeight: 1.5 })}>You're already drinking well — keep it consistent and your energy levels will stay stable all day.</div>
          </div>
        )

        // Fitness level
        if (fitnessLevel === 'Complete beginner') banners.push(
          <div key="fitness" style={s({ margin: '12px 22px 0', background: '#fff4e0', border: '1px solid #f5d58a', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#633806', marginBottom: 2 })}>🌱 Beginner tip</div>
            <div style={s({ fontSize: 12, color: '#BA7517', lineHeight: 1.5 })}>Don't worry about doing everything perfectly. Completing 50% of today's workout is a huge win. Just start!</div>
          </div>
        )
        if (fitnessLevel === 'Intermediate' || fitnessLevel === 'Pretty active') banners.push(
          <div key="fitness" style={s({ margin: '12px 22px 0', background: '#1a1a18', border: '1px solid #7db84a', borderRadius: 14, padding: '12px 16px' })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#a8c48a', marginBottom: 2 })}>🔥 You're experienced — push harder!</div>
            <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 })}>Your fitness base is solid. Add an extra set, push the pace, or add a bonus workout today.</div>
          </div>
        )
        // Free users get 1 banner only, Pro users get all
        const visibleBanners = isPro ? banners : banners.slice(0, 1)
        return <>{visibleBanners}</>
      })()}
      
      {!isPro && (
        <div style={s({ margin: '12px 22px 0', background: 'linear-gradient(135deg, #e8f5e0, #f0f7e8)', border: '1px solid #97C459', borderRadius: 14, padding: '12px 16px' })}>
          <div style={s({ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 2 })}>✦ Unlock all personalised insights</div>
          <div style={s({ fontSize: 12, color: '#3B6D11', marginBottom: 8, lineHeight: 1.5 })}>Pro users see all 5 personalised banners tailored to their profile every day.</div>
          <button onClick={() => router.push('/upgrade')} style={s({ padding: '7px 14px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>Upgrade to Pro →</button>
        </div>
      )}

      {/* Day selector */}
      <div style={s({ display: 'flex', gap: 6, padding: '16px 22px 0', overflowX: 'auto', scrollbarWidth: 'none' })}>
        {days.map((d, i) => (
          <button key={i} onClick={() => { setCurrentDay(i); setCheckedEx({}) }} style={s({
            padding: '8px 6px', minWidth: 44, borderRadius: 10,
            border: `1px solid ${i === currentDay ? '#7db84a' : '#e4e0d8'}`,
            background: i === currentDay ? '#e8f5e0' : 'white',
            cursor: 'pointer', textAlign: 'center', flexShrink: 0,
          })}>
            <div style={s({ fontSize: 10, color: i === currentDay ? '#4a7c2f' : '#7a7a72', fontWeight: 600 })}>{d.name.slice(0, 3)}</div>
            <div style={s({ fontSize: 9, color: i === currentDay ? '#4a7c2f' : '#9a9a92', marginTop: 2, fontWeight: 500 })}>{d.type.slice(0, 3)}</div>
          </button>
        ))}
      </div>

      {/* Exercises */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 })}>
          <div style={s({ display: 'flex', alignItems: 'center', gap: 8 })}>
            <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase' })}>Today's workout</div>
            {fitnessLevel && (
              <div style={s({
                fontSize: 11, fontWeight: 700,
                color: difficulty.level === 'push' ? '#a8c48a' : difficulty.color,
                background: difficulty.level === 'push' ? '#1a1a18' : difficulty.bg,
                border: `1px solid ${difficulty.border}`,
                borderRadius: 20, padding: '3px 10px',
              })}>
                {difficulty.badge}
              </div>
            )}
          </div>
          <button onClick={() => router.push('/dashboard/workout')} style={s({ fontSize: 11, fontWeight: 600, color: '#4a7c2f', background: '#e8f5e0', border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
            ✦ Customise
          </button>
        </div>
        {fitnessLevel && (
          <div style={s({
            marginBottom: 10, padding: '10px 14px',
            background: difficulty.level === 'push' ? '#1a1a18' : difficulty.bg,
            border: `1px solid ${difficulty.border}`,
            borderRadius: 10, fontSize: 12,
            color: difficulty.level === 'push' ? 'rgba(255,255,255,0.7)' : difficulty.color,
            lineHeight: 1.5,
          })}>
            {difficulty.coachMessage}
          </div>
        )}
        <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', overflow: 'hidden' })}>
          {adjustedExercises.map((ex, i) => (
            <div key={i} onClick={() => {
              const updated = { ...checkedEx, [i]: !checkedEx[i] }
              setCheckedEx(updated)
              saveData({ exercises: updated })
            }} style={s({
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
              borderBottom: i < dayData.exercises.length - 1 ? '1px solid #f5f2ec' : 'none',
              cursor: 'pointer',
            })}>
              <div style={s({
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: checkedEx[i] ? '#4a7c2f' : 'white',
                border: `2px solid ${checkedEx[i] ? '#4a7c2f' : '#e4e0d8'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              })}>
                {checkedEx[i] && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={s({ flex: 1, fontSize: 14, fontWeight: 500, color: checkedEx[i] ? '#9a9a92' : '#1a1a18', textDecoration: checkedEx[i] ? 'line-through' : 'none' })}>{ex.name}</div>
              {ex.sets && <div style={s({ fontSize: 11, color: '#7a7a72', background: '#f5f2ec', padding: '3px 8px', borderRadius: 5 })}>{ex.sets}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>How are you feeling?</div>
        <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 16 })}>
          <div style={s({ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 10 })}>Mood</div>
          <div style={s({ display: 'flex', justifyContent: 'space-between', marginBottom: 16 })}>
            {moods.map((m, i) => (
              <button key={i} onClick={() => { setMood(i + 1); saveData({ mood: i + 1 }) }} style={s({
                flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${mood === i + 1 ? '#7db84a' : '#e4e0d8'}`,
                background: mood === i + 1 ? '#e8f5e0' : 'white', textAlign: 'center',
              })}>
                <div style={{ fontSize: 22 }}>{m.e}</div>
                <div style={s({ fontSize: 9, color: mood === i + 1 ? '#4a7c2f' : '#7a7a72', marginTop: 3, fontWeight: 500 })}>{m.l}</div>
              </button>
            ))}
          </div>
          <div style={s({ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 8 })}>Energy level</div>
          <div style={s({ display: 'flex', gap: 6 })}>
            {[1,2,3,4,5].map(i => (
              <div key={i} onClick={() => { setEnergy(i); saveData({ energy: i }) }} style={s({
                flex: 1, height: 6, borderRadius: 4, cursor: 'pointer',
                background: energy >= i ? '#4a7c2f' : '#f0ece4',
              })}/>
            ))}
          </div>
          <div style={s({ display: 'flex', justifyContent: 'space-between', marginTop: 4 })}>
            <span style={s({ fontSize: 10, color: '#7a7a72' })}>Drained</span>
            <span style={s({ fontSize: 10, color: '#7a7a72' })}>Energised</span>
          </div>
        </div>
        {rec && (
          <div style={s({ marginTop: 10, background: rec.bg, border: `1px solid ${rec.border}`, borderRadius: 14, padding: '14px 16px' })}>
            <div style={s({ display: 'flex', alignItems: 'flex-start', gap: 10 })}>
              <div style={s({ width: 8, height: 8, borderRadius: '50%', background: rec.dot, flexShrink: 0, marginTop: 5 })}/>
              <div>
                <div style={s({ fontSize: 13, fontWeight: 700, color: rec.text, marginBottom: 4 })}>{rec.message}</div>
                <div style={s({ fontSize: 13, color: rec.text, lineHeight: 1.6, opacity: 0.85 })}>{rec.action}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Water */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Water intake</div>

        {profileLoaded && showWeightPrompt && (
          <div style={s({ background: '#e8f5e0', border: '1px solid #97C459', borderRadius: 14, padding: 16, marginBottom: 10 })}>
            <div style={s({ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 4 })}>Personalise your water goal 💧</div>
            <div style={s({ fontSize: 12, color: '#3B6D11', marginBottom: 12, lineHeight: 1.5 })}>
              Enter your weight and we'll calculate your exact daily water need (weight × 0.033L). Each 💧 = 250ml.
            </div>
            <div style={s({ display: 'flex', gap: 8, marginBottom: 10 })}>
              <button onClick={() => setWeightUnit('kg')} style={s({ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${weightUnit === 'kg' ? '#4a7c2f' : '#c0dd97'}`, background: weightUnit === 'kg' ? '#4a7c2f' : 'white', color: weightUnit === 'kg' ? 'white' : '#4a7c2f', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>kg</button>
              <button onClick={() => setWeightUnit('lbs')} style={s({ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${weightUnit === 'lbs' ? '#4a7c2f' : '#c0dd97'}`, background: weightUnit === 'lbs' ? '#4a7c2f' : 'white', color: weightUnit === 'lbs' ? 'white' : '#4a7c2f', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>lbs</button>
            </div>
            <div style={s({ display: 'flex', gap: 8 })}>
              <input
                type="number"
                placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                min="1"
                max="300"
                value={weightInput}
                onChange={e => {
                  const val = e.target.value
                  if (val === '' || (parseFloat(val) > 0 && parseFloat(val) <= 300)) setWeightInput(val)
                }}
                onKeyDown={e => e.key === 'Enter' && saveWeight()}
                style={s({ flex: 1, padding: '10px 12px', border: '1.5px solid #97C459', borderRadius: 8, fontSize: 14, color: '#1a1a18', background: 'white', outline: 'none', fontFamily: "'DM Sans', Arial, sans-serif" })}
              />
              <button onClick={saveWeight} style={s({ padding: '10px 20px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>Save</button>
            </div>
            {weightInput && !isNaN(parseFloat(weightInput)) && parseFloat(weightInput) > 0 && (
              <div style={s({ marginTop: 8, fontSize: 12, color: '#3B6D11', background: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '6px 10px' })}>
                {weightUnit === 'kg'
                  ? `${weightInput} kg = ${Math.round(parseFloat(weightInput) * 2.205)} lbs → daily goal: ${Math.round(parseFloat(weightInput) * 0.033 * 10) / 10}L (${Math.max(6, Math.min(16, Math.round(parseFloat(weightInput) * 0.033 / 0.25)))} × 250ml glasses)`
                  : `${weightInput} lbs = ${Math.round(parseFloat(weightInput) / 2.205 * 10) / 10} kg → daily goal: ${Math.round(parseFloat(weightInput) / 2.205 * 0.033 * 10) / 10}L (${Math.max(6, Math.min(16, Math.round(parseFloat(weightInput) / 2.205 * 0.033 / 0.25)))} × 250ml glasses)`
                }
              </div>
            )}
          </div>
        )}

        <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 16 })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 })}>
            <div>
              <div style={s({ fontSize: 12, fontWeight: 600, color: '#3d3d3a' })}>
                Goal: {waterGoal.litres}L
                {weightKg && <span style={s({ fontSize: 11, color: '#7a7a72', fontWeight: 400 })}> · {weightKg}kg{lbsDisplay ? ` / ${lbsDisplay}lbs` : ''}</span>}
              </div>
              <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>
                Each 💧 = 250ml · {waterGoal.glasses} glasses to reach your goal
              </div>
            </div>
            <div style={s({ display: 'flex', alignItems: 'center', gap: 6 })}>
              <div style={s({ background: '#e8f5e0', color: '#4a7c2f', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 })}>{water} / {waterGoal.glasses}</div>
              {weightKg && (
                <button onClick={() => setShowWeightPrompt(!showWeightPrompt)} style={s({ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' })}>⚙️</button>
              )}
            </div>
          </div>
          <div style={s({ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 })}>
            {Array.from({ length: waterGoal.glasses }, (_, i) => (
              <div key={i} onClick={() => {
                const newW = i < water ? i : i + 1
                setWater(newW)
                saveData({ water: newW })
              }} style={s({
                width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${i < water ? '#93c5fd' : '#e4e0d8'}`,
                background: i < water ? '#dbeeff' : '#f9f7f3',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
              })}>💧</div>
            ))}
          </div>
        </div>
      </div>

      {/* Habits */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 })}>
          <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase' })}>Daily habits</div>
          {rec && rec.highlight.length > 0 && (
            <div style={s({ fontSize: 11, fontWeight: 600, color: rec.text, background: rec.bg, border: `1px solid ${rec.border}`, borderRadius: 20, padding: '3px 10px' })}>
              {rec.highlightLabel}
            </div>
          )}
        </div>
        <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 })}>
          {habits.map((h, i) => {
            const isHighlighted = rec && rec.highlight.includes(i)
            return (
              <div key={i} onClick={() => {
                const updated = { ...checkedHabits, [i]: !checkedHabits[i] }
                setCheckedHabits(updated)
                saveData({ habits: updated })
              }} style={s({
                background: checkedHabits[i] ? '#e8f5e0' : isHighlighted ? rec!.bg : 'white',
                border: `${isHighlighted && !checkedHabits[i] ? '2px' : '1.5px'} solid ${checkedHabits[i] ? '#7db84a' : isHighlighted ? rec!.border : '#e4e0d8'}`,
                borderRadius: 14, padding: 14, cursor: 'pointer', position: 'relative',
              })}>
                {isHighlighted && !checkedHabits[i] && (
                  <div style={s({ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: rec!.dot })}/>
                )}
                <div style={{ fontSize: 20, marginBottom: 6 }}>{h.icon}</div>
                <div style={s({ fontSize: 13, fontWeight: 600, color: checkedHabits[i] ? '#4a7c2f' : isHighlighted ? rec!.text : '#3d3d3a' })}>{h.label}</div>
                <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>{h.sub}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Motivational Quote Banner */}
      <QuoteBanner />

      {/* Bottom nav */}
      <div style={s({
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white',
        borderTop: '1px solid #e4e0d8',
        display: 'flex',
        paddingTop: 10,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
        zIndex: 100,
      })}>
        {[
          { icon: '🏠', label: 'Today', path: '/dashboard', active: true },
          { icon: '📊', label: 'Summary', path: '/dashboard/summary', active: false },
          { icon: '🥗', label: 'Meals', path: '/dashboard/meals', active: false },
          { icon: '📈', label: 'Progress', path: '/dashboard/progress', active: false },
        ].map(n => (
          <button key={n.label} onClick={() => router.push(n.path)} style={s({
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, cursor: 'pointer', padding: '6px 0', background: 'none', border: 'none',
          })}>
            <div style={{ fontSize: 18 }}>{n.icon}</div>
            <div style={s({ fontSize: 10, fontWeight: n.active ? 700 : 500, color: n.active ? '#4a7c2f' : '#7a7a72', fontFamily: "'DM Sans', Arial, sans-serif" })}>{n.label}</div>
            {n.active && <div style={s({ width: 4, height: 4, borderRadius: '50%', background: '#4a7c2f' })}/>}
          </button>
        ))}
      </div>

    </main>
  </AuthGuard>
  )
}