'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const PRICE_IDS = {
  monthly_usd: 'price_1TBvE0CpOa5WGSeZK8660t7O',
  yearly_usd: 'price_1TBvE0CpOa5WGSeZrJ7kx3qh',
}

const s = (o: React.CSSProperties) => o

const benefits = [
  {
    title: 'AI weekly check-in',
    desc: '"You logged low energy 4 of 7 days — all after skipping morning sunlight. Here\'s your pattern."',
    bg: '#1a1a18',
    iconBg: 'rgba(125,184,74,0.15)',
    titleColor: 'white',
    descColor: 'rgba(255,255,255,0.5)',
    border: 'rgba(125,184,74,0.2)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#7db84a" strokeWidth="1.6"/>
        <path d="M11 7V11L14 13" stroke="#7db84a" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Pattern intelligence',
    desc: 'Spot what\'s working and what\'s holding you back — across habits, sleep, mood and water.',
    bg: 'white',
    iconBg: '#e8f5e0',
    titleColor: '#1a1a18',
    descColor: '#7a7a72',
    border: '#e4e0d8',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <path d="M3 16L8 10L12 13L16 7L19 9" stroke="#4a7c2f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 7H19V10" stroke="#4a7c2f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Custom workout & meal plan',
    desc: 'Build your exact weekly plan. Swap exercises, set your meals, make it yours.',
    bg: 'white',
    iconBg: '#e0eeff',
    titleColor: '#1a1a18',
    descColor: '#7a7a72',
    border: '#e4e0d8',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="9" width="4" height="4" rx="1" stroke="#185fa5" strokeWidth="1.6"/>
        <rect x="16" y="9" width="4" height="4" rx="1" stroke="#185fa5" strokeWidth="1.6"/>
        <path d="M6 11H16" stroke="#185fa5" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M8 7V15M14 7V15" stroke="#185fa5" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Streak protection',
    desc: 'One free streak freeze per month. Miss a day without losing everything you\'ve built.',
    bg: 'white',
    iconBg: '#fff4e0',
    titleColor: '#1a1a18',
    descColor: '#7a7a72',
    border: '#e4e0d8',
    icon: (
      <svg width="18" height="18" viewBox="0 0 12 14" fill="none">
        <path d="M6 1C6 1 9.5 4 9.5 7.5C9.5 9.43 7.93 11 6 11C4.07 11 2.5 9.43 2.5 7.5C2.5 6.5 3 5.5 3 5.5C3 5.5 3.5 7 5 7C5 7 3.5 5 6 1Z" fill="#BA7517"/>
      </svg>
    ),
  },
  {
    title: '3-month history & trends',
    desc: 'See how you\'ve improved over 90 days — not just this week.',
    bg: 'white',
    iconBg: '#fde8e0',
    titleColor: '#1a1a18',
    descColor: '#7a7a72',
    border: '#e4e0d8',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <path d="M12 3H19V10" stroke="#993C1D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 3L11 11" stroke="#993C1D" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M10 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19H15C16.1 19 17 18.1 17 17V12" stroke="#993C1D" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes — one tap from your profile page. No questions asked.' },
  { q: 'What happens to my data if I cancel?', a: 'Your habits and history stay. You lose Pro features, not your progress.' },
  { q: 'Is payment secure?', a: 'Handled by Stripe — same platform used by Amazon and Google.' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <div style={{ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2, flexShrink: 0 }}/>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#3d3d3a', letterSpacing: '0.02em' }}>{children}</div>
    </div>
  )
}

function UpgradeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const coupon = searchParams.get('coupon')
  const source = searchParams.get('source')
  const isStreakReward = source === 'streak' && coupon === 'dTaJGxYd'

  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)

  const prices = {
    monthly: { usd: '$4.99', myr: 'RM19.90' },
    yearly: { usd: '$39', myr: 'RM159' },
    monthlyEquiv: 'RM13.25',
    yearlySavings: { usd: '$20.88', myr: 'RM79.80' },
    streakMonthly: { myr: 'RM9.95' },
    streakYearly: { myr: 'RM79.50' },
  }

  async function handleUpgrade() {
    setLoading(true)
    try {
      const priceId = billing === 'monthly' ? PRICE_IDS.monthly_usd : PRICE_IDS.yearly_usd
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, ...(isStreakReward && { couponId: coupon }) }),
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
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 48 })}>

      {/* Header */}
      <div style={s({ background: '#1a1a18', padding: '16px 22px 28px', paddingTop: 'calc(env(safe-area-inset-top) + 16px)' })}>
        <button onClick={() => router.back()} style={s({ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 })}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={s({ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', Arial, sans-serif" })}>Back</span>
        </button>
        <div style={s({ fontSize: 11, color: '#7db84a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 })}>
          Weekly Reset Pro
        </div>
        <div style={s({ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1.25, marginBottom: 10 })}>
          Free tracks habits.<br/>Pro tells you what<br/>they mean.
        </div>
        <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 })}>
          Your data is already there. Pro turns it into a weekly intelligence report — specific to you.
        </div>
      </div>

      <div style={s({ padding: '20px 22px 0' })}>

        {/* Streak reward banner */}
        {isStreakReward && (
          <div style={s({ background: '#1a1a18', borderRadius: 14, padding: 16, border: '1px solid #c4a35a', marginBottom: 24 })}>
            <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 })}>
              <svg width="14" height="16" viewBox="0 0 12 14" fill="none">
                <path d="M6 1C6 1 9.5 4 9.5 7.5C9.5 9.43 7.93 11 6 11C4.07 11 2.5 9.43 2.5 7.5C2.5 6.5 3 5.5 3 5.5C3 5.5 3.5 7 5 7C5 7 3.5 5 6 1Z" fill="#f0d080"/>
              </svg>
              <div style={s({ fontSize: 13, fontWeight: 700, color: '#f0d080' })}>Your streak reward is applied</div>
            </div>
            <div style={s({ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginBottom: 10 })}>
              50% off for your first 12 months. Full price from Year 2.
            </div>
            <div style={s({ display: 'flex', gap: 16 })}>
              <div style={s({ fontSize: 13, color: '#f0d080', fontWeight: 700 })}>Monthly: {prices.streakMonthly.myr}/mo</div>
              <div style={s({ fontSize: 13, color: '#f0d080', fontWeight: 700 })}>Yearly: {prices.streakYearly.myr}/yr</div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <SectionLabel>What changes with Pro</SectionLabel>
        <div style={s({ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 })}>
          {benefits.map((b, i) => (
            <div key={i} style={s({ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' })}>
              <div style={s({ width: 36, height: 36, borderRadius: 10, background: b.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })}>
                {b.icon}
              </div>
              <div style={s({ flex: 1 })}>
                <div style={s({ fontSize: 13, fontWeight: 700, color: b.titleColor, marginBottom: 3 })}>{b.title}</div>
                <div style={s({ fontSize: 11, color: b.descColor, lineHeight: 1.55 })}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <SectionLabel>Choose your plan</SectionLabel>
        <div style={s({ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 })}>

          {/* Yearly */}
          <div
            onClick={() => setBilling('yearly')}
            style={s({ background: '#1a1a18', borderRadius: 14, padding: 16, border: `2px solid ${billing === 'yearly' ? '#7db84a' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s ease' })}
          >
            {billing === 'yearly' && (
              <div style={s({ position: 'absolute', top: -1, right: 16, background: '#4a7c2f', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: '0 0 8px 8px', letterSpacing: '0.04em' })}>BEST VALUE</div>
            )}
            <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
              <div>
                <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 })}>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: 'white' })}>Yearly</div>
                  {billing === 'yearly' && (
                    <div style={s({ background: 'rgba(125,184,74,0.2)', color: '#a8c48a', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 })}>Selected</div>
                  )}
                </div>
                <div style={s({ fontSize: 11, color: 'rgba(255,255,255,0.4)' })}>{prices.monthlyEquiv}/month · billed annually</div>
              </div>
              <div style={s({ textAlign: 'right' })}>
                <div style={s({ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 })}>
                  {isStreakReward ? prices.streakYearly.myr : prices.yearly.myr}
                </div>
                <div style={s({ fontSize: 10, color: '#a8c48a', marginTop: 2 })}>
                  Save {isStreakReward ? 'RM79.50' : prices.yearlySavings.myr}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly */}
          <div
            onClick={() => setBilling('monthly')}
            style={s({ background: 'white', borderRadius: 14, padding: 16, border: `2px solid ${billing === 'monthly' ? '#4a7c2f' : '#e4e0d8'}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s ease' })}
          >
            <div>
              <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 })}>
                <div style={s({ fontSize: 13, fontWeight: 700, color: '#1a1a18' })}>Monthly</div>
                {billing === 'monthly' && (
                  <div style={s({ background: '#e8f5e0', color: '#4a7c2f', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 })}>Selected</div>
                )}
              </div>
              <div style={s({ fontSize: 11, color: '#9a9a92' })}>Cancel anytime</div>
            </div>
            <div style={s({ fontSize: 22, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif" })}>
              {isStreakReward ? prices.streakMonthly.myr : prices.monthly.myr}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button onClick={handleUpgrade} disabled={loading} style={s({
          width: '100%', padding: '15px', background: '#4a7c2f', color: 'white',
          border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          fontFamily: "'DM Sans', Arial, sans-serif", marginBottom: 10,
        })}>
          {loading ? 'Redirecting to checkout...' : `Start Pro${billing === 'yearly' ? ' — ' + (isStreakReward ? prices.streakYearly.myr : prices.yearly.myr) + '/yr' : ' — ' + (isStreakReward ? prices.streakMonthly.myr : prices.monthly.myr) + '/mo'} →`}
        </button>
        <div style={s({ textAlign: 'center', fontSize: 11, color: '#9a9a92', marginBottom: 28 })}>
          Secure payment via Stripe · Cancel anytime
        </div>

        {/* FAQ */}
        <SectionLabel>Common questions</SectionLabel>
        <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, overflow: 'hidden', marginBottom: 8 })}>
          {faqs.map((item, i) => (
            <div key={i} style={s({ padding: '14px 16px', borderBottom: i < faqs.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
              <div style={s({ fontSize: 13, fontWeight: 600, color: '#1a1a18', marginBottom: 4 })}>{item.q}</div>
              <div style={s({ fontSize: 12, color: '#7a7a72', lineHeight: 1.6 })}>{item.a}</div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100dvh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: '#7a7a72', fontFamily: "'DM Sans', Arial, sans-serif" }}>Loading...</div>
      </main>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
