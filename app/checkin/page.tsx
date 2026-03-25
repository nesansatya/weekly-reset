'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const questions = [
  {
    id: 'wake_feeling',
    emoji: '🌅',
    question: 'Good morning! How did you wake up?',
    sub: 'Be honest — this sets your plan for the day',
    options: [
      { label: 'Great', emoji: '😄', desc: 'Feeling refreshed and ready' },
      { label: 'Okay', emoji: '🙂', desc: 'Not bad, manageable' },
      { label: 'Tired', emoji: '😴', desc: 'Could use more sleep' },
      { label: 'Sick', emoji: '🤒', desc: 'Not feeling well today' },
    ],
  },
  {
    id: 'day_type',
    emoji: '📅',
    question: "What's your day looking like?",
    sub: 'Helps us fit wellness into your actual schedule',
    options: [
      { label: 'Normal', emoji: '✅', desc: 'Regular day, nothing special' },
      { label: 'Busy', emoji: '🔥', desc: 'Back-to-back, limited time' },
      { label: 'WFH', emoji: '🏠', desc: 'Working from home today' },
      { label: 'Off day', emoji: '🌴', desc: 'No work, free day' },
      { label: 'Travelling', emoji: '✈️', desc: 'On the go today' },
    ],
  },
  {
    id: 'workout_intent',
    emoji: '💪',
    question: 'Can you workout today?',
    sub: "It's okay to adjust — the plan adapts to you",
    options: [
      { label: 'Full workout', emoji: '🏋️', desc: "Let's go all in today" },
      { label: 'Light only', emoji: '🚶', desc: 'Something light is fine' },
      { label: 'Skip today', emoji: '🛌', desc: 'Need to rest today' },
    ],
  },
]

const proQuestion = {
  id: 'health_modifier',
  emoji: '🤒',
  question: 'Anything affecting you today?',
  sub: 'Helps us make smarter adjustments for you',
  options: [
    { label: 'All good', emoji: '✨', desc: 'Nothing to flag' },
    { label: 'Feeling sick', emoji: '🤧', desc: 'Under the weather' },
    { label: 'Injured', emoji: '🩹', desc: 'Something hurts' },
    { label: 'Stressed out', emoji: '😤', desc: 'High stress today' },
  ],
}

