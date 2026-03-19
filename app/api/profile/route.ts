import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { rateLimit } from '@/app/lib/rateLimit'
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
    .select('weight_kg, full_name, is_pro, subscription_status, subscription_period_end')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) return NextResponse.json(
    { error: 'Forbidden' }, { status: 403 }
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

  const { data, error } = await supabase
    .from('users')
    .update({ weight_kg: weight })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}