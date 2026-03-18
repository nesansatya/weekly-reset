'use client'
import { useRouter } from 'next/navigation'
import { useProStatus } from '../../hooks/useProStatus'
import ProGate from '../../components/ProGate'

const s = (o: React.CSSProperties) => o

export default function CheckInPage() {
  const router = useRouter()
  const { isPro, loading } = useProStatus()

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
          <button onClick={() => router.push('/dashboard/summary')} style={s({ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3d3d3a', marginBottom: 12, display: 'block' })}>←</button>
          <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#4a7c2f', textTransform: 'uppercase', marginBottom: 4 })}>Pro Feature</div>
          <h1 style={s({ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif" })}>AI Weekly Check-in</h1>
          <p style={s({ fontSize: 13, color: '#7a7a72', marginTop: 4 })}>Personalised wellness analysis by Claude</p>
        </div>
        <div style={s({ background: '#1a1a18', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#a8c48a', marginTop: 44 })}>✦ Pro</div>
      </div>

      {!isPro ? <ProGate feature="AI Weekly Check-in" /> : (
        <>
          {/* Coming soon card */}
          <div style={s({ margin: '16px 22px 0', background: '#1a1a18', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' })}>
            <div style={s({ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: '#7db84a', opacity: 0.08, top: -40, right: -40 })}/>
            <div style={s({ position: 'relative', zIndex: 1, textAlign: 'center' })}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
              <div style={s({ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 8 })}>
                Coming very soon
              </div>
              <div style={s({ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20 })}>
                Claude will analyse your weekly mood, energy, habits and water data — and write you a personalised wellness report with specific advice for next week.
              </div>
              <div style={s({ background: 'rgba(125,184,74,0.15)', border: '1px solid rgba(125,184,74,0.3)', borderRadius: 10, padding: '10px 16px', fontSize: 12, color: '#a8c48a', fontWeight: 600 })}>
                🔔 You'll be notified when this launches
              </div>
            </div>
          </div>

          {/* Preview of what's coming */}
          <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
            <div style={s({ fontSize: 13, fontWeight: 600, color: '#3d3d3a', marginBottom: 12 })}>What you'll get</div>
            {[
              { icon: '📊', text: 'Analysis of your mood and energy patterns this week' },
              { icon: '💧', text: 'Hydration consistency review' },
              { icon: '✅', text: 'Habit completion breakdown and what to focus on' },
              { icon: '🎯', text: 'Specific action plan for next week' },
              { icon: '💡', text: 'One personalised insight based on your data' },
            ].map((item, i) => (
              <div key={i} style={s({ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' })}>
                <div style={{ fontSize: 18 }}>{item.icon}</div>
                <div style={s({ fontSize: 13, color: '#3d3d3a', lineHeight: 1.5 })}>{item.text}</div>
              </div>
            ))}
          </div>

          {/* Sample report preview */}
          <div style={s({ margin: '16px 22px 0', background: '#f5f2ec', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
            <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 12 })}>Sample report preview</div>
            <div style={s({ fontSize: 13, color: '#3d3d3a', lineHeight: 1.8, fontStyle: 'italic', opacity: 0.7 })}>
              "This was a solid week for you. Your morning sunlight habit is your strongest — 5 out of 7 days is excellent. Where you struggled was phone-off before bed, which likely explains the 2 days of low energy on Wednesday and Thursday.{'\n\n'}For next week, focus on one thing: phone off by 10pm. That single change will improve your sleep, energy and mood more than anything else..."
            </div>
            <div style={s({ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 })}>
              <div style={s({ width: 20, height: 20, borderRadius: '50%', background: '#1a1a18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 })}>🌿</div>
              <div style={s({ fontSize: 11, color: '#7a7a72' })}>Generated by Claude — personalised to your data</div>
            </div>
          </div>
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