'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// ─── MORNING QUESTIONS ───────────────────────────────────────────────────────
const morningQuestions = [
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

const morningProQuestion = {
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

// ─── MIDDAY QUESTIONS ────────────────────────────────────────────────────────
const middayQuestions = [
  {
    id: 'midday_feeling',
    emoji: '☀️',
    question: "How's your day going so far?",
    sub: 'A quick midday check-in to adjust your afternoon',
    options: [
      { label: 'Great', emoji: '😄', desc: "It's been a good one" },
      { label: 'Okay', emoji: '🙂', desc: 'Getting through it' },
      { label: 'Rough', emoji: '😔', desc: 'Tough day so far' },
    ],
  },
  {
    id: 'midday_workout_done',
    emoji: '💪',
    question: 'Did you complete your workout?',
    sub: "If not, there's still time",
    options: [
      { label: 'Yes', emoji: '✅', desc: 'Done and dusted!' },
      { label: 'Partially', emoji: '🔄', desc: 'Got some of it done' },
      { label: 'Not yet', emoji: '⏰', desc: "Haven't done it yet" },
    ],
  },
]

// ─── BEDTIME QUESTIONS ───────────────────────────────────────────────────────
const bedtimeQuestions = [
  {
    id: 'bedtime_feeling',
    emoji: '🌙',
    question: 'How was today overall?',
    sub: 'A moment to reflect before you rest',
    options: [
      { label: 'Great', emoji: '😄', desc: 'Productive and fulfilling' },
      { label: 'Good', emoji: '🙂', desc: 'Solid day overall' },
      { label: 'Okay', emoji: '😐', desc: 'Average, could be better' },
      { label: 'Tough', emoji: '😔', desc: 'Hard day, need rest' },
    ],
  },
  {
    id: 'bedtime_sleep_time',
    emoji: '😴',
    question: 'When are you planning to sleep?',
    sub: '7-8 hours is the target for recovery',
    options: [
      { label: 'Before 10PM', emoji: '⭐', desc: 'Excellent — ideal recovery' },
      { label: '10PM–11PM', emoji: '✅', desc: 'Good sleep window' },
      { label: '11PM–12AM', emoji: '⚠️', desc: 'Try to sleep earlier' },
      { label: 'After midnight', emoji: '😬', desc: 'Too late — affects recovery' },
    ],
  },
  {
    id: 'bedtime_tomorrow_intent',
    emoji: '🎯',
    question: "What's your plan for tomorrow?",
    sub: 'Setting intent the night before improves follow-through',
    options: [
      { label: 'Full workout', emoji: '🏋️', desc: "Going all in tomorrow" },
      { label: 'Light only', emoji: '🚶', desc: 'Something light' },
      { label: 'Rest day', emoji: '🛌', desc: 'Taking it easy' },
    ],
  },
]

// ─── DAILY PLANS ─────────────────────────────────────────────────────────────
function getMorningPlan(answers: Record<string, string>, isPro: boolean) {
  const { wake_feeling, day_type, workout_intent, health_modifier } = answers
  if (wake_feeling === 'Sick' || health_modifier === 'Feeling sick' || health_modifier === 'Injured') {
    return { emoji: '🛌', title: 'Rest & Recovery Day', message: "Your body is telling you something — listen to it. Full rest today.", tips: ['💧 Drink at least 2L of water', '🍲 Eat warm nutritious meals', '😴 Sleep early tonight', '🌡️ Monitor how you feel'], color: '#e0eeff', border: '#85B7EB', textColor: '#0C447C' }
  }
  if (day_type === 'Busy') {
    return { emoji: '⚡', title: 'Express Day — 15 Min Max', message: "Busy day detected. We've compressed your plan to 15 minutes.", tips: ['⏱️ 15-min express workout only', '💧 Keep a water bottle nearby', "🥗 Don't skip lunch", '📵 5-min phone-free break'], color: '#fff4e0', border: '#f5d58a', textColor: '#633806' }
  }
  if (day_type === 'Travelling') {
    return { emoji: '✈️', title: 'Travel Mode', message: "On the road today. Switched to hotel room exercises.", tips: ['🏨 Hotel room workout activated', '💧 Drink extra water', '🚶 Walk instead of transport', '😴 Protect your sleep'], color: '#f0e8ff', border: '#b085eb', textColor: '#4a0c7c' }
  }
  if (workout_intent === 'Skip today') {
    return { emoji: '🌿', title: 'Active Rest Day', message: "No workout today — and that's completely fine. Focus on habits.", tips: ['🚶 A short walk counts', '💧 Hit your water goal', '🥗 3 structured meals', '😴 Sleep before midnight'], color: '#e8f5e0', border: '#97C459', textColor: '#27500A' }
  }
  if (day_type === 'WFH') {
    return { emoji: '🏠', title: 'WFH Mode — Move More', message: "Working from home means more sitting. Extra movement reminders activated.", tips: ['🚶 Stand up every hour', '💧 Keep water on your desk', '☀️ Go outside at lunch', '📵 Log off on time'], color: '#e8f5e0', border: '#97C459', textColor: '#27500A' }
  }
  if (day_type === 'Off day') {
    return { emoji: '🌴', title: 'Free Day — Enjoy It!', message: "Day off! Perfect time for something outdoors.", tips: ['🏸 Try an outdoor activity', '☀️ Get some sunlight', '🥗 Cook a proper meal', '😴 Use this day to rest well'], color: '#fff4e0', border: '#f5d58a', textColor: '#633806' }
  }
  if (wake_feeling === 'Tired') {
    return { emoji: '😴', title: 'Low Energy — Easy Does It', message: "You're tired but you showed up. Lighter load today.", tips: ['💧 Drink water before anything', '☀️ Get outside for 10 mins', '🍳 Eat a proper breakfast', '😴 Sleep earlier tonight'], color: '#e0eeff', border: '#85B7EB', textColor: '#0C447C' }
  }
  if (wake_feeling === 'Great') {
    return { emoji: '🔥', title: "You're On Fire Today!", message: "Great energy detected. Push harder — add an extra set, hit all habits.", tips: ['🏋️ Full workout — push harder', '💧 Hit your water goal early', '🥗 Fuel well for the energy', '📈 Log everything today'], color: '#1a1a18', border: '#7db84a', textColor: '#a8c48a' }
  }
  return { emoji: '💪', title: 'Solid Day Ahead', message: "Normal day, normal plan. Stick to your routine.", tips: ['💪 Complete today\'s workout', '💧 Hit your water goal', '✅ Check off your habits', '😴 Sleep before midnight'], color: '#f0f7e8', border: '#c0dd97', textColor: '#3B6D11' }
}

function getMiddayPlan(answers: Record<string, string>) {
  const { midday_feeling, midday_workout_done } = answers
  if (midday_feeling === 'Rough') {
    return { emoji: '🌿', title: 'Hang in there!', message: "Tough morning — but the afternoon is a fresh start. Small wins from here.", tips: ['💧 Drink a full glass of water now', '🚶 5-min walk to reset your head', '🥗 Eat a proper lunch', '📵 Take a 10-min break from screens'], color: '#e0eeff', border: '#85B7EB', textColor: '#0C447C' }
  }
  if (midday_workout_done === 'Not yet') {
    return { emoji: '⏰', title: 'Still Time to Move!', message: "Workout not done yet — there's still time. Even 15 minutes counts.", tips: ['⏱️ 15-min express workout available', '🚶 A lunchtime walk is perfect', '💧 Hydrate before you move', '✅ Log it when done'], color: '#fff4e0', border: '#f5d58a', textColor: '#633806' }
  }
  if (midday_workout_done === 'Yes') {
    return { emoji: '✅', title: 'Workout Done — Killing It!', message: "Workout checked off before noon. Now focus on habits and fuel.", tips: ['🥗 Eat a proper lunch', '💧 Keep hydrating', '☀️ Get some afternoon sunlight', '😴 Protect your sleep tonight'], color: '#e8f5e0', border: '#97C459', textColor: '#27500A' }
  }
  return { emoji: '☀️', title: 'Afternoon Check Complete', message: "Thanks for checking in. Keep the momentum going!", tips: ['💧 Stay hydrated', '🥗 Eat well this afternoon', '💪 Finish strong today', '😴 Sleep before midnight'], color: '#f0f7e8', border: '#c0dd97', textColor: '#3B6D11' }
}

function getBedtimePlan(answers: Record<string, string>) {
  const { bedtime_feeling, bedtime_sleep_time, bedtime_tomorrow_intent } = answers
  if (bedtime_sleep_time === 'After midnight') {
    return { emoji: '😬', title: 'Sleep Earlier Tomorrow', message: "Late night tonight — make sure you prioritise sleep tomorrow. Recovery starts with rest.", tips: ['😴 Put your phone down now', '🌡️ Cool your room down', '📵 No screens in bed', '⏰ Set your alarm for 7-8 hours from now'], color: '#fde8e0', border: '#f0997b', textColor: '#712b13' }
  }
  if (bedtime_feeling === 'Tough') {
    return { emoji: '🌙', title: 'Rest Well Tonight', message: "Tough day — but you made it through. Tomorrow is a fresh start.", tips: ['😴 Sleep before 11PM', '🌿 Tomorrow is a new day', '💧 Drink water before bed', '🎯 Light plan for tomorrow'], color: '#e0eeff', border: '#85B7EB', textColor: '#0C447C' }
  }
  if (bedtime_feeling === 'Great') {
    return { emoji: '⭐', title: 'Excellent Day — Well Done!', message: "You crushed it today. Get good sleep to lock in the gains.", tips: ['😴 Sleep before 10:30PM', '📵 Phone down 30 mins before bed', '🌡️ Keep room cool for deep sleep', `🎯 ${bedtime_tomorrow_intent || 'Full workout'} planned for tomorrow`], color: '#e8f5e0', border: '#97C459', textColor: '#27500A' }
  }
  return { emoji: '🌙', title: 'Good Night!', message: "Good job checking in. Rest well and come back stronger tomorrow.", tips: ['😴 Sleep at a consistent time', '📵 Phone down 30 mins before bed', '💧 Drink water before sleeping', `🎯 ${bedtime_tomorrow_intent || 'Workout'} planned for tomorrow`], color: '#f0f7e8', border: '#c0dd97', textColor: '#3B6D11' }
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function CheckinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = (searchParams.get('type') || 'morning') as 'morning' | 'midday' | 'bedtime'

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isPro, setIsPro] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  useEffect(() => {
    const checkinDate = new Date().toISOString().split('T')[0]
    fetch(`/api/checkin?date=${checkinDate}`)
      .then(r => r.json())
      .then(({ data }) => {
        if (type === 'morning' && data?.wake_feeling) setAlreadyDone(true)
        if (type === 'midday' && data?.midday_feeling) setAlreadyDone(true)
        if (type === 'bedtime' && data?.bedtime_feeling) setAlreadyDone(true)
      })
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ data }) => { if (data?.is_pro) setIsPro(true) })
  }, [type])

  const getQuestions = () => {
    if (type === 'morning') return isPro ? [...morningQuestions, morningProQuestion] : morningQuestions
    if (type === 'midday') return middayQuestions
    return bedtimeQuestions
  }

  const getTitle = () => {
    if (type === 'morning') return { emoji: '🌅', label: 'Morning Check-in' }
    if (type === 'midday') return { emoji: '☀️', label: 'Mid-day Check-in' }
    return { emoji: '🌙', label: 'Bedtime Check-in' }
  }

  const allQuestions = getQuestions()
  const current = allQuestions[step]
  const title = getTitle()

  async function handleAnswer(value: string) {
    const newAnswers = { ...answers, [current.id]: value }
    setAnswers(newAnswers)
    if (step < allQuestions.length - 1) {
      setStep(step + 1)
    } else {
      setSaving(true)
      try {
        await fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newAnswers, type }),
        })
      } catch (_e) {}
      setSaving(false)
      setShowPlan(true)
    }
  }

  const getPlan = () => {
    if (type === 'morning') return getMorningPlan(answers, isPro)
    if (type === 'midday') return getMiddayPlan(answers)
    return getBedtimePlan(answers)
  }

  // Already checked in
  if (alreadyDone) return (
    <main style={{ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 8, textAlign: 'center' }}>
        {title.label} done!
      </div>
      <div style={{ fontSize: 13, color: '#7a7a72', marginBottom: 32, textAlign: 'center', lineHeight: 1.5 }}>
        {type === 'morning' ? 'Come back at midday for your next check-in.' : type === 'midday' ? 'Come back tonight for your bedtime check-in.' : 'See you tomorrow morning!'}
      </div>
      <button onClick={() => router.push('/dashboard')} style={{ padding: '14px 32px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>
        Go to dashboard →
      </button>
    </main>
  )

  // Show plan after check-in
  if (showPlan) {
    const plan = getPlan()
    return (
      <main style={{ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", padding: 'calc(env(safe-area-inset-top) + 40px) 24px 60px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{plan.emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 8, lineHeight: 1.3 }}>{plan.title}</div>
          <div style={{ fontSize: 13, color: '#7a7a72', lineHeight: 1.6, marginBottom: 20 }}>{plan.message}</div>
        </div>

        <div style={{ background: plan.color, border: `1px solid ${plan.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: plan.textColor, marginBottom: 12 }}>Your plan:</div>
          {plan.tips.map((tip, i) => (
            <div key={i} style={{ fontSize: 13, color: plan.textColor, padding: '8px 0', borderBottom: i < plan.tips.length - 1 ? `1px solid ${plan.border}` : 'none', lineHeight: 1.5 }}>{tip}</div>
          ))}
        </div>

        {!isPro && type !== 'bedtime' && (
          <div style={{ background: 'linear-gradient(135deg, #e8f5e0, #f0f7e8)', border: '1px solid #97C459', borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#27500A', marginBottom: 4 }}>✦ Pro unlocks all 3 daily check-ins</div>
            <div style={{ fontSize: 12, color: '#3B6D11', marginBottom: 10, lineHeight: 1.5 }}>Mid-day and bedtime check-ins keep you on track all day long.</div>
            <button onClick={() => router.push('/upgrade')} style={{ padding: '8px 16px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>Upgrade to Pro →</button>
          </div>
        )}

        <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: 16, background: '#1a1a18', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>
          {type === 'bedtime' ? 'Good night 🌙' : "Let's go — open my dashboard →"}
        </button>
      </main>
    )
  }

  // Questions
  return (
    <main style={{ minHeight: '100dvh', background: '#faf8f4', fontFamily: "'DM Sans', Arial, sans-serif", display: 'flex', flexDirection: 'column', padding: '0 0 60px' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 40px) 24px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#4a7c2f', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
          {title.emoji} {title.label}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7a7a72' }}>{step + 1} of {allQuestions.length}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a7c2f' }}>{Math.round(((step + 1) / allQuestions.length) * 100)}%</div>
        </div>
        <div style={{ height: 5, background: '#e4e0d8', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 10, background: '#4a7c2f', width: `${((step + 1) / allQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 24px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{current.emoji}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a18', fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 8, lineHeight: 1.3 }}>{current.question}</div>
        <div style={{ fontSize: 13, color: '#7a7a72', marginBottom: 32, lineHeight: 1.5 }}>{current.sub}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.options.map((option) => (
            <button key={option.label} onClick={() => handleAnswer(option.label)} disabled={saving}
              style={{ width: '100%', padding: '14px 16px', background: 'white', border: '1.5px solid #e4e0d8', borderRadius: 14, cursor: 'pointer', textAlign: 'left' as const, fontFamily: "'DM Sans', Arial, sans-serif", display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24, width: 32, textAlign: 'center' as const }}>{option.emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18' }}>{option.label}</div>
                <div style={{ fontSize: 11, color: '#7a7a72', marginTop: 2 }}>{option.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {step > 0 && (
        <div style={{ padding: '20px 24px 0' }}>
          <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', fontSize: 13, color: '#7a7a72', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif", fontWeight: 600 }}>← Back</button>
        </div>
      )}
    </main>
  )
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100dvh', background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: '#7a7a72', fontFamily: "'DM Sans', Arial, sans-serif" }}>Loading...</div>
      </main>
    }>
      <CheckinContent />
    </Suspense>
  )
}