import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.user_id ?? null
}

async function upsertSubscription(userId: string, sub: Stripe.Subscription) {
  const supabaseAdmin = getSupabaseAdmin()
  const plan = (sub.items.data[0]?.price.id === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID)
    ? 'business'
    : 'pro'

  await supabaseAdmin.from('subscriptions').update({
    stripe_subscription_id: sub.id,
    plan: sub.status === 'active' || sub.status === 'trialing' ? plan : 'free',
    status: sub.status,
    current_period_end: sub.items.data[0]?.current_period_end
      ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
      const userId = await getUserIdByCustomer(customerId)
      if (userId) await upsertSubscription(userId, sub)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
      const userId = await getUserIdByCustomer(customerId)
      if (userId) {
        await supabaseAdmin.from('subscriptions').update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId)
      }
      break
    }
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
      if (customerId && session.metadata?.supabase_user_id) {
        await supabaseAdmin.from('subscriptions').update({
          stripe_customer_id: customerId,
        }).eq('user_id', session.metadata.supabase_user_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
