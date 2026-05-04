import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export function getPlanFromPriceId(priceId: string): 'pro' | null {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return 'pro'
  return null
}
