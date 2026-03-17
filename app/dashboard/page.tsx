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

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
      setUserName(name.split(' ')[0])

      const today = new Date().toISOString().split('T')[0]
      try {
        const [dailyRes, exerciseRes, habitRes, streakRes] = await Promise.all([
          fetch(`/api/logs/daily?date=${today}`),
          fetch(`/api/logs/exercise?date=${today}`),
          fetch(`/api/logs/habits?date=${today}`),
          fetch('/api/streak'),
        ])
        const [daily, exercise, habit, streakData] = await Promise.all([
          dailyRes.json(), exerciseRes.json(), habitRes.json(), streakRes.json()
        ])
        if (daily.data) {
          setMood(daily.data.mood || 0)
          setEnergy(daily.data.energy || 0)
          setWater(daily.data.water_glasses || 0)
        }
        if (exercise.data?.completed_exercises) setCheckedEx(exercise.data.completed_exercises)
        if (habit.data?.checked_habits) setCheckedHabits(habit.data.checked_habits)
        if (streakData.data) setStreak(streakData.data.current_streak || 0)
      } catch (e) {
        console.log('Could not load saved data', e)
      }
    }
    init()
  }, [])

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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: m, energy: e, waterGlasses: w }),
        }),
        fetch('/api/logs/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkedHabits: h }),
        }),
        fetch('/api/logs/exercise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dayIndex: currentDay, completedExercises: ex }),
        }),
      ])
      const habitsCount = Object.values(h).filter(Boolean).length
      if (habitsCount >= 3 || Object.values(ex).some(Boolean) || w >= 5 || m > 0) {
        const res = await fetch('/api/streak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habitsCompleted: habitsCount }),
        })
        const { data } = await res.json()
        if (data) setStreak(data.current_streak || 0)
      }
    } catch (e) {
      console.log('Save error', e)
    }
    setSaving(false)
  }, [mood, energy, water, checkedHabits, checkedEx, currentDay])

  const dayData = days[currentDay]
  const exDone = Object.values(checkedEx).filter(Boolean).length
  const exTotal = dayData.exercises.length
  const pct = exTotal > 0 ? Math.round(exDone / exTotal * 100) : 0

  const s = (obj: React.CSSProperties) => obj

  return (
    <main style={s({ minHeight: '100vh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 80 })}>

      {/* Header */}
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

      {/* Mood */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>How are you feeling?</div>
        <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 16 })}>
          <div style={s({ fontSize: 12, fontWeight: 600, color: '#3d3d3a', marginBottom: 10 })}>Mood</div>
          <div style={s({ display: 'flex', justifyContent: 'space-between', marginBottom: 16 })}>
            {moods.map((m, i) => (
              <button key={i} onClick={() => {
                setMood(i + 1)
                saveData({ mood: i + 1 })
              }} style={s({
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
              <div key={i} onClick={() => {
                setEnergy(i)
                saveData({ energy: i })
              }} style={s({
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
      </div>

      {/* Water */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Water intake</div>
        <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', padding: 16 })}>
          <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 })}>
            <div style={s({ fontSize: 12, fontWeight: 600, color: '#3d3d3a' })}>Goal: 2.5–3L</div>
            <div style={s({ background: '#e8f5e0', color: '#4a7c2f', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 })}>{water} / 10 glasses</div>
          </div>
          <div style={s({ display: 'flex', gap: 7, flexWrap: 'wrap' })}>
            {Array.from({ length: 10 }, (_, i) => (
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
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Daily habits</div>
        <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 })}>
          {habits.map((h, i) => (
            <div key={i} onClick={() => {
              const updated = { ...checkedHabits, [i]: !checkedHabits[i] }
              setCheckedHabits(updated)
              saveData({ habits: updated })
            }} style={s({
              background: checkedHabits[i] ? '#e8f5e0' : 'white',
              border: `1.5px solid ${checkedHabits[i] ? '#7db84a' : '#e4e0d8'}`,
              borderRadius: 14, padding: 14, cursor: 'pointer',
            })}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{h.icon}</div>
              <div style={s({ fontSize: 13, fontWeight: 600, color: checkedHabits[i] ? '#4a7c2f' : '#3d3d3a' })}>{h.label}</div>
              <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>{h.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div style={s({ margin: '16px 22px 0', background: '#e1f5ee', borderLeft: '3px solid #5dcaa5', borderRadius: '0 12px 12px 0', padding: '10px 14px' })}>
        <div style={s({ fontSize: 13, color: '#085041', lineHeight: 1.5, fontStyle: 'italic' })}>
          Sleep alone fixes many issues: hormones, belly fat, eczema flare-ups, and stress. Aim for 7–8 hours.
        </div>
      </div>

      {/* Bottom nav */}
      <div style={s({ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e4e0d8', display: 'flex', padding: '10px 0 20px', zIndex: 100 })}>
        {[
          { icon: '🏠', label: 'Today', path: '/dashboard', active: true },
          { icon: '📊', label: 'Summary', path: '/dashboard/summary', active: false },
          { icon: '🥗', label: 'Meals', path: '/dashboard/meals', active: false },
          { icon: '📈', label: 'Progress', path: '/dashboard/progress', active: false },
        ].map(n => (
          <button key={n.label} onClick={() => router.push(n.path)} style={s({
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, cursor: 'pointer', padding: '6px 0',
            background: 'none', border: 'none',
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
