import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-indigo-100 px-4">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
          ✨ AIがSNS運用を変える
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">Postly</h1>
        <p className="text-xl text-gray-600">
          AIでネタ出し・投稿文生成・カレンダー管理まで。SNS運用を10倍効率化する投稿管理ツール。
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-emerald-600 hover:bg-emerald-700')}
          >
            無料で始める
          </Link>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
          >
            料金を見る
          </Link>
        </div>
        <div className="flex gap-8 justify-center text-sm text-gray-500 pt-4">
          <span>✓ 無料プランあり</span>
          <span>✓ クレジットカード不要</span>
          <span>✓ いつでもキャンセル可</span>
        </div>
      </div>
    </main>
  )
}
