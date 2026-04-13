'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

const meals = [
  {
    time: 'Breakfast', hour: '7–9 am',
    macros: [
      { label: 'Protein', color: '#e8f5e0', text: '#4a7c2f' },
      { label: 'Carbs', color: '#fff4e0', text: '#8a6200' },
      { label: 'Healthy fat', color: '#e0eeff', text: '#1a4a8a' },
    ],
    foods: ['eggs', 'whole grain toast', 'fruit', 'Greek yogurt', 'oats', 'coffee / tea', 'avocado', 'nuts'],
  },
  {
    time: 'Lunch', hour: '12–2 pm',
    macros: [
      { label: 'Protein', color: '#e8f5e0', text: '#4a7c2f' },
      { label: 'Carbs', color: '#fff4e0', text: '#8a6200' },
      { label: 'Vegetables', color: '#fde8e0', text: '#8a3520' },
    ],
    foods: ['rice', 'grilled chicken', 'fish', 'tofu', 'broccoli', 'carrots', 'potatoes', 'spinach'],
  },
  {
    time: 'Dinner', hour: '6–8 pm',
    macros: [
      { label: 'Protein', color: '#e8f5e0', text: '#4a7c2f' },
      { label: 'Vegetables', color: '#fde8e0', text: '#8a3520' },
    ],
    foods: ['eggs', 'fish', 'spinach', 'cucumber', 'avocado', 'nuts', 'olive oil', 'tofu'],
  },
]

const rules = [
  'Stop heavy meals 2–3 hours before sleep',
  'Avoid ultra-processed food and constant snacking',
  'Each meal: protein + carbs + vegetables + healthy fat',
  'Drink 2.5–3L of water daily — spread through the day',
]

const s = (o: React.CSSProperties) => o

export default function Meals() {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const meal = meals[active]

  return (
    <main style={s({ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 90 })}>

      <div style={s({
        padding: '16px 22px 20px',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        background: '#1a1a18',
      })}>
        <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
          <div style={s({ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif" })}>Meal guide</div>
          <button onClick={() => router.push('/dashboard/meal-plan')} style={s({ fontSize: 11, fontWeight: 600, color: '#a8c48a', background: 'rgba(125,184,74,0.15)', border: '1px solid rgba(125,184,74,0.3)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>✦ My plan</button>
        </div>
      </div>

      <div style={s({ display: 'flex', gap: 8, padding: '16px 22px 0', overflowX: 'auto', scrollbarWidth: 'none' })}>
        {meals.map((m, i) => (
          <button key={i} onClick={() => setActive(i)} style={s({
            padding: '7px 18px', borderRadius: 30, flexShrink: 0,
            border: `1.5px solid ${active === i ? '#1a1a18' : '#e4e0d8'}`,
            background: active === i ? '#1a1a18' : 'white',
            color: active === i ? 'white' : '#7a7a72',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', Arial, sans-serif",
          })}>{m.time}</button>
        ))}
      </div>

      <div style={s({ margin: '14px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, overflow: 'hidden' })}>
        <div style={s({ padding: '14px 16px 12px', borderBottom: '1px solid #f5f2ec', display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
          <div style={s({ fontSize: 16, fontWeight: 700, color: '#1a1a18' })}>{meal.time}</div>
          <div style={s({ fontSize: 11, color: '#7a7a72' })}>{meal.hour}</div>
        </div>
        <div style={s({ display: 'flex', gap: 6, padding: '12px 16px', flexWrap: 'wrap', borderBottom: '1px solid #f5f2ec' })}>
          {meal.macros.map(m => (
            <span key={m.label} style={s({ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: m.color, color: m.text })}>{m.label}</span>
          ))}
        </div>
        <div style={s({ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '12px 16px' })}>
          {meal.foods.map(f => (
            <span key={f} style={s({ padding: '5px 11px', borderRadius: 20, border: '1px solid #e4e0d8', fontSize: 12, color: '#3d3d3a', background: '#faf8f4' })}>{f}</span>
          ))}
        </div>
      </div>

      <div style={s({ margin: '14px 22px 0', background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16 })}>
        <div style={s({ fontSize: 14, fontWeight: 700, color: '#1a1a18', marginBottom: 14 })}>Each meal should include</div>
        {[
          { label: 'Protein', desc: 'eggs · chicken · fish · tofu · Greek yogurt', bg: '#e8f5e0', color: '#4a7c2f' },
          { label: 'Carbs', desc: 'rice · potatoes · oats · whole grains', bg: '#fff4e0', color: '#8a6200' },
          { label: 'Vegetables', desc: 'spinach · broccoli · carrots · cucumber', bg: '#fde8e0', color: '#8a3520' },
          { label: 'Healthy fat', desc: 'avocado · nuts · olive oil', bg: '#e0eeff', color: '#1a4a8a' },
        ].map(item => (
          <div key={item.label} style={s({ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' })}>
            <div style={s({ width: 30, height: 30, borderRadius: 8, background: item.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
              <div style={s({ width: 8, height: 8, borderRadius: '50%', background: item.color })}/>
            </div>
            <div>
              <div style={s({ fontSize: 13, fontWeight: 600, color: '#1a1a18' })}>{item.label}</div>
              <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 1 })}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s({ margin: '14px 22px 0', background: '#1a1a18', borderRadius: 14, padding: 16 })}>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 })}>
          <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
          <div style={s({ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' })}>Nutrition rules</div>
        </div>
        {rules.map((r, i) => (
          <div key={i} style={s({ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 })}>
            <div style={s({ width: 6, height: 6, borderRadius: '50%', background: '#7db84a', flexShrink: 0, marginTop: 5 })}/>
            <div style={s({ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 })}>{r}</div>
          </div>
        ))}
      </div>

      <BottomNav active="meals" router={router} />
    </main>
  )
}
