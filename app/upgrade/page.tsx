'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const features = {
  free: [
    { text: '7-day workout plan', included: true },
    { text: 'Daily habit tracking', included: true },
    { text: 'Mood & energy logging', included: true },
    { text: 'Water intake tracker', included: true },
    { text: 'Weekly summary', included: true },
    { text: 'Meal guide', included: true },
    { text: 'Custom workout builder', included: false },
    { text: 'Custom meal plan', included: false },
    { text: 'AI weekly check-in', included: false },
    { text: 'Extended history (3 months)', included: false },
  ],
  pro: [
    { text: '7-day workout plan', included: true },
    { text: 'Daily habit tracking', included: true },
    { text: 'Mood & energy logging', included: true },
    { text: 'Water intake tracker', included: true },
    { text: 'Weekly summary', included: true },
    { text: 'Meal guide', included: true },
    { text: 'Custom workout builder', included: true },
    { text: 'Custom meal plan', included: true },
    { text: 'AI weekly check-in', included: true },
    { text: 'Extended history (3 months)', included: true },
  ],
}

const PRICE_IDS = {
  monthly_usd: 'price_1TBvE0CpOa5WGSeZK8660t7O',
  yearly_usd: 'price_1TBvE0CpOa5WGSeZrJ7kx3qh',
}

const s = (o: React.CSSProperties) => o

