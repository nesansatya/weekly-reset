import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await supabase.from('users').update({
          is_pro: true,
          stripe_subscription_id: sub.id,
          subscription_status: 'pro',
          subscription_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        }).eq('id', userId)
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if ('metadata' in customer && customer.metadata.supabase_user_id) {
        const isPro = sub.status === 'active'
        await supabase.from('users').update({
          is_pro: isPro,
          subscription_status: isPro ? 'pro' : 'free',
          subscription_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        }).eq('id', customer.metadata.supabase_user_id)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if ('metadata' in customer && customer.metadata.supabase_user_id) {
        await supabase.from('users').update({
          is_pro: false,
          subscription_status: 'free',
          stripe_subscription_id: null,
          subscription_period_end: null,
        }).eq('id', customer.metadata.supabase_user_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
