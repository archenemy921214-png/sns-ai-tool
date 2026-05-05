'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    description: 'まずはお試しに',
    features: ['AI生成 3回/月', '投稿管理（無制限）', 'ネタ帳', 'カレンダー', 'テンプレート'],
    priceId: null,
    badge: null,
  },
  {
    name: 'Pro',
    price: 980,
    description: 'SNS運用を本格化したい方に',
    features: ['AI生成 無制限', '投稿管理（無制限）', 'ネタ帳', 'カレンダー', 'テンプレート', '優先サポート'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    badge: 'おすすめ',
  },
]

export function PricingClient() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(priceId: string | null | undefined, planName: string) {
    if (!priceId) {
      router.push('/signup')
      return
    }
    setLoading(planName)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      if (res.status === 401) {
        router.push('/signup')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Checkout failed')
      }
      window.location.href = data.url
    } catch (err) {
      console.error('[checkout] error:', err)
      toast.error('チェックアウトの開始に失敗しました')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {PLANS.map((plan) => (
        <Card
          key={plan.name}
          className={plan.badge ? 'ring-2 ring-emerald-500 shadow-lg' : ''}
        >
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{plan.name}</span>
                {plan.badge && (
                  <Badge className="bg-emerald-600 text-white text-xs">{plan.badge}</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">{plan.description}</p>
              <div className="pt-1">
                <span className="text-3xl font-extrabold">¥{plan.price.toLocaleString()}</span>
                {plan.price > 0 && <span className="text-gray-400 text-sm ml-1">/月</span>}
              </div>
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-emerald-500 font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={`w-full ${plan.badge ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              variant={plan.badge ? 'default' : 'outline'}
              onClick={() => handleCheckout(plan.priceId, plan.name)}
              disabled={loading === plan.name}
            >
              {loading === plan.name ? '処理中...' : plan.price === 0 ? '無料で始める' : 'このプランを選ぶ'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
