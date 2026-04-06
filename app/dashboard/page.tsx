'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import AuthGuard from '../components/AuthGuard'
import RamadanBanner from '../components/RamadanBanner'
import IFBanner from '../components/IFBanner'
import confetti from 'canvas-confetti'

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

// ── FIX 2: Single smart daily insight — worst profile metric priority ──────
// Priority: Sleep → Stress → Fitness → Water → Work
function getDailyInsight(
  sleepQuality: string,
  stressLevel: string,
  fitnessLevel: string,
  waterIntake: string,
  workSchedule: string,
): { title: string; message: string; bg: string; border: string; titleColor: string; bodyColor: string } | null {
  if (sleepQuality === 'Very poor' || sleepQuality === 'Could be better') return {
    title: '😴 Sleep is your #1 priority today',
    message: 'Based on your profile, improving sleep will have the biggest impact on your energy and mood. Protect tonight.',
    bg: '#e0eeff', border: '#85B7EB', titleColor: '#0C447C', bodyColor: '#185FA5',
  }
  if (sleepQuality === 'Decent' || sleepQuality === 'Pretty good') {
    // Sleep is fine — check stress next
  } else if (sleepQuality) {
    // Great sleeper — skip
  }
  if (stressLevel === 'Very high' || stressLevel === 'High') return {
    title: '🧘 High stress — take it easy today',
    message: 'Recovery and light movement will serve you better than intense workouts right now. Be kind to yourself.',
    bg: '#f0e8ff', border: '#b085eb', titleColor: '#4a0c7c', bodyColor: '#6a1fa5',
  }
  if (fitnessLevel === 'Complete beginner') return {
    title: '🌱 Beginner tip for today',
    message: "Completing 50% of today's workout is a huge win. Don't worry about perfection — just start and keep moving.",
    bg: '#fff4e0', border: '#f5d58a', titleColor: '#633806', bodyColor: '#BA7517',
  }
  if (waterIntake === 'Less than 1L' || waterIntake === '1–1.5L') return {
    title: '💧 Your water intake needs attention',
    message: 'Your profile shows low daily water intake. Hit your water goal today — it will improve your energy within hours.',
    bg: '#e0f4ff', border: '#85d4eb', titleColor: '#0c4a5c', bodyColor: '#185a7c',
  }
  if (workSchedule === 'Desk job — mostly sitting') return {
    title: '💼 Desk job reminder',
    message: 'You sit most of the day — make your steps goal and morning sunlight non-negotiable today.',
    bg: '#fff4e0', border: '#f5d58a', titleColor: '#633806', bodyColor: '#BA7517',
  }
  if (fitnessLevel === 'Intermediate' || fitnessLevel === 'Pretty active') return {
    title: '🔥 You\'re experienced — push harder today',
    message: 'Your fitness base is solid. Add an extra set, push the pace, or add a bonus workout today.',
    bg: '#1a1a18', border: '#7db84a', titleColor: '#a8c48a', bodyColor: 'rgba(255,255,255,0.6)',
  }
  return null
}
// ─────────────────────────────────────────────────────────────────────────────

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

// ── FIX 3: Static daily quote — one per day, no rotation ─────────────────
function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return quotes[dayOfYear % quotes.length]
}
// ─────────────────────────────────────────────────────────────────────────────

