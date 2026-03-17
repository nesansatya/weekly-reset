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
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert({
      user_id: user.id,
      log_date: today,
      checked_habits: body.checkedHabits,
    }, { onConflict: 'user_id,log_date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}