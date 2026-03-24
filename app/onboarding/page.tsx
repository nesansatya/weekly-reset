'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const questions = [
  {
    id: 'age_range',
    emoji: '🎂',
    question: 'How old are you?',
    sub: 'Helps us adjust workout intensity for you',
    options: ['18–24', '25–34', '35–44', '45–54', '55+'],
  },
  {
    id: 'fitness_level',
    emoji: '💪',
    question: 'What is your current fitness level?',
    sub: 'Be honest — this helps us start you at the right level',
    options: ['Complete beginner', 'Some experience', 'Intermediate', 'Pretty active'],
  },
  {
    id: 'workout_days_per_week',
    emoji: '📅',
    question: 'How many days per week can you workout?',
    sub: 'We will build your plan around this',
    options: ['2 days', '3 days', '4 days', '5 days', '6–7 days'],
  },
  {
    id: 'sleep_quality',
    emoji: '😴',
    question: 'How is your sleep quality?',
    sub: 'Sleep affects everything — energy, mood, and recovery',
    options: ['Very poor', 'Could be better', 'Decent', 'Pretty good'],
  },
  {
    id: 'health_challenge',
    emoji: '😓',
    question: 'What is your biggest health challenge?',
    sub: 'We will focus on this area for you',
    options: ['Low energy', 'Poor sleep', 'Stress & anxiety', 'Weight management', 'Building consistency'],
  },
  {
    id: 'work_schedule',
    emoji: '💼',
    question: 'What is your work schedule like?',
    sub: 'Helps us understand your daily movement',
    options: ['Desk job — mostly sitting', 'Mix of sitting and moving', 'On my feet most of the day', 'Physical/manual work'],
  },
  {
    id: 'body_feeling',
    emoji: '⚖️',
    question: 'How does your body feel right now?',
    sub: 'Your honest starting point',
    options: ['Sluggish and heavy', 'Below average', 'Average', 'Pretty good'],
  },
  {
    id: 'eating_habits',
    emoji: '🍽️',
    question: 'How would you describe your eating habits?',
    sub: 'No judgement — just helps us guide you better',
    options: ['I skip meals often', 'I eat irregularly', 'I eat 3 meals mostly', 'I eat well and consistently'],
  },
  {
    id: 'water_intake',
    emoji: '💧',
    question: 'How much water do you drink daily?',
    sub: 'Most people drink less than they think',
    options: ['Less than 1L', '1–1.5L', '1.5–2L', 'More than 2L'],
  },
  {
    id: 'stress_level',
    emoji: '🧘',
    question: 'How would you rate your stress level?',
    sub: 'Stress directly impacts your health and recovery',
    options: ['Very high', 'High', 'Moderate', 'Low'],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [saving, setSaving] = useState(false)

  const current = questions[step]
  const progress = ((step) / questions.length) * 100

  async function handleAnswer(value: string) {
    const newAnswers = {
      ...answers,
      [current.id]: current.id === 'workout_days_per_week'
        ? parseInt(value.split(' ')[0])
        : value,
    }
    setAnswers(newAnswers)

    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      // Save all answers
      setSaving(true)
      try {
        await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAnswers),
        })
      } catch (_e) {}
      setSaving(false)
      router.push('/dashboard')
    }
  }

  return (
    <main style={{
      minHeight: '100dvh',
      background: '#faf8f4',
      fontFamily: "'DM Sans', Arial, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      padding: '0 0 60px',
    }}>

      {/* Progress bar */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top) + 40px) 24px 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7a7a72' }}>
            {step + 1} of {questions.length}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a7c2f' }}>
            {Math.round(((step + 1) / questions.length) * 100)}%
          </div>
        </div>
        <div style={{ height: 5, background: '#e4e0d8', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 10,
            background: '#4a7c2f',
            width: `${((step + 1) / questions.length) * 100}%`,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, padding: '40px 24px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{current.emoji}</div>
        <div style={{
          fontSize: 24, fontWeight: 700, color: '#1a1a18',
          fontFamily: "'DM Serif Display', Georgia, serif",
          marginBottom: 8, lineHeight: 1.3,
        }}>
          {current.question}
        </div>
        <div style={{ fontSize: 13, color: '#7a7a72', marginBottom: 32, lineHeight: 1.5 }}>
          {current.sub}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options.map(option => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={saving}
              style={{
                width: '100%', padding: '16px 20px',
                background: 'white', border: '1.5px solid #e4e0d8',
                borderRadius: 14, fontSize: 14, fontWeight: 500,
                color: '#1a1a18', cursor: 'pointer', textAlign: 'left',
                fontFamily: "'DM Sans', Arial, sans-serif",
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.borderColor = '#4a7c2f'
                ;(e.target as HTMLButtonElement).style.background = '#e8f5e0'
                ;(e.target as HTMLButtonElement).style.color = '#4a7c2f'
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.borderColor = '#e4e0d8'
                ;(e.target as HTMLButtonElement).style.background = 'white'
                ;(e.target as HTMLButtonElement).style.color = '#1a1a18'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Back button */}
      {step > 0 && (
        <div style={{ padding: '20px 24px 0' }}>
          <button onClick={() => setStep(step - 1)} style={{
            background: 'none', border: 'none',
            fontSize: 13, color: '#7a7a72', cursor: 'pointer',
            fontFamily: "'DM Sans', Arial, sans-serif",
            fontWeight: 600,
          }}>
            ← Back
          </button>
        </div>
      )}

    </main>
  )
}