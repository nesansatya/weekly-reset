'use client'
import { useRouter } from 'next/navigation'

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const weekData = [
  { complete: true, mood: 4, energy: 4 },
  { complete: true, mood: 3, energy: 3 },
  { complete: true, mood: 5, energy: 5 },
  { complete: false, mood: 2, energy: 2 },
  { complete: true, mood: 4, energy: 4 },
  { complete: true, mood: 5, energy: 5 },
  { complete: false, mood: 0, energy: 0 },
]

const moodColors = ['','#f5a58a','#f5d58a','#7db84a','#5dcaa5','#7f77dd']

const habits = [
  { icon: '☀️', label: 'Morning sunlight', pct: 86 },
  { icon: '💧', label: '500ml on waking', pct: 100 },
  { icon: '🚶', label: 'Steps goal', pct: 71 },
  { icon: '🥗', label: '3 structured meals', pct: 57 },
  { icon: '📵', label: 'Phone off before bed', pct: 43 },
  { icon: '🌙', label: 'Sleep before midnight', pct: 57 },
]

const s = (o: React.CSSProperties) => o

export default function Summary() {
  const router = useRouter()
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  return (
    <main style={s({ minHeight: '100vh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 80 })}>

      <div style={s({ padding: '52px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
        <div>
          <div style={s({ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif" })}>This week</div>
          <div style={s({ fontSize: 12, color: '#7a7a72', marginTop: 2 })}>
            {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={s({ background: '#fff4e0', border: '1px solid #f5d58a', borderRadius: 30, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#8a6200' })}>
          🔥 5 days
        </div>
      </div>

      {/* Week grid */}
      <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, margin: '16px 22px 0' })}>
        {days.map((d, i) => {
          const data = weekData[i]
          const isFuture = i > todayIdx
          return (
            <div key={i} style={s({
              border: `1px solid ${data.complete && !isFuture ? '#7db84a' : '#e4e0d8'}`,
              borderRadius: 10, padding: '8px 4px', textAlign: 'center',
              background: data.complete && !isFuture ? '#e8f5e0' : 'white',
              opacity: isFuture ? 0.4 : 1,
            })}>
              <div style={s({ fontSize: 10, fontWeight: 600, color: data.complete && !isFuture ? '#4a7c2f' : '#7a7a72', marginBottom: 6 })}>{d}</div>
              {!isFuture && data.mood > 0 && (
                <>
                  <div style={s({ width: 8, height: 8, borderRadius: '50%', background: moodColors[data.mood], margin: '3px auto' })}/>
                  <div style={s({ width: 8, height: 8, borderRadius: '50%', background: moodColors[data.energy], margin: '3px auto' })}/>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 22px 0' })}>
        {[
          { num: '3/3', label: 'Strength days', sub: 'Full week ✓', color: '#4a7c2f' },
          { num: '28', label: 'Habits logged', sub: '+4 vs last week', color: '#4a7c2f' },
        ].map(s2 => (
          <div key={s2.label} style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: '16px' })}>
            <div style={s({ fontSize: 30, fontWeight: 700, color: s2.color, fontFamily: "'DM Serif Display', Georgia, serif" })}>{s2.num}</div>
            <div style={s({ fontSize: 12, color: '#7a7a72', marginTop: 4 })}>{s2.label}</div>
            <div style={s({ fontSize: 11, fontWeight: 600, color: s2.color, marginTop: 4 })}>{s2.sub}</div>
          </div>
        ))}
      </div>

      {/* Mood chart */}
      <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
        <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 14 })}>Mood this week</div>
        <div style={s({ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 })}>
          {weekData.map((d, i) => (
            <div key={i} style={s({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 })}>
              <div style={s({
                width: '100%', borderRadius: '4px 4px 0 0',
                height: d.mood > 0 ? `${Math.round(d.mood / 5 * 56)}px` : '4px',
                background: d.mood > 0 ? moodColors[d.mood] : '#f0ece4',
                opacity: i > todayIdx ? 0.3 : 1,
              })}/>
              <div style={s({ fontSize: 9, color: '#7a7a72', fontWeight: 500 })}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit completion */}
      <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
        <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 14 })}>Habit completion</div>
        {habits.map((h, i) => (
          <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < habits.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
            <div style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{h.icon}</div>
            <div style={s({ flex: 1 })}>
              <div style={s({ fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 4 })}>{h.label}</div>
              <div style={s({ height: 5, background: '#f0ece4', borderRadius: 4, overflow: 'hidden' })}>
                <div style={s({ height: '100%', borderRadius: 4, width: `${h.pct}%`, background: h.pct >= 70 ? '#7db84a' : h.pct >= 40 ? '#f5d58a' : '#f5a58a' })}/>
              </div>
            </div>
            <div style={s({ fontSize: 12, fontWeight: 600, color: '#7a7a72', minWidth: 28, textAlign: 'right' })}>{h.pct}%</div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={s({ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e4e0d8', display: 'flex', padding: '10px 0 20px', zIndex: 100 })}>
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