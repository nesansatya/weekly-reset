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

function sanitizeWeight(value: unknown): number | null {
  const num = parseFloat(String(value))
  if (isNaN(num) || num <= 0 || num > 300) return null
  return Math.round(num * 10) / 10
}

export async function GET() {
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

  const { data, error } = await supabase
    .from('users')
    .select('weight_kg, full_name, is_pro, subscription_status, subscription_period_end, religion, age_range, fitness_level, workout_days_per_week, sleep_quality, health_challenge, work_schedule, body_feeling, eating_habits, water_intake, stress_level, if_mode_enabled, if_protocol, if_fast_start_time, if_custom_fast_hours')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
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

  // Sanitize weight input on backend
  const weight = sanitizeWeight(body.weight_kg)
  if (weight === null) return NextResponse.json(
    { error: 'Invalid weight value' },
    { status: 400 }
  )

  // Sanitize religion input
  const allowedReligions = ['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Others', 'Prefer not to say']
  const religion = allowedReligions.includes(body.religion) ? body.religion : null

  // IF Mode settings
  const ifUpdate: Record<string, any> = {}
  if (typeof body.if_mode_enabled === 'boolean') ifUpdate.if_mode_enabled = body.if_mode_enabled
  if (body.if_protocol) ifUpdate.if_protocol = body.if_protocol
  if (body.if_fast_start_time) ifUpdate.if_fast_start_time = body.if_fast_start_time
  if (body.if_custom_fast_hours) ifUpdate.if_custom_fast_hours = body.if_custom_fast_hours

  const { data, error } = await supabase
    .from('users')
    .update({ weight_kg: weight, ...(religion && { religion }), ...ifUpdate })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}