'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProStatus } from '../../hooks/useProStatus'
import ProGate from '../../components/ProGate'

const mealSuggestions = {
  Breakfast: [
    { name: 'Eggs & toast', macros: 'Protein + Carbs' },
    { name: 'Oats with fruit', macros: 'Carbs + Fibre' },
    { name: 'Greek yogurt & nuts', macros: 'Protein + Fat' },
    { name: 'Avocado toast', macros: 'Fat + Carbs' },
    { name: 'Smoothie bowl', macros: 'Carbs + Vitamins' },
    { name: 'Nasi lemak (light)', macros: 'Carbs + Protein' },
  ],
  Lunch: [
    { name: 'Grilled chicken & rice', macros: 'Protein + Carbs' },
    { name: 'Tuna salad wrap', macros: 'Protein + Fibre' },
    { name: 'Tofu stir fry', macros: 'Protein + Vegetables' },
    { name: 'Salmon with vegetables', macros: 'Protein + Fat' },
    { name: 'Brown rice & dahl', macros: 'Carbs + Protein' },
    { name: 'Chicken soup', macros: 'Protein + Vegetables' },
  ],
  Dinner: [
    { name: 'Grilled fish & salad', macros: 'Protein + Fibre' },
    { name: 'Egg & vegetable stir fry', macros: 'Protein + Vegetables' },
    { name: 'Tofu & spinach', macros: 'Protein + Vegetables' },
    { name: 'Chicken & broccoli', macros: 'Protein + Vegetables' },
    { name: 'Light soup & bread', macros: 'Carbs + Protein' },
    { name: 'Avocado & tuna bowl', macros: 'Protein + Fat' },
  ],
  Snacks: [
    { name: 'Handful of nuts', macros: 'Healthy fat' },
    { name: 'Banana', macros: 'Carbs + Potassium' },
    { name: 'Hard boiled eggs', macros: 'Protein' },
    { name: 'Apple & peanut butter', macros: 'Carbs + Fat' },
    { name: 'Greek yogurt', macros: 'Protein' },
    { name: 'Dates', macros: 'Natural sugar + Energy' },
  ],
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const mealTimes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

type MealEntry = { name: string; macros: string; custom?: boolean }
type DayPlan = { [meal: string]: MealEntry[] }
type WeekPlan = { [day: string]: DayPlan }

const s = (o: React.CSSProperties) => o

export default function MealPlanPage() {
  const router = useRouter()
  const { isPro, loading } = useProStatus()
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [selectedMeal, setSelectedMeal] = useState('Breakfast')
  const [plan, setPlan] = useState<WeekPlan>({})
  const [customMeal, setCustomMeal] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/meal-plan')
        const { data } = await res.json()
        if (data?.plan) setPlan(data.plan)
      } catch (e) { console.log(e) }
    }
    if (isPro) load()
  }, [isPro])

  async function savePlan(newPlan: WeekPlan) {
    setSaving(true)
    try {
      await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.log(e) }
    setSaving(false)
  }

  function addMeal(meal: MealEntry) {
    const current = plan[selectedDay]?.[selectedMeal] || []
    if (current.find(m => m.name === meal.name)) return
    const updated = {
      ...plan,
      [selectedDay]: {
        ...plan[selectedDay],
        [selectedMeal]: [...current, meal],
      }
    }
    setPlan(updated)
    savePlan(updated)
  }

  function removeMeal(index: number) {
    const current = plan[selectedDay]?.[selectedMeal] || []
    const updated = {
      ...plan,
      [selectedDay]: {
        ...plan[selectedDay],
        [selectedMeal]: current.filter((_, i) => i !== index),
      }
    }
    setPlan(updated)
    savePlan(updated)
  }

  function addCustomMeal() {
    if (!customMeal.trim()) return
    addMeal({ name: customMeal, macros: '', custom: true })
    setCustomMeal('')
  }

  const currentMeals = plan[selectedDay]?.[selectedMeal] || []
  const suggestions = mealSuggestions[selectedMeal as keyof typeof mealSuggestions] || []

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
          <button onClick={() => router.push('/dashboard')} style={s({ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3d3d3a', marginBottom: 12, display: 'block' })}>←</button>
          <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#4a7c2f', textTransform: 'uppercase', marginBottom: 4 })}>Pro Feature</div>
          <h1 style={s({ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif" })}>Meal Planner</h1>
          <p style={s({ fontSize: 13, color: '#7a7a72', marginTop: 4 })}>Plan your meals for the week</p>
        </div>
        <div style={s({ background: '#1a1a18', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#a8c48a', marginTop: 44 })}>✦ Pro</div>
      </div>

      {!isPro ? <ProGate feature="Meal Planner" /> : (
        <>
          {/* Day selector */}
          <div style={s({ display: 'flex', gap: 6, padding: '16px 22px 0', overflowX: 'auto', scrollbarWidth: 'none' })}>
            {days.map(d => (
              <button key={d} onClick={() => setSelectedDay(d)} style={s({
                padding: '8px 14px', borderRadius: 20, flexShrink: 0,
                border: `1.5px solid ${selectedDay === d ? '#4a7c2f' : '#e4e0d8'}`,
                background: selectedDay === d ? '#e8f5e0' : 'white',
                color: selectedDay === d ? '#4a7c2f' : '#7a7a72',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', Arial, sans-serif",
              })}>{d.slice(0, 3)}</button>
            ))}
          </div>

          {/* Meal time tabs */}
          <div style={s({ display: 'flex', gap: 6, padding: '12px 22px 0', overflowX: 'auto', scrollbarWidth: 'none' })}>
            {mealTimes.map(m => (
              <button key={m} onClick={() => setSelectedMeal(m)} style={s({
                padding: '7px 16px', borderRadius: 20, flexShrink: 0,
                border: `1.5px solid ${selectedMeal === m ? '#1a1a18' : '#e4e0d8'}`,
                background: selectedMeal === m ? '#1a1a18' : 'white',
                color: selectedMeal === m ? 'white' : '#7a7a72',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', Arial, sans-serif",
              })}>{m}</button>
            ))}
          </div>

          {/* Current meals */}
          <div style={s({ margin: '16px 22px 0' })}>
            <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 })}>
              <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase' })}>
                {selectedDay} · {selectedMeal} {saved && <span style={{ color: '#4a7c2f' }}>· Saved ✓</span>}
              </div>
              {saving && <div style={s({ fontSize: 11, color: '#7a7a72' })}>Saving...</div>}
            </div>

            {currentMeals.length === 0 ? (
              <div style={s({ background: 'white', borderRadius: 14, border: '1px dashed #e4e0d8', padding: '24px 16px', textAlign: 'center' })}>
                <div style={s({ fontSize: 13, color: '#7a7a72' })}>No meals planned — add some below!</div>
              </div>
            ) : (
              <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', overflow: 'hidden' })}>
                {currentMeals.map((meal, i) => (
                  <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < currentMeals.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
                    <div style={s({ flex: 1 })}>
                      <div style={s({ fontSize: 14, fontWeight: 500, color: '#1a1a18' })}>{meal.name}</div>
                      {meal.macros && <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>{meal.macros}</div>}
                    </div>
                    <button onClick={() => removeMeal(i)} style={s({ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 })}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add custom meal */}
          <div style={s({ margin: '12px 22px 0', display: 'flex', gap: 8 })}>
            <input
              type="text" placeholder="Add your own meal..."
              value={customMeal} onChange={e => setCustomMeal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomMeal()}
              style={s({ flex: 1, padding: '11px 12px', border: '1.5px solid #e4e0d8', borderRadius: 10, fontSize: 14, color: '#1a1a18', outline: 'none', fontFamily: "'DM Sans', Arial, sans-serif" })}
            />
            <button onClick={addCustomMeal} style={s({ padding: '11px 20px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>Add</button>
          </div>

          {/* Suggestions */}
          <div style={s({ margin: '16px 22px 0' })}>
            <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Suggestions</div>
            <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', overflow: 'hidden' })}>
              {suggestions.map((meal, i) => {
                const already = currentMeals.find(m => m.name === meal.name)
                return (
                  <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < suggestions.length - 1 ? '1px solid #f5f2ec' : 'none', opacity: already ? 0.4 : 1 })}>
                    <div style={s({ flex: 1 })}>
                      <div style={s({ fontSize: 14, fontWeight: 500, color: '#1a1a18' })}>{meal.name}</div>
                      <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>{meal.macros}</div>
                    </div>
                    <button onClick={() => !already && addMeal(meal)} style={s({
                      padding: '5px 12px', borderRadius: 6,
                      background: already ? '#f5f2ec' : '#e8f5e0',
                      border: 'none', color: already ? '#9a9a92' : '#4a7c2f',
                      fontSize: 12, fontWeight: 600, cursor: already ? 'default' : 'pointer',
                      fontFamily: "'DM Sans', Arial, sans-serif",
                    })}>
                      {already ? 'Added ✓' : '+ Add'}
                    </button>
                  </div>
                )
              })}
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