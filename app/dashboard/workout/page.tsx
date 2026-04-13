'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProStatus } from '../../hooks/useProStatus'
import ProGate from '../../components/ProGate'
import BottomNav from '../../components/BottomNav'

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
    <main style={s({ minHeight: '100vh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", paddingBottom: 90 })}>

      <div style={s({
        padding: '16px 22px 20px',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        background: '#1a1a18',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      })}>
        <div style={s({ fontSize: 24, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif" })}>Workout</div>
        <div style={s({ background: 'rgba(125,184,74,0.15)', border: '1px solid rgba(125,184,74,0.3)', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#a8c48a' })}>✦ Pro</div>
      </div>

      {!isPro ? <ProGate feature="Workout Builder" /> : (
        <>
          <div style={s({ display: 'flex', gap: 6, padding: '16px 22px 0', overflowX: 'auto', scrollbarWidth: 'none' })}>
            {days.map(d => (
              <button key={d} onClick={() => setSelectedDay(d)} style={s({
                padding: '8px 14px', borderRadius: 20, flexShrink: 0,
                border: `1.5px solid ${selectedDay === d ? '#1a1a18' : '#e4e0d8'}`,
                background: selectedDay === d ? '#1a1a18' : 'white',
                color: selectedDay === d ? 'white' : '#7a7a72',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', Arial, sans-serif",
              })}>
                {d.slice(0, 3)}
                {(plan[d] || []).length > 0 && (
                  <span style={s({ marginLeft: 4, background: selectedDay === d ? 'rgba(255,255,255,0.2)' : '#4a7c2f', color: 'white', borderRadius: '50%', padding: '1px 5px', fontSize: 9 })}>
                    {(plan[d] || []).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={s({ margin: '16px 22px 0' })}>
            <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 })}>
              <div style={s({ display: 'flex', alignItems: 'center', gap: 8 })}>
                <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
                <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a' })}>
                  {selectedDay}
                  {saved && <span style={s({ color: '#4a7c2f', marginLeft: 6 })}>· Saved</span>}
                </div>
              </div>
              {saving && <div style={s({ fontSize: 11, color: '#9a9a92' })}>Saving…</div>}
            </div>

            {dayExercises.length === 0 ? (
              <div style={s({ background: 'white', borderRadius: 14, border: '1px dashed #e4e0d8', padding: '24px 16px', textAlign: 'center' })}>
                <div style={s({ fontSize: 13, color: '#9a9a92' })}>No exercises yet — add some below</div>
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
                    <button onClick={() => removeExercise(i)} style={s({ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 })}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                <input type="text" placeholder="Exercise name" value={customName} onChange={e => setCustomName(e.target.value)}
                  style={s({ width: '100%', padding: '10px 12px', border: '1.5px solid #e4e0d8', borderRadius: 8, fontSize: 14, color: '#1a1a18', outline: 'none', boxSizing: 'border-box', marginBottom: 8, fontFamily: "'DM Sans', Arial, sans-serif" })}/>
                <input type="text" placeholder="Sets/reps (e.g. 3 × 12)" value={customSets} onChange={e => setCustomSets(e.target.value)}
                  style={s({ width: '100%', padding: '10px 12px', border: '1.5px solid #e4e0d8', borderRadius: 8, fontSize: 14, color: '#1a1a18', outline: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: "'DM Sans', Arial, sans-serif" })}/>
                <button onClick={addCustom} style={s({ width: '100%', padding: '10px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" })}>
                  Add to {selectedDay}
                </button>
              </div>
            )}
          </div>

          <div style={s({ margin: '16px 22px 0' })}>
            <div style={s({ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 })}>
              <div style={s({ width: 3, height: 14, background: '#4a7c2f', borderRadius: 2 })}/>
              <div style={s({ fontSize: 12, fontWeight: 700, color: '#3d3d3a' })}>Exercise library</div>
            </div>
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
                      {already ? 'Added' : '+ Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <BottomNav active="workout" router={router} />
    </main>
  )
}
