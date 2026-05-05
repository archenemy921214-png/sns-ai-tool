'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
          className={`relative flex flex-col ${
            plan.badge ? 'border-2 border-emerald-500 shadow-lg' : ''
          }`}
        >
          {plan.badge && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600">
              {plan.badge}
            </Badge>
          )}
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-2">
              <span className="text-3xl font-bold">¥{plan.price.toLocaleString()}</span>
              {plan.price > 0 && <span className="text-gray-500 text-sm">/月</span>}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 gap-4">
            <ul className="space-y-2 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={`w-full mt-4 ${
                plan.badge ? 'bg-emerald-600 hover:bg-emerald-700' : ''
              }`}
              variant={plan.badge ? 'default' : 'outline'}
              onClick={() => handleCheckout(plan.priceId, plan.name)}
              disabled={loading === plan.name}
            >
              {loading === plan.name
                ? '処理中...'
                : plan.price === 0
                ? '無料で始める'
                : 'このプランを選ぶ'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