function QuoteBanner() {
  const quote = getDailyQuote()
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
        {quote}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#ba7517',
        fontFamily: "'DM Sans', Arial, sans-serif",
      }}>— Your Weekly Reset · Today's quote</div>
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
  let base: DifficultyLevel =
    fitnessLevel === 'Complete beginner' ? 'easy' :
    fitnessLevel === 'Some experience' ? 'moderate' :
    fitnessLevel === 'Intermediate' ? 'hard' :
    fitnessLevel === 'Pretty active' ? 'push' : 'moderate'

  const isLighterDay = dayIndex === 2 || dayIndex === 3
  if (isLighterDay && base === 'push') base = 'hard'
  if (isLighterDay && base === 'hard') base = 'moderate'

  const moodEnergy = (mood + energy) / 2
  let level = base
  if (mood > 0 && energy > 0) {
    if (moodEnergy <= 2) {
      level = base === 'push' ? 'hard' :
              base === 'hard' ? 'moderate' :
              base === 'moderate' ? 'easy' : 'easy'
    } else if (moodEnergy >= 4.5 && streak >= 7) {
      level = base === 'easy' ? 'moderate' :
              base === 'moderate' ? 'hard' :
              base === 'hard' ? 'push' : 'push'
    }
  }

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
  const match = sets.match(/^(\d+)\s*[×x]\s*(\d+)(.*)$/)
  if (match) {
    const reps = Math.round(parseInt(match[2]) * multiplier)
    return `${match[1]} × ${reps}${match[3]}`
  }
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
  const confettiRef = useRef<HTMLCanvasElement>(null)
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [sleepQuality, setSleepQuality] = useState('')
  const [healthChallenge, setHealthChallenge] = useState('')
  const [workSchedule, setWorkSchedule] = useState('')
  const [waterIntake, setWaterIntake] = useState('')
  const [stressLevel, setStressLevel] = useState('')
  const [isPro, setIsPro] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const [showStreakReward, setShowStreakReward] = useState(false)
  const [bouncingHabit, setBouncingHabit] = useState<number | null>(null)
  const [tappedGlass, setTappedGlass] = useState<number | null>(null)

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
        try {
          const cached = localStorage.getItem('wr_profile')
          if (cached) {
            const p = JSON.parse(cached)
            if (p.weight_kg) { setWeightKg(p.weight_kg); setShowWeightPrompt(false) }
            if (p.is_pro) setIsPro(p.is_pro)
            if (p.fitness_level) setFitnessLevel(p.fitness_level)
            if (p.sleep_quality) setSleepQuality(p.sleep_quality)
            if (p.health_challenge) setHealthChallenge(p.health_challenge)
            if (p.work_schedule) setWorkSchedule(p.work_schedule)
            if (p.water_intake) setWaterIntake(p.water_intake)
            if (p.stress_level) setStressLevel(p.stress_level)
            if (p.full_name) setUserName(p.full_name.split(' ')[0])
          }
        } catch (_e) {}

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
        if (streakData.data) {
          const currentStreak = streakData.data.current_streak || 0
          setStreak(currentStreak)
          const dismissed = localStorage.getItem('wr_streak_reward_dismissed')
          if (currentStreak >= 7 && !dismissed) {
            setShowStreakReward(true)
            setTimeout(() => fireConfetti(currentStreak), 400)
          }
        }
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
        const checkinDate = new Date().toISOString().split('T')[0]
        const checkinRes = await fetchWithTimeout(`/api/checkin?date=${checkinDate}`)
        const checkin = await checkinRes.json()
        if (checkin.data?.wake_feeling) setCheckinDone(true)
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

  function fireConfetti(streakCount: number) {
    if (!confettiRef.current) return
    const myConfetti = confetti.create(confettiRef.current, { resize: true, useWorker: false })
    const colors = streakCount >= 90
      ? ['#f0d080','#c4a35a','#ffffff','#7db84a']
      : streakCount >= 30
      ? ['#f0d080','#c4a35a','#ffffff']
      : ['#f0d080','#c4a35a']
    myConfetti({
      particleCount: streakCount >= 90 ? 120 : streakCount >= 30 ? 80 : 50,
      spread: 70,
      origin: { x: 0.5, y: 0.2 },
      colors,
      ticks: 180,
      gravity: 1.2,
      scalar: 0.85,
    })
  }

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

  // ── FIX 2: Compute the single daily insight ───────────────────────────────
  const dailyInsight = getDailyInsight(sleepQuality, stressLevel, fitnessLevel, waterIntake, workSchedule)
  // ─────────────────────────────────────────────────────────────────────────

  const s = (obj: React.CSSProperties) => obj
  const BOTTOM_NAV_HEIGHT = 70

  if (!profileLoaded) return (
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif" })}>

      {/* Header shimmer */}
      <div style={s({ padding: '16px 22px 20px', paddingTop: 'calc(env(safe-area-inset-top) + 16px)', background: '#1a1a18' })}>
        <div className="shimmer-dark" style={s({ width: 80, height: 12, marginBottom: 10 })} />
        <div className="shimmer-dark" style={s({ width: 150, height: 28, borderRadius: 8, marginBottom: 12 })} />
        <div className="shimmer-dark" style={s({ width: 110, height: 22, borderRadius: 20 })} />
      </div>

      {/* Hero card shimmer */}
      <div style={s({ margin: '16px 22px 0', background: '#1a1a18', borderRadius: 20, padding: 20 })}>
        <div className="shimmer-dark" style={s({ width: 120, height: 10, marginBottom: 12 })} />
        <div className="shimmer-dark" style={s({ width: 180, height: 24, borderRadius: 8, marginBottom: 10 })} />
        <div className="shimmer-dark" style={s({ width: 100, height: 18, borderRadius: 6, marginBottom: 18 })} />
        <div className="shimmer-dark" style={s({ height: 5, borderRadius: 10 })} />
      </div>

      {/* Workout shimmer */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div className="shimmer" style={s({ width: 120, height: 10, marginBottom: 12 })} />
        <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', overflow: 'hidden' })}>
          {[1,2,3,4].map(i => (
            <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < 4 ? '1px solid #f5f2ec' : 'none' })}>
              <div className="shimmer" style={s({ width: 20, height: 20, borderRadius: '50%', flexShrink: 0 })} />
              <div className="shimmer" style={s({ flex: 1, height: 10 })} />
              <div className="shimmer" style={s({ width: 50, height: 20, borderRadius: 5 })} />
            </div>
          ))}
        </div>
      </div>

      {/* Water shimmer */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div className="shimmer" style={s({ width: 90, height: 10, marginBottom: 12 })} />
        <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 16 })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', marginBottom: 14 })}>
            <div className="shimmer" style={s({ width: 80, height: 10 })} />
            <div className="shimmer" style={s({ width: 48, height: 22, borderRadius: 20 })} />
          </div>
          <div style={s({ display: 'flex', justifyContent: 'center', margin: '0 0 14px' })}>
            <div className="shimmer" style={s({ width: 72, height: 110, borderRadius: 14 })} />
          </div>
          <div style={s({ display: 'flex', gap: 7, flexWrap: 'wrap' })}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="shimmer" style={s({ width: 34, height: 34, borderRadius: 8 })} />
            ))}
          </div>
        </div>
      </div>

      {/* Habits shimmer */}
      <div style={s({ margin: '16px 22px 0', paddingBottom: 24 })}>
        <div className="shimmer" style={s({ width: 100, height: 10, marginBottom: 12 })} />
        <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 })}>
          {[1,2,3,4].map(i => (
            <div key={i} style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 14, height: 90 })}>
              <div className="shimmer" style={s({ width: 28, height: 28, borderRadius: 6, marginBottom: 10 })} />
              <div className="shimmer" style={s({ width: '80%', height: 10, marginBottom: 6 })} />
              <div className="shimmer" style={s({ width: '60%', height: 8 })} />
            </div>
          ))}
        </div>
      </div>

    </main>
  )

  return (
  <AuthGuard>
    <main style={s({
      minHeight: '100dvh',
      background: '#faf8f4',
      fontFamily: "'DM Sans', Arial, sans-serif",
      paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
    })}>

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

      {/* ── FIX 1: Header — #1a1a18 dark, intentional contrast ── */}
      <div style={s({
        padding: '16px 22px 20px',
        paddingTop: isOffline ? '16px' : 'calc(env(safe-area-inset-top) + 16px)',
        background: '#1a1a18',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      })}>
        <div>
          <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 })}>{getGreeting()}</div>
          <div style={s({ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif", marginTop: 2 })}>
            {userName} 👋
          </div>
          <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 })}>
            {streak > 0 && (
              <div style={s({ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(196,163,90,0.15)', border: '1px solid rgba(196,163,90,0.35)', borderRadius: 30, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#f0d080' })}>
                🔥 {streak} day streak
              </div>
            )}
            {saving && <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.35)' })}>Saving...</div>}
          </div>
        </div>
        <div style={s({ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 })}>
          <button onClick={() => router.push('/checkin')} style={s({ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(196,163,90,0.15)', border: '1px solid rgba(196,163,90,0.35)', borderRadius: 20, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#f0d080', fontFamily: "'DM Sans', Arial, sans-serif" })}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" stroke="#f0d080" strokeWidth="1.6"/>
              <path d="M8 1V3M8 13V15M1 8H3M13 8H15M2.93 2.93L4.34 4.34M11.66 11.66L13.07 13.07M13.07 2.93L11.66 4.34M4.34 11.66L2.93 13.07" stroke="#f0d080" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Check in
          </button>
          <button onClick={() => router.push('/dashboard/profile')} style={s({ width: 42, height: 42, borderRadius: '50%', background: 'rgba(125,184,74,0.2)', border: '1px solid rgba(125,184,74,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="8" r="3.5" stroke="#a8c48a" strokeWidth="1.6"/>
              <path d="M4 19C4 15.69 7.13 13 11 13C14.87 13 18 15.69 18 19" stroke="#a8c48a" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* ── END FIX 1 ── */}

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

      <RamadanBanner />
      <IFBanner isPro={isPro} />

      {/* 7-Day Streak Reward — modal overlay */}
      {showStreakReward && !isPro && (
        <div style={s({
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(10,10,8,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        })}>
          <div style={s({
            width: '100%', maxWidth: 360,
            background: '#1a1a18', borderRadius: 20,
            border: '1px solid #c4a35a',
            padding: '24px 20px 20px',
            position: 'relative', overflow: 'hidden',
            animation: 'modalIn 0.4s cubic-bezier(0.34,1.2,0.64,1) forwards',
          })}>
            <canvas ref={confettiRef} style={s({ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 20, width: '100%', height: '100%' })}/>
            <div style={s({ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: '#c4a35a', opacity: 0.05, top: -80, right: -60, pointerEvents: 'none' })}/>
            <button onClick={() => { setShowStreakReward(false); localStorage.setItem('wr_streak_reward_dismissed','true') }}
              style={s({ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 22, cursor: 'pointer', lineHeight: 1 })}>×</button>
            <div style={s({ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 })}>
              <span style={{ fontSize: 36, display: 'block', animation: 'flamePulse 1.2s ease-in-out infinite' }}>🔥</span>
              <div>
                <div style={s({ fontSize: 42, fontWeight: 700, color: '#f0d080', fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 })}>{streak}</div>
                <div style={s({ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 600 })}>day streak</div>
              </div>
            </div>
            <div style={s({ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 })}>
              {streak >= 90 ? "90 days. You've changed your life." :
               streak >= 60 ? "60 days. You're in rare company." :
               streak >= 30 ? "30 days. A real habit is born." :
               streak >= 14 ? "Two weeks straight. That's discipline." :
               "One week down. You're just getting started."}
            </div>
            <div style={s({ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 })}>
              You've shown up <span style={{ color: '#f0d080', fontWeight: 700 }}>{streak} days</span> in a row. Unlock Pro at <span style={{ color: '#f0d080', fontWeight: 700 }}>50% off</span> — you've earned it.
            </div>
            <div style={s({ display: 'flex', gap: 6, marginBottom: 18 })}>
              {[7,14,30,60,90].map(ms => (
                <div key={ms} style={s({
                  flex: 1, borderRadius: 8, padding: '6px 4px', textAlign: 'center',
                  background: ms <= streak ? 'rgba(196,163,90,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${ms === streak ? '#c4a35a' : ms < streak ? 'rgba(196,163,90,0.3)' : 'rgba(255,255,255,0.08)'}`,
                })}>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: ms <= streak ? '#f0d080' : 'rgba(255,255,255,0.25)' })}>{ms}</div>
                  <div style={s({ fontSize: 9, color: ms <= streak ? 'rgba(240,208,128,0.5)' : 'rgba(255,255,255,0.15)' })}>days</div>
                </div>
              ))}
            </div>
            <div style={s({ background: 'rgba(196,163,90,0.1)', border: '1px solid rgba(196,163,90,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 })}>
              <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 })}>
                <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.5)' })}>Monthly</div>
                <div style={s({ display: 'flex', alignItems: 'center', gap: 8 })}>
                  <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' })}>RM19.90/mo</div>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: '#f0d080' })}>RM9.95/mo</div>
                </div>
              </div>
              <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.5)' })}>Yearly</div>
                <div style={s({ display: 'flex', alignItems: 'center', gap: 8 })}>
                  <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' })}>RM159/yr</div>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: '#f0d080' })}>RM79.50/yr</div>
                </div>
              </div>
              <div style={s({ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 8 })}>50% off for 12 months, then full price from Year 2.</div>
            </div>
            <div style={s({ display: 'flex', gap: 8 })}>
              <button onClick={() => router.push('/upgrade?coupon=dTaJGxYd&source=streak')}
                style={s({ flex: 1, padding: '12px 16px', background: '#c4a35a', color: '#1a1a18', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
                Claim my 50% off →
              </button>
              <button onClick={() => { setShowStreakReward(false); localStorage.setItem('wr_streak_reward_dismissed','true') }}
                style={s({ padding: '12px 14px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FIX 2: Single smart daily insight banner ── */}
      {dailyInsight && (
        <div style={s({ margin: '12px 22px 0', background: dailyInsight.bg, border: `1px solid ${dailyInsight.border}`, borderRadius: 14, padding: '12px 16px' })}>
          <div style={s({ fontSize: 13, fontWeight: 700, color: dailyInsight.titleColor, marginBottom: 2 })}>{dailyInsight.title}</div>
          <div style={s({ fontSize: 12, color: dailyInsight.bodyColor, lineHeight: 1.5 })}>{dailyInsight.message}</div>
        </div>
      )}
      {/* ── END FIX 2 ── */}

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
          {/* ── FIX 4: Customise button — locked for free users ── */}
          {isPro ? (
            <button onClick={() => router.push('/dashboard/workout')} style={s({ fontSize: 11, fontWeight: 600, color: '#4a7c2f', background: '#e8f5e0', border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
              ✦ Customise
            </button>
          ) : (
            <button onClick={() => router.push('/upgrade')} style={s({ fontSize: 11, fontWeight: 600, color: '#9a9a92', background: '#f5f2ec', border: '1px solid #e4e0d8', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
              🔒 Customise
            </button>
          )}
          {/* ── END FIX 4 ── */}
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

      {/* Smart Check-in Card */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Daily Check-ins</div>
        {(() => {
          const hour = new Date().getHours()
          const isMorning = hour >= 5 && hour < 12
          const isMidday = hour >= 12 && hour < 15
          const isBedtime = hour >= 20 && hour < 24
          return (
            <div style={s({ display: 'flex', flexDirection: 'column', gap: 10 })}>
              <div style={s({ background: checkinDone ? '#e8f5e0' : isMorning ? '#fff4e0' : 'white', border: `1px solid ${checkinDone ? '#97C459' : isMorning ? '#f5d58a' : '#e4e0d8'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                <div>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: checkinDone ? '#27500A' : '#1a1a18', marginBottom: 2 })}>🌅 Morning Check-in</div>
                  <div style={s({ fontSize: 11, color: checkinDone ? '#4a7c2f' : '#7a7a72' })}>
                    {checkinDone ? '✅ Done — plan set for today' : isMorning ? 'Available now — set your day' : 'Available 5AM–12PM'}
                  </div>
                </div>
                {!checkinDone && (
                  <button onClick={() => router.push('/checkin?type=morning')} style={s({ padding: '8px 14px', background: isMorning ? '#4a7c2f' : '#f5f2ec', color: isMorning ? 'white' : '#7a7a72', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", flexShrink: 0 })}>
                    {isMorning ? 'Start →' : 'Missed'}
                  </button>
                )}
              </div>
              {isPro ? (
                <div style={s({ background: 'white', border: `1px solid ${isMidday ? '#f5d58a' : '#e4e0d8'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                  <div>
                    <div style={s({ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginBottom: 2 })}>☀️ Mid-day Check-in</div>
                    <div style={s({ fontSize: 11, color: '#7a7a72' })}>{isMidday ? "Available now — how's your day?" : 'Available 12PM–3PM'}</div>
                  </div>
                  {isMidday && (
                    <button onClick={() => router.push('/checkin?type=midday')} style={s({ padding: '8px 14px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", flexShrink: 0 })}>Start →</button>
                  )}
                </div>
              ) : (
                <div style={s({ background: '#faf8f4', border: '1px solid #e4e0d8', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 })}>
                  <div>
                    <div style={s({ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginBottom: 2 })}>☀️ Mid-day Check-in</div>
                    <div style={s({ fontSize: 11, color: '#7a7a72' })}>✦ Pro feature</div>
                  </div>
                  <button onClick={() => router.push('/upgrade')} style={s({ padding: '8px 14px', background: '#e8f5e0', color: '#4a7c2f', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", flexShrink: 0 })}>Unlock →</button>
                </div>
              )}
              {isPro ? (
                <div style={s({ background: 'white', border: `1px solid ${isBedtime ? '#b085eb' : '#e4e0d8'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                  <div>
                    <div style={s({ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginBottom: 2 })}>🌙 Bedtime Check-in</div>
                    <div style={s({ fontSize: 11, color: '#7a7a72' })}>{isBedtime ? 'Available now — reflect on today' : 'Available 8PM–12AM'}</div>
                  </div>
                  {isBedtime && (
                    <button onClick={() => router.push('/checkin?type=bedtime')} style={s({ padding: '8px 14px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", flexShrink: 0 })}>Start →</button>
                  )}
                </div>
              ) : (
                <div style={s({ background: '#faf8f4', border: '1px solid #e4e0d8', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 })}>
                  <div>
                    <div style={s({ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginBottom: 2 })}>🌙 Bedtime Check-in</div>
                    <div style={s({ fontSize: 11, color: '#7a7a72' })}>✦ Pro feature</div>
                  </div>
                  <button onClick={() => router.push('/upgrade')} style={s({ padding: '8px 14px', background: '#e8f5e0', color: '#4a7c2f', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", flexShrink: 0 })}>Unlock →</button>
                </div>
              )}
            </div>
          )
        })()}
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
                type="number" placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                min="1" max="300" value={weightInput}
                onChange={e => { const val = e.target.value; if (val === '' || (parseFloat(val) > 0 && parseFloat(val) <= 300)) setWeightInput(val) }}
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
              <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>Each 💧 = 250ml · {waterGoal.glasses} glasses to reach your goal</div>
            </div>
            <div style={s({ display: 'flex', alignItems: 'center', gap: 6 })}>
              <div style={s({ background: water >= waterGoal.glasses ? '#1a1a18' : '#e8f5e0', color: water >= waterGoal.glasses ? '#a8c48a' : '#4a7c2f', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, transition: 'all 0.3s ease' })}>{water} / {waterGoal.glasses}</div>
              {weightKg && (
                <button onClick={() => setShowWeightPrompt(!showWeightPrompt)} style={s({ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' })}>⚙️</button>
              )}
            </div>
          </div>

          {/* Water bottle visual */}
          <div style={s({ display: 'flex', justifyContent: 'center', margin: '14px 0' })}>
            <div style={s({ position: 'relative', width: 72 })}>
              <div style={s({ width: 32, height: 14, background: '#e4f0ff', borderRadius: '4px 4px 0 0', border: '1.5px solid #bdd6f5', borderBottom: 'none', margin: '0 auto' })}/>
              <div style={s({ width: 72, height: 96, borderRadius: '8px 8px 14px 14px', border: '1.5px solid #bdd6f5', background: '#f0f8ff', overflow: 'hidden', position: 'relative' })}>
                <div style={s({
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: water >= waterGoal.glasses ? '#4a9de8' : '#60a5e8',
                  height: `${Math.max(18, Math.round((water / waterGoal.glasses) * 100))}%`,
                  transition: 'height 0.5s cubic-bezier(0.34,1.2,0.64,1)',
                  borderRadius: '0 0 12px 12px',
                })}>
                  <div style={s({
                    position: 'absolute', top: -4, left: '-10%', width: '120%', height: 8,
                    background: '#7bb8f0', borderRadius: '50%',
                    animation: 'waterWave 2s ease-in-out infinite',
                  })}/>
                </div>
                {/* ── FIX: percentage label positioned above fill when low ── */}
                <div style={s({
                  position: 'absolute',
                  bottom: `${Math.max(18, Math.round((water / waterGoal.glasses) * 100)) + 4}%`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 13, fontWeight: 700, zIndex: 2,
                  color: (water / waterGoal.glasses) >= 0.55 ? 'white' : '#0c447c',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                })}>
                  {Math.round((water / waterGoal.glasses) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Glasses grid */}
          <div style={s({ display: 'flex', gap: 7, flexWrap: 'wrap' })}>
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
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                animation: tappedGlass === i
                  ? (i < water ? 'glassUnpop 0.2s ease forwards' : 'glassPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards')
                  : 'none',
              })}>💧</div>
            ))}
          </div>

          {/* Hydration goal reached banner */}
          <div style={s({
            marginTop: 12,
            background: '#1a1a18',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: water >= waterGoal.glasses ? 1 : 0,
            transform: water >= waterGoal.glasses ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            pointerEvents: 'none',
          })}>
            <span style={{ fontSize: 22 }}>💧</span>
            <div>
              <div style={s({ fontSize: 13, fontWeight: 600, color: '#a8c48a' })}>Hydration goal reached!</div>
              <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 })}>Your body thanks you 🌿</div>
            </div>
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
            const isChecked = checkedHabits[i]
            return (
              <div key={i} onClick={() => {
                const updated = { ...checkedHabits, [i]: !checkedHabits[i] }
                setCheckedHabits(updated)
                saveData({ habits: updated })
                setBouncingHabit(i)
                setTimeout(() => setBouncingHabit(null), 400)
              }} style={s({
                background: isChecked ? '#e8f5e0' : isHighlighted ? rec!.bg : 'white',
                border: `${isHighlighted && !isChecked ? '2px' : '1.5px'} solid ${isChecked ? '#7db84a' : isHighlighted ? rec!.border : '#e4e0d8'}`,
                borderRadius: 14, padding: 14, cursor: 'pointer', position: 'relative',
                animation: bouncingHabit === i
                  ? (isChecked
                    ? 'habitUncheck 0.2s ease forwards'
                    : 'habitBounce 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards')
                  : 'none',
              })}>
                {isHighlighted && !isChecked && (
                  <div style={s({ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: rec!.dot })}/>
                )}
                {isChecked && (
                  <div style={s({
                    position: 'absolute', top: 8, right: 8,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#4a7c2f',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  })}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"
                      style={{ animation: 'checkmarkIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
                      <path d="M1 4l2.8 2.8L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div style={{
                  fontSize: 20, marginBottom: 6,
                  animation: bouncingHabit === i && !isChecked
                    ? 'iconPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
                    : 'none',
                }}>
                  {h.icon}
                </div>
                <div style={s({ fontSize: 13, fontWeight: 600, color: isChecked ? '#4a7c2f' : isHighlighted ? rec!.text : '#3d3d3a' })}>{h.label}</div>
                <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>{h.sub}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── FIX 3: Static daily quote ── */}
      <QuoteBanner />

      {/* Bottom nav */}
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

        {/* Summary */}
        <button onClick={() => router.push('/dashboard/summary')} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 0', background: 'none', border: 'none' })}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="12" width="4" height="7" rx="1" stroke="#9a9a92" strokeWidth="1.6"/>
            <rect x="9" y="7" width="4" height="12" rx="1" stroke="#9a9a92" strokeWidth="1.6"/>
            <rect x="15" y="3" width="4" height="16" rx="1" stroke="#9a9a92" strokeWidth="1.6"/>
          </svg>
          <div style={s({ fontSize: 10, fontWeight: 500, color: '#7a7a72', fontFamily: "'DM Sans', Arial, sans-serif" })}>Summary</div>
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
