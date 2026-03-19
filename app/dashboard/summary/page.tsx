'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const moodColors = ['','#f5a58a','#f5d58a','#7db84a','#5dcaa5','#7f77dd']
const habitDefs = [
  { icon: '☀️', label: 'Morning sunlight' },
  { icon: '💧', label: '500ml on waking' },
  { icon: '🚶', label: 'Steps goal' },
  { icon: '🥗', label: '3 structured meals' },
  { icon: '📵', label: 'Phone off before bed' },
  { icon: '🌙', label: 'Sleep before midnight' },
]

const s = (o: React.CSSProperties) => o

export default function Summary() {
  const router = useRouter()
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const [dailyLogs, setDailyLogs] = useState<any[]>([])
  const [habitLogs, setHabitLogs] = useState<any[]>([])
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/summary/week')
        const { data } = await res.json()
        if (data) {
          setDailyLogs(data.dailyLogs || [])
          setHabitLogs(data.habitLogs || [])
          setExerciseLogs(data.exerciseLogs || [])
        }
        const streakRes = await fetch('/api/streak')
        const streakData = await streakRes.json()
        if (streakData.data) setStreak(streakData.data.current_streak || 0)
      } catch(e) { console.log(e) }
      setLoading(false)
    }
    load()
  }, [])

  function getWeekDates() {
    const dates = []
    const today = new Date()
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1
    for (let i = 0; i <= 6; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - dow + i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const weekDates = getWeekDates()

  function getDayData(dateStr: string) {
    const daily = dailyLogs.find(l => l.log_date === dateStr)
    const habit = habitLogs.find(l => l.log_date === dateStr)
    const exercise = exerciseLogs.find(l => l.log_date === dateStr)
    const habitsChecked = habit ? Object.values(habit.checked_habits || {}).filter(Boolean).length : 0
    const anyExercise = exercise ? Object.values(exercise.completed_exercises || {}).some(Boolean) : false
    const complete = habitsChecked >= 3 || anyExercise || (daily?.water_glasses || 0) >= 5
    return { daily, complete, mood: daily?.mood || 0, energy: daily?.energy || 0 }
  }

  const strengthDays = [0, 2, 4]
  let strengthDone = 0
  let totalHabits = 0
  let waterDays = 0

  weekDates.forEach((date, i) => {
    if (i > todayIdx) return
    const habit = habitLogs.find(l => l.log_date === date)
    const exercise = exerciseLogs.find(l => l.log_date === date)
    const daily = dailyLogs.find(l => l.log_date === date)
    if (strengthDays.includes(i)) {
      const anyEx = exercise ? Object.values(exercise.completed_exercises || {}).some(Boolean) : false
      if (anyEx) strengthDone++
    }
    if (habit) totalHabits += Object.values(habit.checked_habits || {}).filter(Boolean).length
    if ((daily?.water_glasses || 0) >= 8) waterDays++
  })

  function habitPct(habitIdx: number) {
    const daysLogged = todayIdx + 1
    if (daysLogged === 0) return 0
    let count = 0
    weekDates.forEach((date, i) => {
      if (i > todayIdx) return
      const habit = habitLogs.find(l => l.log_date === date)
      if (habit?.checked_habits?.[habitIdx]) count++
    })
    return Math.round(count / daysLogged * 100)
  }

  return (
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 'calc(70px + env(safe-area-inset-bottom))' })}>

      <div style={s({
        padding: '16px 22px 0',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      })}>
        <div>
          <button onClick={() => router.push('/dashboard/checkin')} style={s({ fontSize: 11, fontWeight: 600, color: '#4a7c2f', background: '#e8f5e0', border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", marginTop: 8, display: 'inline-block' })}>✦ AI Check-in</button>
          <div style={s({ fontSize: 12, color: '#7a7a72', marginTop: 2 })}>
            {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        {streak > 0 && (
          <div style={s({ background: '#fff4e0', border: '1px solid #f5d58a', borderRadius: 30, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#8a6200' })}>
            🔥 {streak} days
          </div>
        )}
      </div>

      {loading ? (
        <div style={s({ textAlign: 'center', padding: '60px 22px', color: '#7a7a72', fontSize: 14 })}>Loading your data...</div>
      ) : (
        <>
          <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, margin: '16px 22px 0' })}>
            {weekDates.map((date, i) => {
              const d = getDayData(date)
              const isFuture = i > todayIdx
              return (
                <div key={i} style={s({
                  border: `1px solid ${d.complete && !isFuture ? '#7db84a' : '#e4e0d8'}`,
                  borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                  background: d.complete && !isFuture ? '#e8f5e0' : 'white',
                  opacity: isFuture ? 0.4 : 1,
                })}>
                  <div style={s({ fontSize: 10, fontWeight: 600, color: d.complete && !isFuture ? '#4a7c2f' : '#7a7a72', marginBottom: 6 })}>{dayNames[i]}</div>
                  {!isFuture && d.mood > 0 && (
                    <>
                      <div style={s({ width: 8, height: 8, borderRadius: '50%', background: moodColors[d.mood], margin: '3px auto' })}/>
                      <div style={s({ width: 8, height: 8, borderRadius: '50%', background: moodColors[d.energy], margin: '3px auto' })}/>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 22px 0' })}>
            {[
              { num: `${strengthDone}/3`, label: 'Strength days', sub: strengthDone === 3 ? 'Full week ✓' : `${3 - strengthDone} more to go`, color: '#4a7c2f' },
              { num: `${totalHabits}`, label: 'Habits logged', sub: `${waterDays} days hit water goal`, color: '#4a7c2f' },
            ].map(s2 => (
              <div key={s2.label} style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
                <div style={s({ fontSize: 30, fontWeight: 700, color: s2.color, fontFamily: "'DM Serif Display', Georgia, serif" })}>{s2.num}</div>
                <div style={s({ fontSize: 12, color: '#7a7a72', marginTop: 4 })}>{s2.label}</div>
                <div style={s({ fontSize: 11, fontWeight: 600, color: s2.color, marginTop: 4 })}>{s2.sub}</div>
              </div>
            ))}
          </div>

          <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
            <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 14 })}>Mood this week</div>
            <div style={s({ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 })}>
              {weekDates.map((date, i) => {
                const d = getDayData(date)
                return (
                  <div key={i} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 })}>
                    <div style={s({
                      width: '100%', borderRadius: '4px 4px 0 0',
                      height: d.mood > 0 ? `${Math.round(d.mood / 5 * 56)}px` : '4px',
                      background: d.mood > 0 ? moodColors[d.mood] : '#f0ece4',
                      opacity: i > todayIdx ? 0.3 : 1,
                    })}/>
                    <div style={s({ fontSize: 9, color: '#7a7a72', fontWeight: 500 })}>{dayNames[i]}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
            <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 14 })}>Habit completion</div>
            {habitDefs.map((h, i) => {
              const pct = habitPct(i)
              return (
                <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < habitDefs.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
                  <div style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{h.icon}</div>
                  <div style={s({ flex: 1 })}>
                    <div style={s({ fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 4 })}>{h.label}</div>
                    <div style={s({ height: 5, background: '#f0ece4', borderRadius: 4, overflow: 'hidden' })}>
                      <div style={s({ height: '100%', borderRadius: 4, width: `${pct}%`, background: pct >= 70 ? '#7db84a' : pct >= 40 ? '#f5d58a' : '#f5a58a' })}/>
                    </div>
                  </div>
                  <div style={s({ fontSize: 12, fontWeight: 600, color: '#7a7a72', minWidth: 28, textAlign: 'right' })}>{pct}%</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div style={s({
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', borderTop: '1px solid #e4e0d8',
        display: 'flex', paddingTop: 10,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
        zIndex: 100,
      })}>
        {[
          { icon: '🏠', label: 'Today', path: '/dashboard', active: false },
          { icon: '📊', label: 'Summary', path: '/dashboard/summary', active: true },
          { icon: '🥗', label: 'Meals', path: '/dashboard/meals', active: false },
          { icon: '📈', label: 'Progress', path: '/dashboard/progress', active: false },
        ].map(n => (
          <button key={n.label} onClick={() => router.push(n.path)} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '6px 0', background: 'none', border: 'none' })}>
            <div style={{ fontSize: 18 }}>{n.icon}</div>
            <div style={s({ fontSize: 10, fontWeight: n.active ? 700 : 500, color: n.active ? '#4a7c2f' : '#7a7a72', fontFamily: "'DM Sans', Arial, sans-serif" })}>{n.label}</div>
            {n.active && <div style={s({ width: 4, height: 4, borderRadius: '50%', background: '#4a7c2f' })}/>}
          </button>
        ))}
      </div>
    </main>
  )
}