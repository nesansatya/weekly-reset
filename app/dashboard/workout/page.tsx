'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProStatus } from '../../hooks/useProStatus'
import ProGate from '../../components/ProGate'

const defaultExercises = [
  { name: 'Push-ups', sets: '3 × 12', category: 'Strength' },
  { name: 'Bodyweight squats', sets: '3 × 12', category: 'Strength' },
  { name: 'Plank', sets: '3 × 30 sec', category: 'Core' },
  { name: 'Lunges', sets: '3 × 10 each', category: 'Strength' },
  { name: 'Burpees', sets: '3 × 10', category: 'Cardio' },
  { name: 'Mountain climbers', sets: '3 × 20', category: 'Cardio' },
  { name: 'Glute bridges', sets: '3 × 15', category: 'Strength' },
  { name: 'Tricep dips', sets: '3 × 12', category: 'Strength' },
  { name: 'Jump rope', sets: '3 × 1 min', category: 'Cardio' },
  { name: 'Superman hold', sets: '3 × 20 sec', category: 'Core' },
  { name: 'Side plank', sets: '2 × 20 sec each', category: 'Core' },
  { name: 'Calf raises', sets: '3 × 20', category: 'Strength' },
  { name: 'High knees', sets: '3 × 30 sec', category: 'Cardio' },
  { name: 'Diamond push-ups', sets: '3 × 10', category: 'Strength' },
  { name: 'Wall sit', sets: '3 × 30 sec', category: 'Strength' },
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const categories = ['All', 'Strength', 'Cardio', 'Core']

type Exercise = { name: string; sets: string; category: string }
type WorkoutPlan = { [day: string]: Exercise[] }

const s = (o: React.CSSProperties) => o

export default function WorkoutBuilder() {
  const router = useRouter()
  const { isPro, loading } = useProStatus()
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [plan, setPlan] = useState<WorkoutPlan>({})
  const [filter, setFilter] = useState('All')
  const [customName, setCustomName] = useState('')
  const [customSets, setCustomSets] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showAddCustom, setShowAddCustom] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/workout-plan')
        const { data } = await res.json()
        if (data?.plan) setPlan(data.plan)
      } catch (e) { console.log(e) }
    }
    if (isPro) load()
  }, [isPro])

  async function savePlan(newPlan: WorkoutPlan) {
    setSaving(true)
    try {
      await fetch('/api/workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.log(e) }
    setSaving(false)
  }

  function addExercise(ex: Exercise) {
    const current = plan[selectedDay] || []
    if (current.find(e => e.name === ex.name)) return
    const updated = { ...plan, [selectedDay]: [...current, ex] }
    setPlan(updated)
    savePlan(updated)
  }

  function removeExercise(index: number) {
    const current = plan[selectedDay] || []
    const updated = { ...plan, [selectedDay]: current.filter((_, i) => i !== index) }
    setPlan(updated)
    savePlan(updated)
  }

  function addCustom() {
    if (!customName.trim()) return
    addExercise({ name: customName, sets: customSets || '', category: 'Custom' })
    setCustomName('')
    setCustomSets('')
    setShowAddCustom(false)
  }

  const filtered = filter === 'All' ? defaultExercises : defaultExercises.filter(e => e.category === filter)
  const dayExercises = plan[selectedDay] || []

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
          <h1 style={s({ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif" })}>Workout Builder</h1>
          <p style={s({ fontSize: 13, color: '#7a7a72', marginTop: 4 })}>Customise your weekly workout plan</p>
        </div>
        <div style={s({ background: '#1a1a18', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#a8c48a', marginTop: 44 })}>✦ Pro</div>
      </div>

      {!isPro ? <ProGate feature="Workout Builder" /> : (
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
              })}>
                {d.slice(0, 3)}
                {(plan[d] || []).length > 0 && (
                  <span style={s({ marginLeft: 4, background: '#4a7c2f', color: 'white', borderRadius: '50%', padding: '1px 5px', fontSize: 9 })}>
                    {(plan[d] || []).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Current day plan */}
          <div style={s({ margin: '16px 22px 0' })}>
            <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 })}>
              <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase' })}>
                {selectedDay}'s workout {saved && <span style={{ color: '#4a7c2f' }}>· Saved ✓</span>}
              </div>
              {saving && <div style={s({ fontSize: 11, color: '#7a7a72' })}>Saving...</div>}
            </div>

            {dayExercises.length === 0 ? (
              <div style={s({ background: 'white', borderRadius: 14, border: '1px dashed #e4e0d8', padding: '24px 16px', textAlign: 'center' })}>
                <div style={s({ fontSize: 13, color: '#7a7a72' })}>No exercises yet — add some below!</div>
              </div>
            ) : (
              <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', overflow: 'hidden' })}>
                {dayExercises.map((ex, i) => (
                  <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < dayExercises.length - 1 ? '1px solid #f5f2ec' : 'none' })}>
                    <div style={s({ flex: 1 })}>
                      <div style={s({ fontSize: 14, fontWeight: 500, color: '#1a1a18' })}>{ex.name}</div>
                      {ex.sets && <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>{ex.sets}</div>}
                    </div>
                    <div style={s({ fontSize: 10, color: '#7a7a72', background: '#f5f2ec', padding: '2px 8px', borderRadius: 4 })}>{ex.category}</div>
                    <button onClick={() => removeExercise(i)} style={s({ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: '0 4px' })}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add custom exercise */}
          <div style={s({ margin: '12px 22px 0' })}>
            <button onClick={() => setShowAddCustom(!showAddCustom)} style={s({
              width: '100%', padding: '11px', background: 'white',
              border: '1.5px dashed #e4e0d8', borderRadius: 14,
              fontSize: 13, fontWeight: 600, color: '#4a7c2f',
              cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
            })}>
              + Add custom exercise
            </button>
            {showAddCustom && (
              <div style={s({ background: 'white', border: '1px solid #e4e0d8', borderRadius: 14, padding: 16, marginTop: 8 })}>
                <input
                  type="text" placeholder="Exercise name"
                  value={customName} onChange={e => setCustomName(e.target.value)}
                  style={s({ width: '100%', padding: '10px 12px', border: '1.5px solid #e4e0d8', borderRadius: 8, fontSize: 14, color: '#1a1a18', outline: 'none', boxSizing: 'border-box', marginBottom: 8, fontFamily: "'DM Sans', Arial, sans-serif" })}
                />
                <input
                  type="text" placeholder="Sets/reps (e.g. 3 × 12)"
                  value={customSets} onChange={e => setCustomSets(e.target.value)}
                  style={s({ width: '100%', padding: '10px 12px', border: '1.5px solid #e4e0d8', borderRadius: 8, fontSize: 14, color: '#1a1a18', outline: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: "'DM Sans', Arial, sans-serif" })}
                />
                <button onClick={addCustom} style={s({ width: '100%', padding: '10px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
                  Add to {selectedDay}
                </button>
              </div>
            )}
          </div>

          {/* Exercise library */}
          <div style={s({ margin: '16px 22px 0' })}>
            <div style={s({ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#7a7a72', textTransform: 'uppercase', marginBottom: 10 })}>Exercise library</div>
            <div style={s({ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', scrollbarWidth: 'none' })}>
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)} style={s({
                  padding: '6px 14px', borderRadius: 20, flexShrink: 0,
                  border: `1.5px solid ${filter === c ? '#1a1a18' : '#e4e0d8'}`,
                  background: filter === c ? '#1a1a18' : 'white',
                  color: filter === c ? 'white' : '#7a7a72',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'DM Sans', Arial, sans-serif",
                })}>{c}</button>
              ))}
            </div>
            <div style={s({ background: 'white', borderRadius: 14, border: '1px solid #e4e0d8', overflow: 'hidden' })}>
              {filtered.map((ex, i) => {
                const already = dayExercises.find(e => e.name === ex.name)
                return (
                  <div key={i} style={s({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #f5f2ec' : 'none', opacity: already ? 0.4 : 1 })}>
                    <div style={s({ flex: 1 })}>
                      <div style={s({ fontSize: 14, fontWeight: 500, color: '#1a1a18' })}>{ex.name}</div>
                      <div style={s({ fontSize: 11, color: '#7a7a72', marginTop: 2 })}>{ex.sets}</div>
                    </div>
                    <div style={s({ fontSize: 10, color: '#7a7a72', background: '#f5f2ec', padding: '2px 8px', borderRadius: 4 })}>{ex.category}</div>
                    <button onClick={() => !already && addExercise(ex)} style={s({
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