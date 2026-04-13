import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

async function makeClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cs: any[]) { cs.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options)) }
      }
    }
  )
}

export async function POST(request: Request) {
  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const allowed = [
    'age_range', 'fitness_level', 'workout_days_per_week',
    'sleep_quality', 'health_challenge', 'work_schedule',
    'body_feeling', 'eating_habits', 'water_intake', 'stress_level',
    'goal', // mapped from health_challenge for dashboard use
  ]

  const updates: Record<string, string | number> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  // Auto-derive goal from health_challenge so both fields stay in sync
  if (body.health_challenge && !body.goal) {
    const goalMap: Record<string, string> = {
      'Low energy': 'More energy',
      'Poor sleep': 'Better sleep',
      'Stress & anxiety': 'More energy',
      'Weight management': 'Lose weight',
      'Building consistency': 'Build habits',
    }
    const derived = goalMap[body.health_challenge]
    if (derived) updates['goal'] = derived
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
