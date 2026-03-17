'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

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

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
      setUserName(name.split(' ')[0])
      const today = new Date().toISOString().split('T')[0]
      try {
        const [dailyRes, exerciseRes, habitRes, streakRes, profileRes] = await Promise.all([
          fetch(`/api/logs/daily?date=${today}`),
          fetch(`/api/logs/exercise?date=${today}`),
          fetch(`/api/logs/habits?date=${today}`),
          fetch('/api/streak'),
          fetch('/api/profile'),
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
        if (streakData.data) setStreak(streakData.data.current_streak || 0)
        if (profile.data?.weight_kg) {
          setWeightKg(profile.data.weight_kg)
          setShowWeightPrompt(false)
        } else {
          setShowWeightPrompt(true)
        }
        setProfileLoaded(true)
      } catch (e) {
        console.log(e)
        setShowWeightPrompt(true)
        setProfileLoaded(true)
      }
    }
    init()
  }, [])

  async function saveWeight() {
    let kg = parseFloat(weightInput)
    if (isNaN(kg) || kg <= 0) return
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
    } catch (e) { console.log(e) }
  }

  const saveData = useCallback(async (updates: {
    mood?: number, energy?: number, water?: number,
    habits?: Record<number, boolean>, exercises?: Record<number, boolean>
  }) => {
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
    } catch (e) { console.log(e) }
    setSaving(false)
  }, [mood, energy, water, checkedHabits, checkedEx, currentDay])

  const rec = getRecommendation(mood, energy)
  const dayData = days[currentDay]
  const exDone = Object.values(checkedEx).filter(Boolean).length
  const exTotal = dayData.exercises.length
  const pct = exTotal > 0 ? Math.round(exDone / exTotal * 100) : 0
  const waterGoal = weightKg ? calcWaterGoal(weightKg) : { litres: 2.5, glasses: 10 }
  const lbsDisplay = weightKg ? Math.round(weightKg * 2.205) : null

  const s = (obj: React.CSSProperties) => obj

  return (
    <main style={s({ minHeight: '100vh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 100 })}>

      <div style={s({ padding: '52px 22px 0' })}>
        <div style={s({ fontSize: 12, color: '#7a7a72', fontWeight: 500 })}>Good morning,</div>
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

      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Today's workout</div>
        <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', overflow: 'hidden' })}>
          {dayData.exercises.map((ex, i) => (
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
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
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

      <div style={s({ margin: '16px 22px 20px', background: '#e1f5ee', borderLeft: '3px solid #5dcaa5', borderRadius: '0 12px 12px 0', padding: '12px 14px' })}>
        <div style={s({ fontSize: 13, color: '#085041', lineHeight: 1.6, fontStyle: 'italic' })}>
          Sleep alone fixes many issues: hormones, belly fat, eczema flare-ups, and stress. Aim for 7–8 hours.
        </div>
      </div>

      <div style={s({ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e4e0d8', display: 'flex', padding: '10px 0 20px', zIndex: 100 })}>
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
  )
}
