import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { rateLimit, checkRequestSize } from '@/app/lib/rateLimit'
import { checkOrigin } from '@/app/lib/csrf'

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

export async function GET(request: Request) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const { allowed, retryAfter } = rateLimit(ip)
  if (!allowed) return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )

  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('checkin_date', date)
    .single()

  return NextResponse.json({ data: data || null })
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) return NextResponse.json(
    { error: 'Forbidden' }, { status: 403 }
  )
  if (!await checkRequestSize(request)) return NextResponse.json(
    { error: 'Payload too large' }, { status: 413 }
  )
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const { allowed, retryAfter } = rateLimit(ip)
  if (!allowed) return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )

  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const today = new Date().toISOString().split('T')[0]

  const allowed_wake = ['Great', 'Okay', 'Tired', 'Sick']
  const allowed_day = ['Normal', 'Busy', 'WFH', 'Off day', 'Travelling']
  const allowed_workout = ['Full workout', 'Light only', 'Skip today']
  const allowed_modifier = ['All good', 'Feeling sick', 'Injured', 'Stressed out']

  const { data, error } = await supabase
    .from('daily_checkins')
    .upsert({
      user_id: user.id,
      checkin_date: today,
      wake_feeling: allowed_wake.includes(body.wake_feeling) ? body.wake_feeling : null,
      day_type: allowed_day.includes(body.day_type) ? body.day_type : null,
      workout_intent: allowed_workout.includes(body.workout_intent) ? body.workout_intent : null,
      health_modifier: allowed_modifier.includes(body.health_modifier) ? body.health_modifier : null,
    }, { onConflict: 'user_id,checkin_date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}