function getDailyPlan(answers: Record<string, string>, isPro: boolean) {
  const { wake_feeling, day_type, workout_intent, health_modifier } = answers

  // Sick or injured → full rest mode
  if (wake_feeling === 'Sick' || health_modifier === 'Feeling sick' || health_modifier === 'Injured') {
    return {
      emoji: '🛌',
      title: 'Rest & Recovery Day',
      message: "Your body is telling you something — listen to it. Full rest today. Drink plenty of water, eat well, and sleep early.",
      workoutMode: 'skip',
      tips: ['💧 Drink at least 2L of water', '🍲 Eat warm, nutritious meals', '😴 Sleep early tonight', '🌡️ Monitor how you feel'],
      color: '#e0eeff',
      border: '#85B7EB',
      textColor: '#0C447C',
    }
  }

  // Busy day → express mode
  if (day_type === 'Busy') {
    return {
      emoji: '⚡',
      title: 'Express Day — 15 Min Max',
      message: "Busy day detected. We've compressed your plan to 15 minutes. Short, sharp, effective.",
      workoutMode: 'light',
      tips: ['⏱️ 15-min express workout only', '💧 Keep a water bottle nearby', '🥗 Don\'t skip lunch', '📵 5-min phone-free break'],
      color: '#fff4e0',
      border: '#f5d58a',
      textColor: '#633806',
    }
  }

  // Travelling → hotel room mode
  if (day_type === 'Travelling') {
    return {
      emoji: '✈️',
      title: 'Travel Mode',
      message: "On the road today. We've switched to hotel room exercises — no equipment needed.",
      workoutMode: 'light',
      tips: ['🏨 Hotel room workout activated', '💧 Drink extra water when travelling', '🚶 Walk instead of taking transport', '😴 Protect your sleep tonight'],
      color: '#f0e8ff',
      border: '#b085eb',
      textColor: '#4a0c7c',
    }
  }

  // Skip workout
  if (workout_intent === 'Skip today') {
    return {
      emoji: '🌿',
      title: 'Active Rest Day',
      message: "No workout today — and that's completely fine. Rest is part of the plan. Focus on your habits instead.",
      workoutMode: 'skip',
      tips: ['🚶 A short walk counts', '💧 Hit your water goal', '🥗 3 structured meals', '😴 Sleep before midnight'],
      color: '#e8f5e0',
      border: '#97C459',
      textColor: '#27500A',
    }
  }

  // WFH → movement reminders
  if (day_type === 'WFH') {
    return {
      emoji: '🏠',
      title: 'WFH Mode — Move More',
      message: "Working from home means more sitting. We've added extra movement reminders to your day.",
      workoutMode: workout_intent === 'Light only' ? 'light' : 'full',
      tips: ['🚶 Stand up every hour', '💧 Keep water on your desk', '☀️ Go outside at lunch', '📵 Log off on time tonight'],
      color: '#e8f5e0',
      border: '#97C459',
      textColor: '#27500A',
    }
  }

  // Off day → outdoor mode
  if (day_type === 'Off day') {
    return {
      emoji: '🌴',
      title: 'Free Day — Enjoy It!',
      message: "Day off! Perfect time for something outdoors. A walk, a swim, badminton — anything active counts.",
      workoutMode: 'full',
      tips: ['🏸 Try an outdoor activity', '☀️ Get some sunlight', '🥗 Cook a proper meal', '😴 Use this day to rest well'],
      color: '#fff4e0',
      border: '#f5d58a',
      textColor: '#633806',
    }
  }

  // Tired but can workout
  if (wake_feeling === 'Tired') {
    return {
      emoji: '😴',
      title: 'Low Energy Day — Easy Does It',
      message: "You're tired but you showed up — that's the most important thing. Lighter load today.",
      workoutMode: 'light',
      tips: ['💧 Drink water before anything', '☀️ Get outside for 10 mins', '🍳 Eat a proper breakfast', '😴 Sleep earlier tonight'],
      color: '#e0eeff',
      border: '#85B7EB',
      textColor: '#0C447C',
    }
  }

  // Great day → full send
  if (wake_feeling === 'Great') {
    return {
      emoji: '🔥',
      title: "You're On Fire Today!",
      message: "Great energy detected. This is your day to push harder — add an extra set, hit all your habits, and make it count.",
      workoutMode: 'full',
      tips: ['🏋️ Full workout — push harder', '💧 Hit your water goal early', '🥗 Fuel well for the energy', '📈 Log everything today'],
      color: '#1a1a18',
      border: '#7db84a',
      textColor: '#a8c48a',
    }
  }

  // Default — normal day
  return {
    emoji: '💪',
    title: 'Solid Day Ahead',
    message: "Normal day, normal plan. Stick to your routine and keep the streak alive.",
    workoutMode: 'full',
    tips: ['💪 Complete today\'s workout', '💧 Hit your water goal', '✅ Check off your habits', '😴 Sleep before midnight'],
    color: '#f0f7e8',
    border: '#c0dd97',
    textColor: '#3B6D11',
  }
}

