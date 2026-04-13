import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { checkOrigin } from '@/app/lib/csrf'
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

export async function POST(request: Request) {
  if (!checkOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

  // Soft delete — flag the user record with deletion timestamp
  // Data will be purged after 30 days by a scheduled Supabase function
  const deletionDate = new Date()
  deletionDate.setDate(deletionDate.getDate() + 30)

  const { error } = await supabase
    .from('users')
    .update({
      deleted_at: new Date().toISOString(),
      deletion_scheduled_for: deletionDate.toISOString(),
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
