'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProStatus } from '../../hooks/useProStatus'
import ProGate from '../../components/ProGate'

const moodColors = ['', '#f5a58a', '#f5d58a', '#7db84a', '#5dcaa5', '#7f77dd']
const moodLabels = ['', 'Low', 'Meh', 'Okay', 'Good', 'Great']

const habitDefs = [
  { icon: '☀️', label: 'Morning sunlight' },
  { icon: '💧', label: '500ml on waking' },
  { icon: '🚶', label: 'Steps goal' },
  { icon: '🥗', label: '3 structured meals' },
  { icon: '📵', label: 'Phone off before bed' },
  { icon: '🌙', label: 'Sleep before midnight' },
]

const s = (o: React.CSSProperties) => o

export default function HistoryPage() {
  const router = useRouter()
  const { isPro, loading } = useProStatus()
  const [period, setPeriod] = useState<'1month' | '3months'>('1month')
  const [dailyLogs, setDailyLogs] = useState<any[]>([])
  const [habitLogs, setHabitLogs] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    if (!isPro) return
    async function load() {
      setDataLoading(true)
      try {
        const res = await fetch(`/api/history?period=${period}`)
        const { data } = await res.json()
        if (data) {
          setDailyLogs(data.dailyLogs || [])
          setHabitLogs(data.habitLogs || [])
        }
      } catch (e) { console.log(e) }
      setDataLoading(false)
    }
    load()
  }, [isPro, period])

  // Calculate averages
  const avgMood = dailyLogs.length > 0
    ? Math.round(dailyLogs.filter(l => l.mood > 0).reduce((sum, l) => sum + l.mood, 0) / dailyLogs.filter(l => l.mood > 0).length * 10) / 10
    : 0

  const avgEnergy = dailyLogs.length > 0
    ? Math.round(dailyLogs.filter(l => l.energy > 0).reduce((sum, l) => sum + l.energy, 0) / dailyLogs.filter(l => l.energy > 0).length * 10) / 10
    : 0

  const avgWater = dailyLogs.length > 0
    ? Math.round(dailyLogs.filter(l => l.water_glasses > 0).reduce((sum, l) => sum + l.water_glasses, 0) / dailyLogs.filter(l => l.water_glasses > 0).length * 10) / 10
    : 0

  const activeDays = dailyLogs.filter(l => l.mood > 0 || l.energy > 0 || l.water_glasses > 0).length

  function habitPct(habitIdx: number) {
    if (habitLogs.length === 0) return 0
    const count = habitLogs.filter(l => l.checked_habits?.[habitIdx]).length
    return Math.round(count / Math.max(activeDays, 1) * 100)
  }

  // Mood trend — last 30 days grouped by week
  function getWeeklyMoods() {
    const weeks: { label: string, avg: number }[] = []
    const totalWeeks = period === '1month' ? 4 : 12
    for (let w = totalWeeks - 1; w >= 0; w--) {
      const end = new Date()
      end.setDate(end.getDate() - w * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 7)
      const weekLogs = dailyLogs.filter(l => {
        const d = new Date(l.log_date)
        return d >= start && d <= end && l.mood > 0
      })
      const avg = weekLogs.length > 0
        ? weekLogs.reduce((sum, l) => sum + l.mood, 0) / weekLogs.length
        : 0
      weeks.push({ label: `W${totalWeeks - w}`, avg: Math.round(avg * 10) / 10 })
    }
    return weeks
  }

  const weeklyMoods = getWeeklyMoods()

  if (loading) return (
    <main style={s({ minHeight: '100vh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
      <div style={s({ fontSize: 14, color: '#7a7a72' })}>Loading...</div>
    </main>
  )

  return (
    <main style={s({ minHeight: '100vh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 100 })}>

      {/* Header */}
      <div style={s({ padding: '52px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
        <div>
          <button onClick={() => router.push('/dashboard/progress')} style={s({ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3d3d3a', marginBottom: 12, display: 'block' })}>←</button>
          <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#4a7c2f', textTransform: 'uppercase', marginBottom: 4 })}>Pro Feature</div>
          <h1 style={s({ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif" })}>Extended History</h1>
          <p style={s({ fontSize: 13, color: '#7a7a72', marginTop: 4 })}>Your trends over time</p>
        </div>
        <div style={s({ background: '#1a1a18', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#a8c48a', marginTop: 44 })}>✦ Pro</div>
      </div>

      {!isPro ? <ProGate feature="Extended History" /> : (
        <>
          {/* Period toggle */}
          <div style={s({ display: 'flex', gap: 8, padding: '16px 22px 0' })}>
            {(['1month', '3months'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={s({
                padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
                border: `1.5px solid ${period === p ? '#1a1a18' : '#e4e0d8'}`,
                background: period === p ? '#1a1a18' : 'white',
                color: period === p ? 'white' : '#7a7a72',
                fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', Arial, sans-serif",
              })}>{p === '1month' ? '1 Month' : '3 Months'}</button>
            ))}
          </div>

          {dataLoading ? (
            <div style={s({ textAlign: 'center', padding: '40px', color: '#7a7a72', fontSize: 14 })}>Loading your data...</div>
          ) : (
            <>
              {/* Summary stats */}
              <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 22px 0' })}>
                {[
                  { num: activeDays, label: 'Active days', color: '#4a7c2f' },
                  { num: avgMood > 0 ? `${avgMood}/5` : '–', label: 'Avg mood', color: moodColors[Math.round(avgMood)] || '#7a7a72' },
                  { num: avgEnergy > 0 ? `${avgEnergy}/5` : '–', label: 'Avg energy', color: '#185fa5' },
                  { num: avgWater > 0 ? `${avgWater}` : '–', label: 'Avg glasses/day', color: '#0369a1' },
                ].map(s2 => (
                  <div key={s2.label} style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
                    <div style={s({ fontSize: 28, fontWeight: 700, color: s2.color, fontFamily: "'DM Serif Display', Georgia, serif" })}>{s2.num}</div>
                    <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 4 })}>{s2.label}</div>
                  </div>
                ))}
              </div>

              {/* Mood trend chart */}
              <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
                <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 14 })}>
                  Mood trend — {period === '1month' ? 'last 4 weeks' : 'last 12 weeks'}
                </div>
                <div style={s({ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 })}>
                  {weeklyMoods.map((w, i) => (
                    <div key={i} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 })}>
                      <div style={s({ fontSize: 9, color: '#7a7a72' })}>{w.avg > 0 ? w.avg : ''}</div>
                      <div style={s({
                        width: '100%', borderRadius: '4px 4px 0 0',
                        height: w.avg > 0 ? `${Math.round(w.avg / 5 * 60)}px` : '4px',
                        background: w.avg > 0 ? moodColors[Math.round(w.avg)] : '#f0ece4',
                      })}/>
                      <div style={s({ fontSize: 9, color: '#7a7a72', fontWeight: 500 })}>{w.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habit consistency */}
              <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
                <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 14 })}>
                  Habit consistency — {period === '1month' ? '30 days' : '90 days'}
                </div>
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
                      <div style={s({ fontSize: 12, fontWeight: 600, color: '#7a7a72', minWidth: 32, textAlign: 'right' })}>{pct}%</div>
                    </div>
                  )
                })}
              </div>

              {/* Best streak info */}
              {activeDays > 0 && (
                <div style={s({ margin: '16px 22px 0', background: '#e1f5ee', borderLeft: '3px solid #5dcaa5', borderRadius: '0 12px 12px 0', padding: '12px 14px' })}>
                  <div style={s({ fontSize: 13, color: '#085041', lineHeight: 1.5 })}>
                    You logged data on <strong>{activeDays} days</strong> in the last {period === '1month' ? '30' : '90'} days.
                    {avgMood >= 4 ? ' Your mood has been consistently positive — keep it up! 🌿' : avgMood >= 3 ? ' Solid progress — consistency is the key.' : ' Every day you log is a step forward. Keep going! 💪'}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Bottom nav */}
      <div style={s({ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e4e0d8', display: 'flex', padding: '10px 0 20px', zIndex: 100 })}>
        {[
          { icon: '🏠', label: 'Today', path: '/dashboard', active: false },
          { icon: '📊', label: 'Summary', path: '/dashboard/summary', active: false },
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