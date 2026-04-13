'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BottomNav from '../../components/BottomNav'

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const moodColors = ['', '#f5a58a', '#f5d58a', '#7db84a', '#5dcaa5', '#7f77dd']

const timeline = [
  { week: 'After 4 weeks', dot: '#7db84a', desc: 'Better sleep quality · more stable energy during the day' },
  { week: 'After 3 months', dot: '#5dcaa5', desc: 'Visible belly fat reduction · stronger body · improved skin' },
  { week: 'After 6–12 months', dot: '#ef9f27', desc: 'Major health transformation · new baseline habits formed' },
]

const boosters = [
  { label: 'Blood test', desc: 'Once a year — know your numbers' },
  { label: 'Vitamin D', desc: 'Check levels, supplement if low' },
  { label: 'Omega-3', desc: 'Fish oil or fatty fish 2–3× per week' },
  { label: 'Magnesium', desc: 'Before sleep — aids recovery and sleep quality' },
]

const habitDefs = [
  'Morning sunlight',
  '500ml on waking',
  'Steps goal',
  '3 structured meals',
  'Phone off before bed',
  'Sleep before midnight',
]

const s = (o: React.CSSProperties) => o

export default function Progress() {
  const router = useRouter()
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const [streakData, setStreakData] = useState({ current_streak: 0, longest_streak: 0, total_active_days: 0, total_habits_completed: 0 })
  const [dailyLogs, setDailyLogs] = useState<any[]>([])
  const [habitLogs, setHabitLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, streakRes] = await Promise.all([
          fetch('/api/summary/week'),
          fetch('/api/streak'),
        ])
        const [summary, streak] = await Promise.all([summaryRes.json(), streakRes.json()])
        if (summary.data) {
          setDailyLogs(summary.data.dailyLogs || [])
          setHabitLogs(summary.data.habitLogs || [])
        }
        if (streak.data) setStreakData(streak.data)
      } catch (e) { console.log(e) }
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
    const habitsChecked = habit ? Object.values(habit.checked_habits || {}).filter(Boolean).length : 0
    const complete = habitsChecked >= 3 || (daily?.water_glasses || 0) >= 5
    return { complete, mood: daily?.mood || 0, energy: daily?.energy || 0 }
  }

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

  let totalHabits = 0
  let waterDays = 0
  weekDates.forEach((date, i) => {
    if (i > todayIdx) return
    const habit = habitLogs.find(l => l.log_date === date)
    const daily = dailyLogs.find(l => l.log_date === date)
    if (habit) totalHabits += Object.values(habit.checked_habits || {}).filter(Boolean).length
    if ((daily?.water_glasses || 0) >= 8) waterDays++
  })

  return (
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 90 })}>

      <div style={s({
        padding: '16px 22px 20px',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        background: '#1a1a18',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      })}>
        <div style={s({ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif" })}>Progress</div>
        <button onClick={() => router.push('/dashboard/history')} style={s({ fontSize: 11, fontWeight: 600, color: '#a8c48a', background: 'rgba(125,184,74,0.15)', border: '1px solid rgba(125,184,74,0.3)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>✦ Full history</button>
      </div>

      {loading ? (
        <div style={s({ textAlign: 'center', padding: '60px 22px', color: '#7a7a72', fontSize: 14 })}>Loading your data…</div>
      ) : (
        <div style={s({ padding: '16px 22px 0' })}>

          {/* All-time stats */}
          <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 })}>
            <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
            <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a' })}>All-time stats</div>
          </div>
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 })}>
            {[
              { num: String(streakData.total_active_days), label: 'Active days', color: '#4a7c2f' },
              { num: String(streakData.current_streak), label: 'Day streak', color: '#8a6200' },
              { num: String(streakData.total_habits_completed), label: 'Habits done', color: '#534ab7' },
            ].map(item => (
              <div key={item.label} style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 12, padding: 12 })}>
                <div style={s({ fontSize: 26, fontWeight: 700, color: item.color, fontFamily: "'DM Serif Display', Georgia, serif" })}>{item.num}</div>
                <div style={s({ fontSize: 10, color: '#7a7a72', marginTop: 2, fontWeight: 500 })}>{item.label}</div>
              </div>
            ))}
          </div>

          {streakData.longest_streak > 0 && (
            <div style={s({ background: '#fff4e0', border: '1px solid #f5d58a', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 })}>
              <div style={s({ fontSize: 13, fontWeight: 600, color: '#8a6200' })}>Longest streak ever</div>
              <div style={s({ fontSize: 20, fontWeight: 700, color: '#8a6200', fontFamily: "'DM Serif Display', Georgia, serif" })}>{streakData.longest_streak} days</div>
            </div>
          )}

          {/* This week */}
          <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 })}>
            <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
            <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a' })}>This week</div>
          </div>

          {/* Week grid */}
          <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 12 })}>
            {weekDates.map((date, i) => {
              const d = getDayData(date)
              const isFuture = i > todayIdx
              return (
                <div key={i} style={s({
                  border: `1px solid ${d.complete && !isFuture ? '#7db84a' : '#e4e0d8'}`,
                  borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                  background: d.complete && !isFuture ? '#e8f5e0' : 'white',
                  opacity: isFuture ? 0.35 : 1,
                })}>
                  <div style={s({ fontSize: 10, fontWeight: 600, color: d.complete && !isFuture ? '#4a7c2f' : '#9a9a92', marginBottom: 5 })}>{dayNames[i]}</div>
                  {!isFuture && d.mood > 0 && (
                    <>
                      <div style={s({ width: 7, height: 7, borderRadius: '50%', background: moodColors[d.mood], margin: '2px auto' })}/>
                      <div style={s({ width: 7, height: 7, borderRadius: '50%', background: moodColors[d.energy], margin: '2px auto' })}/>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Week stats */}
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 })}>
            {[
              { num: String(totalHabits), label: 'Habits logged', sub: `${waterDays} days hit water goal`, color: '#4a7c2f' },
              { num: `${streakData.current_streak}`, label: 'Current streak', sub: streakData.current_streak >= 7 ? 'Keep it going!' : `${7 - streakData.current_streak} days to 7`, color: '#8a6200' },
            ].map(item => (
              <div key={item.label} style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 14 })}>
                <div style={s({ fontSize: 28, fontWeight: 700, color: item.color, fontFamily: "'DM Serif Display', Georgia, serif" })}>{item.num}</div>
                <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 3 })}>{item.label}</div>
                <div style={s({ fontSize: 11, fontWeight: 600, color: item.color, marginTop: 3 })}>{item.sub}</div>
              </div>
            ))}
          </div>

          {/* Mood chart */}
          <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 })}>
            <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
            <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a' })}>Mood this week</div>
          </div>
          <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16, marginBottom: 24 })}>
            <div style={s({ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 })}>
              {weekDates.map((date, i) => {
                const d = getDayData(date)
                return (
                  <div key={i} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 })}>
                    <div style={s({
                      width: '100%', borderRadius: '4px 4px 0 0',
                      height: d.mood > 0 ? `${Math.round(d.mood / 5 * 52)}px` : '4px',
                      background: d.mood > 0 ? moodColors[d.mood] : '#f0ece4',
                      opacity: i > todayIdx ? 0.3 : 1,
                      transition: 'height 0.3s ease',
                    })}/>
                    <div style={s({ fontSize: 9, color: '#9a9a92', fontWeight: 500 })}>{dayNames[i]}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Habit completion */}
          <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 })}>
            <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
            <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a' })}>Habit completion</div>
          </div>
          <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16, marginBottom: 24 })}>
            {habitDefs.map((label, i) => {
              const pct = habitPct(i)
              return (
                <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < habitDefs.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
                  <div style={s({ flex: 1 })}>
                    <div style={s({ fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 5 })}>{label}</div>
                    <div style={s({ height: 5, background: '#f0ece4', borderRadius: 4, overflow: 'hidden' })}>
                      <div style={s({ height: '100%', borderRadius: 4, width: `${pct}%`, background: pct >= 70 ? '#7db84a' : pct >= 40 ? '#f5d58a' : '#f5a58a', transition: 'width 0.4s ease' })}/>
                    </div>
                  </div>
                  <div style={s({ fontSize: 12, fontWeight: 600, color: '#7a7a72', minWidth: 32, textAlign: 'right' })}>{pct}%</div>
                </div>
              )
            })}
          </div>

          {/* What to expect */}
          <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 })}>
            <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
            <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a' })}>What to expect</div>
          </div>
          <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16, marginBottom: 16 })}>
            {timeline.map((t, i) => (
              <div key={i} style={s({ display: 'flex', gap: 12, marginBottom: i < timeline.length - 1 ? 14 : 0 })}>
                <div style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center' })}>
                  <div style={s({ width: 10, height: 10, borderRadius: '50%', background: t.dot, flexShrink: 0, marginTop: 2 })}/>
                  {i < timeline.length - 1 && <div style={s({ width: 1.5, flex: 1, background: '#e4e0d8', marginTop: 4 })}/>}
                </div>
                <div style={s({ paddingBottom: i < timeline.length - 1 ? 14 : 0 })}>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginBottom: 2 })}>{t.week}</div>
                  <div style={s({ fontSize: 12, color: '#7a7a72', lineHeight: 1.5 })}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly goals */}
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 })}>
            {[
              { num: '3×', label: 'Strength sessions', color: '#4a7c2f' },
              { num: '7.5k', label: 'Daily steps goal', color: '#185fa5' },
              { num: '8h', label: 'Sleep per night', color: '#1d9e75' },
            ].map(item => (
              <div key={item.label} style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 12, padding: 12 })}>
                <div style={s({ fontSize: 22, fontWeight: 700, color: item.color, fontFamily: "'DM Serif Display', Georgia, serif" })}>{item.num}</div>
                <div style={s({ fontSize: 10, color: '#7a7a72', marginTop: 2 })}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Optional boosters */}
          <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16, marginBottom: 16 })}>
            <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 })}>
              <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
              <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a' })}>Optional boosters</div>
            </div>
            {boosters.map((b, i) => (
              <div key={i} style={s({ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < boosters.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
                <div style={s({ fontSize: 13, fontWeight: 600, color: '#1a1a18', minWidth: 100 })}>{b.label}</div>
                <div style={s({ fontSize: 13, color: '#7a7a72' })}>{b.desc}</div>
              </div>
            ))}
          </div>

        </div>
      )}

      <BottomNav active="progress" router={router} />
    </main>
  )
}