export default function UpgradePage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [currency, setCurrency] = useState<'usd' | 'myr'>('usd')
  const [loading, setLoading] = useState(false)

  const prices = {
    monthly: { usd: '$4.99', myr: 'RM19.90' },
    yearly: { usd: '$39', myr: 'RM159' },
    yearlySavings: { usd: '$20.88', myr: 'RM79.80' },
  }

  async function handleUpgrade() {
    setLoading(true)
    try {
      const priceId = billing === 'monthly' ? PRICE_IDS.monthly_usd : PRICE_IDS.yearly_usd
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const { url, error } = await res.json()
      if (error) { alert(error); setLoading(false); return }
      window.location.href = url
    } catch (e) {
      console.log(e)
      setLoading(false)
    }
  }

  return (
    <main style={s({ minHeight: '100vh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 40 })}>

      {/* Header */}
      <div style={s({ padding: '52px 22px 0' })}>
        <button onClick={() => router.back()} style={s({ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3d3d3a', marginBottom: 20, display: 'block' })}>←</button>
        <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#4a7c2f', textTransform: 'uppercase', marginBottom: 6 })}>Upgrade</div>
        <h1 style={s({ fontSize: 28, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 6 })}>
          Weekly Reset Pro
        </h1>
        <p style={s({ fontSize: 14, color: '#7a7a72', lineHeight: 1.6 })}>
          Personalise everything. Let AI guide your weekly reset.
        </p>
      </div>

      {/* Currency toggle */}
      <div style={s({ display: 'flex', gap: 8, padding: '20px 22px 0' })}>
        {(['usd', 'myr'] as const).map(c => (
          <button key={c} onClick={() => setCurrency(c)} style={s({
            padding: '6px 18px', borderRadius: 20, cursor: 'pointer',
            border: `1.5px solid ${currency === c ? '#1a1a18' : '#e4e0d8'}`,
            background: currency === c ? '#1a1a18' : 'white',
            color: currency === c ? 'white' : '#7a7a72',
            fontSize: 12, fontWeight: 600,
            fontFamily: "'DM Sans', Arial, sans-serif",
          })}>{c.toUpperCase()}</button>
        ))}
      </div>

      {/* Billing toggle */}
      <div style={s({ display: 'flex', gap: 8, padding: '12px 22px 0', alignItems: 'center' })}>
        {(['monthly', 'yearly'] as const).map(b => (
          <button key={b} onClick={() => setBilling(b)} style={s({
            padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
            border: `1.5px solid ${billing === b ? '#4a7c2f' : '#e4e0d8'}`,
            background: billing === b ? '#e8f5e0' : 'white',
            color: billing === b ? '#4a7c2f' : '#7a7a72',
            fontSize: 13, fontWeight: 600,
            fontFamily: "'DM Sans', Arial, sans-serif",
          })}>{b.charAt(0).toUpperCase() + b.slice(1)}</button>
        ))}
        {billing === 'yearly' && (
          <div style={s({ background: '#fff4e0', border: '1px solid #f5d58a', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#8a6200' })}>
            Save {prices.yearlySavings[currency]}!
          </div>
        )}
      </div>

      {/* Price card */}
      <div style={s({ margin: '16px 22px 0', background: '#1a1a18', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' })}>
        <div style={s({ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: '#7db84a', opacity: 0.08, top: -40, right: -40 })}/>
        <div style={s({ position: 'relative', zIndex: 1 })}>
          <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 })}>
            Pro Plan
          </div>
          <div style={s({ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 })}>
            <div style={s({ fontSize: 42, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 })}>
              {prices[billing][currency]}
            </div>
            <div style={s({ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 })}>
              /{billing === 'monthly' ? 'month' : 'year'}
            </div>
          </div>
          {billing === 'yearly' && (
            <div style={s({ fontSize: 12, color: '#a8c48a', marginBottom: 16 })}>
              Saves {prices.yearlySavings[currency]} vs monthly billing
            </div>
          )}
          <button onClick={handleUpgrade} disabled={loading} style={s({
            width: '100%', padding: '14px',
            background: '#5d9a3a', color: 'white',
            border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            fontFamily: "'DM Sans', Arial, sans-serif",
            marginTop: 8,
          })}>
            {loading ? 'Redirecting to checkout...' : `Upgrade to Pro →`}
          </button>
          <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 10 })}>
            Secure payment via Stripe · Cancel anytime
          </div>
        </div>
      </div>

      {/* Feature comparison */}
      <div style={s({ margin: '16px 22px 0' })}>
        <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 })}>
          {/* Free */}
          <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
            <div style={s({ fontSize: 12, fontWeight: 700, color: '#7a7a72', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' })}>Free</div>
            {features.free.map((f, i) => (
              <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 })}>
                <div style={s({ width: 16, height: 16, borderRadius: '50%', background: f.included ? '#e8f5e0' : '#f5f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9 })}>
                  {f.included ? '✓' : '–'}
                </div>
                <div style={s({ fontSize: 11, color: f.included ? '#3d3d3a' : '#b0aba3', lineHeight: 1.3 })}>{f.text}</div>
              </div>
            ))}
          </div>

          {/* Pro */}
          <div style={s({ background: '#1a1a18', border: '1px solid #2a2a26', borderRadius: 14, padding: 16, position: 'relative', overflow: 'hidden' })}>
            <div style={s({ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: '#7db84a', opacity: 0.1, top: -20, right: -20 })}/>
            <div style={s({ fontSize: 12, fontWeight: 700, color: '#a8c48a', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em', position: 'relative', zIndex: 1 })}>Pro ✦</div>
            {features.pro.map((f, i) => (
              <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, position: 'relative', zIndex: 1 })}>
                <div style={s({ width: 16, height: 16, borderRadius: '50%', background: f.included ? 'rgba(125,184,74,0.3)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: f.included ? '#a8c48a' : 'rgba(255,255,255,0.3)' })}>
                  {f.included ? '✓' : '–'}
                </div>
                <div style={s({ fontSize: 11, color: f.included ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)', lineHeight: 1.3 })}>{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={s({ margin: '16px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
        <div style={s({ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginBottom: 14 })}>Common questions</div>
        {[
          { q: 'Can I cancel anytime?', a: 'Yes — cancel with one tap from your profile page. No questions asked.' },
          { q: 'What happens to my data if I cancel?', a: 'Your data stays. You just lose access to Pro features, not your history.' },
          { q: 'Is my payment secure?', a: 'Payments are handled by Stripe — the same platform used by Amazon and Google.' },
        ].map((item, i, arr) => (
          <div key={i} style={s({ paddingBottom: i < arr.length - 1 ? 12 : 0, marginBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
            <div style={s({ fontSize: 13, fontWeight: 600, color: '#1a1a18', marginBottom: 4 })}>{item.q}</div>
            <div style={s({ fontSize: 12, color: '#7a7a72', lineHeight: 1.6 })}>{item.a}</div>
          </div>
        ))}
      </div>

    </main>
  )
}
