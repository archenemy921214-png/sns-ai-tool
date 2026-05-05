import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PricingClient } from '@/components/pricing/pricing-client'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-100">
      <nav className="flex items-center justify-between px-8 py-4 border-b bg-white/70 backdrop-blur">
        <Link href="/" className="text-xl font-bold text-emerald-600">Postly</Link>
        <div className="flex gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            ログイン
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'sm' }), 'bg-emerald-600 hover:bg-emerald-700')}
          >
            無料で始める
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">シンプルな料金プラン</h1>
          <p className="text-gray-600">すべてのプランで主要機能を利用できます</p>
        </div>
        <PricingClient />
      </div>
    </div>
  )
}
