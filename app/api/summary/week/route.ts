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

export async function GET() {
  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date()
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - dow)
  const mondayStr = monday.toISOString().split('T')[0]

  const [dailyLogs, exerciseLogs, habitLogs] = await Promise.all([
    supabase.from('daily_logs').select('*').eq('user_id', user.id).gte('log_date', mondayStr),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).gte('log_date', mondayStr),
    supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('log_date', mondayStr),
  ])

  return NextResponse.json({
    data: {
      dailyLogs: dailyLogs.data || [],
      exerciseLogs: exerciseLogs.data || [],
      habitLogs: habitLogs.data || [],
    }
  })
}