export default function CheckinPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isPro, setIsPro] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  const allQuestions = isPro ? [...questions, proQuestion] : questions

  useEffect(() => {
    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/checkin?date=${today}`)
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.wake_feeling) setAlreadyDone(true)
      })
    // Check pro status
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.is_pro) setIsPro(true)
      })
  }, [])

  const current = allQuestions[step]

  async function handleAnswer(value: string) {
    const newAnswers = { ...answers, [current.id]: value }
    setAnswers(newAnswers)

    if (step < allQuestions.length - 1) {
      setStep(step + 1)
    } else {
      // Save and show plan
      setSaving(true)
      try {
        await fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAnswers),
        })
      } catch (_e) {}
      setSaving(false)
      setShowPlan(true)
    }
  }

  // Already checked in today
  if (alreadyDone) return (
    <main style={{
      minHeight: '100dvh', background: '#faf8f4',
      fontFamily: "'DM Sans', Arial, sans-serif",
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: '#1a1a18',
        fontFamily: "'DM Serif Display', Georgia, serif",
        marginBottom: 8, textAlign: 'center',
      }}>Already checked in today!</div>
      <div style={{ fontSize: 13, color: '#7a7a72', marginBottom: 32, textAlign: 'center', lineHeight: 1.5 }}>
        Come back tomorrow morning for your next check-in.
      </div>
      <button onClick={() => router.push('/dashboard')} style={{
        padding: '14px 32px', background: '#4a7c2f', color: 'white',
        border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700,
        cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
      }}>
        Go to dashboard →
      </button>
    </main>
  )

  // Show daily plan after check-in
  if (showPlan) {
    const plan = getDailyPlan(answers, isPro)
    return (
      <main style={{
        minHeight: '100dvh', background: '#faf8f4',
        fontFamily: "'DM Sans', Arial, sans-serif",
        padding: 'calc(env(safe-area-inset-top) + 40px) 24px 60px',
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{plan.emoji}</div>
          <div style={{
            fontSize: 26, fontWeight: 700, color: '#1a1a18',
            fontFamily: "'DM Serif Display', Georgia, serif",
            marginBottom: 8, lineHeight: 1.3,
          }}>{plan.title}</div>
          <div style={{
            fontSize: 13, color: '#7a7a72', lineHeight: 1.6,
            marginBottom: 20,
          }}>{plan.message}</div>
        </div>

        {/* Daily plan card */}
        <div style={{
          background: plan.color, border: `1px solid ${plan.border}`,
          borderRadius: 16, padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: plan.textColor, marginBottom: 12 }}>
            Your plan for today:
          </div>
          {plan.tips.map((tip, i) => (
            <div key={i} style={{
              fontSize: 13, color: plan.textColor,
              padding: '8px 0',
              borderBottom: i < plan.tips.length - 1 ? `1px solid ${plan.border}` : 'none',
              lineHeight: 1.5,
            }}>{tip}</div>
          ))}
        </div>

        {/* Pro upsell for free users */}
        {!isPro && (
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e0, #f0f7e8)',
            border: '1px solid #97C459', borderRadius: 14,
            padding: 16, marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 4 }}>
              ✦ Pro users get smarter daily plans
            </div>
            <div style={{ fontSize: 12, color: '#3B6D11', marginBottom: 10, lineHeight: 1.5 }}>
              Unlock health modifier question, injury detection, and fully personalised daily plans.
            </div>
            <button onClick={() => router.push('/upgrade')} style={{
              padding: '8px 16px', background: '#4a7c2f', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
            }}>Upgrade to Pro →</button>
          </div>
        )}

        <button onClick={() => router.push('/dashboard')} style={{
          width: '100%', padding: 16,
          background: '#1a1a18', color: 'white',
          border: 'none', borderRadius: 14,
          fontSize: 15, fontWeight: 700,
          cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
        }}>
          Let's go — open my dashboard →
        </button>
      </main>
    )
  }

  // Quiz questions
  return (
    <main style={{
      minHeight: '100dvh', background: '#faf8f4',
      fontFamily: "'DM Sans', Arial, sans-serif",
      display: 'flex', flexDirection: 'column',
      padding: '0 0 60px',
    }}>
      {/* Progress bar */}
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 40px) 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7a7a72' }}>
            {step + 1} of {allQuestions.length}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a7c2f' }}>
            {Math.round(((step + 1) / allQuestions.length) * 100)}%
          </div>
        </div>
        <div style={{ height: 5, background: '#e4e0d8', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 10, background: '#4a7c2f',
            width: `${((step + 1) / allQuestions.length) * 100}%`,
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
        }}>{current.question}</div>
        <div style={{ fontSize: 13, color: '#7a7a72', marginBottom: 32, lineHeight: 1.5 }}>
          {current.sub}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options.map((option) => (
            <button
              key={option.label}
              onClick={() => handleAnswer(option.label)}
              disabled={saving}
              style={{
                width: '100%', padding: '14px 16px',
                background: 'white', border: '1.5px solid #e4e0d8',
                borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                fontFamily: "'DM Sans', Arial, sans-serif",
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ fontSize: 24, width: 32, textAlign: 'center' }}>{option.emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18' }}>{option.label}</div>
                <div style={{ fontSize: 11, color: '#7a7a72', marginTop: 2 }}>{option.desc}</div>
              </div>
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
            fontFamily: "'DM Sans', Arial, sans-serif", fontWeight: 600,
          }}>← Back</button>
        </div>
      )}
    </main>
  )
}