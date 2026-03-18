'use client'
import { useRouter } from 'next/navigation'

const s = (o: React.CSSProperties) => o

export default function ProGate({ feature }: { feature: string }) {
  const router = useRouter()

  return (
    <div style={s({
      margin: '16px 22px',
      background: '#1a1a18',
      borderRadius: 16,
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    })}>
      <div style={s({
        position: 'absolute', width: 150, height: 150,
        borderRadius: '50%', background: '#7db84a',
        opacity: 0.08, top: -40, right: -40,
      })}/>
      <div style={s({ position: 'relative', zIndex: 1 })}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
        <div style={s({
          fontSize: 16, fontWeight: 700, color: 'white',
          fontFamily: "'DM Serif Display', Georgia, serif",
          marginBottom: 8,
        })}>
          {feature} is Pro only
        </div>
        <div style={s({
          fontSize: 13, color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.6, marginBottom: 20,
        })}>
          Upgrade to Weekly Reset Pro to unlock this feature and personalise your entire wellness journey.
        </div>
        <button
          onClick={() => router.push('/upgrade')}
          style={s({
            padding: '12px 28px',
            background: '#5d9a3a', color: 'white',
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'DM Sans', Arial, sans-serif",
          })}>
          Upgrade to Pro →
        </button>
        <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 10 })}>
          From $4.99/month · Cancel anytime
        </div>
      </div>
    </div>
  )
}
