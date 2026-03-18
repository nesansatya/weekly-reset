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

export async function GET(request: Request) {
  const supabase = await makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '1month'

  const days = period === '3months' ? 90 : 30
  const from = new Date()
  from.setDate(from.getDate() - days)
  const fromStr = from.toISOString().split('T')[0]

  const [dailyLogs, habitLogs] = await Promise.all([
    supabase.from('daily_logs').select('*').eq('user_id', user.id).gte('log_date', fromStr).order('log_date'),
    supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('log_date', fromStr).order('log_date'),
  ])

  return NextResponse.json({
    data: {
      dailyLogs: dailyLogs.data || [],
      habitLogs: habitLogs.data || [],
    }
  })
}