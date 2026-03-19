import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'
import { rateLimit } from '@/app/lib/rateLimit'
import { checkOrigin } from '@/app/lib/csrf'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, is_pro')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id || !profile?.is_pro) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 403 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile`,
  })

  return NextResponse.json({ url: session.url })
}