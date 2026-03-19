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
  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const today = new Date().toISOString().split('T')[0]

  const { data: current } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yk = yesterday.toISOString().split('T')[0]

  let newStreak = 1
  if (current.last_active_date === today) {
    newStreak = current.current_streak
  } else if (current.last_active_date === yk) {
    newStreak = current.current_streak + 1
  }

  const { data, error } = await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(current.longest_streak, newStreak),
      last_active_date: today,
      total_active_days: current.last_active_date !== today ? current.total_active_days + 1 : current.total_active_days,
      total_habits_completed: current.total_habits_completed + (body.habitsCompleted || 0),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}