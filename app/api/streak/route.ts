import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { rateLimit } from '@/app/lib/rateLimit'

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
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ data: null })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
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
  const habitsCompleted = parseInt(body.habitsCompleted) || 0
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let currentStreak = 1
  let longestStreak = 1
  let totalActiveDays = 1

  if (existing) {
    totalActiveDays = (existing.total_active_days || 0) + 1
    longestStreak = existing.longest_streak || 1

    if (existing.last_active_date === today) {
      return NextResponse.json({ data: existing })
    } else if (existing.last_active_date === yesterdayStr) {
      currentStreak = (existing.current_streak || 0) + 1
    } else {
      currentStreak = 1
    }

    longestStreak = Math.max(longestStreak, currentStreak)
  }

  const { data, error } = await supabase
    .from('streaks')
    .upsert({
      user_id: user.id,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_active_days: totalActiveDays,
      last_active_date: today,
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}