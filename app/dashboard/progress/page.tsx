'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

const s = (o: React.CSSProperties) => o

export default function Progress() {
  const router = useRouter()
  const [streakData, setStreakData] = useState({ current_streak: 0, longest_streak: 0, total_active_days: 0, total_habits_completed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/streak')
        const { data } = await res.json()
        if (data) setStreakData(data)
      } catch(e) { console.log(e) }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 'calc(70px + env(safe-area-inset-bottom))' })}>

      <div style={s({
        padding: '16px 22px 0',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
      })}>
        <div style={s({ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif" })}>Your progress</div>
        <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 })}>
          <div style={s({ fontSize: 13, color: '#7a7a72' })}>All-time stats</div>
          <button onClick={() => router.push('/dashboard/history')} style={s({ fontSize: 11, fontWeight: 600, color: '#4a7c2f', background: '#e8f5e0', border: 'none', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>✦ Full history</button>
        </div>
      </div>

      {loading ? (
        <div style={s({ textAlign: 'center', padding: '60px 22px', color: '#7a7a72', fontSize: 14 })}>Loading your stats...</div>
      ) : (
        <>
          <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, margin: '16px 22px 0' })}>
            {[
              { num: String(streakData.total_active_days), label: 'Active days', color: '#4a7c2f' },
              { num: String(streakData.current_streak), label: 'Day streak', color: '#8a6200' },
              { num: String(streakData.total_habits_completed), label: 'Habits done', color: '#534ab7' },
            ].map(s2 => (
              <div key={s2.label} style={s({ background: '#f5f2ec', borderRadius: 12, padding: 12 })}>
                <div style={s({ fontSize: 26, fontWeight: 700, color: s2.color, fontFamily: "'DM Serif Display', Georgia, serif" })}>{s2.num}</div>
                <div style={s({ fontSize: 10, color: '#7a7a72', marginTop: 2, fontWeight: 500 })}>{s2.label}</div>
              </div>
            ))}
          </div>

          {streakData.longest_streak > 0 && (
            <div style={s({ margin: '10px 22px 0', background: '#fff4e0', border: '1px solid #f5d58a', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
              <div style={s({ fontSize: 13, fontWeight: 600, color: '#8a6200' })}>🏆 Longest streak ever</div>
              <div style={s({ fontSize: 20, fontWeight: 700, color: '#8a6200', fontFamily: "'DM Serif Display', Georgia, serif" })}>{streakData.longest_streak} days</div>
            </div>
          )}
        </>
      )}

      <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
        <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 14 })}>What to expect</div>
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

      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, margin: '16px 22px 0' })}>
        {[
          { num: '3×', label: 'Strength sessions', color: '#4a7c2f' },
          { num: '8k', label: 'Daily steps', color: '#185fa5' },
          { num: '8h', label: 'Sleep per night', color: '#1d9e75' },
        ].map(s2 => (
          <div key={s2.label} style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 12, padding: 12 })}>
            <div style={s({ fontSize: 22, fontWeight: 700, color: s2.color, fontFamily: "'DM Serif Display', Georgia, serif" })}>{s2.num}</div>
            <div style={s({ fontSize: 10, color: '#7a7a72', marginTop: 2 })}>{s2.label}</div>
          </div>
        ))}
      </div>

      <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
        <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 12 })}>Optional boosters</div>
        {boosters.map((b, i) => (
          <div key={i} style={s({ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < boosters.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
            <div style={s({ fontSize: 13, fontWeight: 600, color: '#1a1a18', minWidth: 100 })}>{b.label}</div>
            <div style={s({ fontSize: 13, color: '#7a7a72' })}>{b.desc}</div>
          </div>
        ))}
      </div>

      <div style={s({ margin: '16px 22px 0', background: '#e1f5ee', borderLeft: '3px solid #5dcaa5', borderRadius: '0 12px 12px 0', padding: '12px 14px' })}>
        <div style={s({ fontSize: 13, color: '#085041', lineHeight: 1.5, fontStyle: 'italic' })}>
          "Consistency beats intensity. You don't need a perfect plan — you need a routine you can follow for years."
        </div>
      </div>

      <div style={s({
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', borderTop: '1px solid #e4e0d8',
        display: 'flex', paddingTop: 10,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
        zIndex: 100,
      })}>
        {[
          { icon: '🏠', label: 'Today', path: '/dashboard', active: false },
          { icon: '📊', label: 'Summary', path: '/dashboard/summary', active: false },
          { icon: '🥗', label: 'Meals', path: '/dashboard/meals', active: false },
          { icon: '📈', label: 'Progress', path: '/dashboard/progress', active: true },
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