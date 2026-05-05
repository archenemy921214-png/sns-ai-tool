import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          AIでSNS投稿を効率化
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          SNS投稿をAIでかんたん作成
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          SNS AI Toolは、Instagram・Threads・XなどのSNS投稿文をAIで作成できるWebサービスです。
          テーマを入力するだけで、投稿文のアイデアや本文を生成できます。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-blue-600 hover:bg-blue-700 text-base px-8')}
          >
            無料で始める
          </Link>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'text-base px-8')}
          >
            料金を見る
          </Link>
        </div>
        <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500 pt-2">
          <span>✓ 無料プランあり</span>
          <span>✓ クレジットカード不要で開始</span>
          <span>✓ いつでも解約可能</span>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '✨',
                title: 'SNS投稿文のAI生成',
                desc: 'テーマとSNSを選ぶだけで、最適な投稿文をAIが自動生成します。',
              },
              {
                icon: '📝',
                title: '投稿テーマに応じた文章作成',
                desc: 'カジュアル・プロフェッショナルなど、トーンを指定して文章を生成できます。',
              },
              {
                icon: '💡',
                title: '生成履歴の確認',
                desc: '過去に生成した投稿文やネタをいつでも確認・再利用できます。',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">料金プラン</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="border rounded-xl p-6 space-y-3">
            <p className="font-bold text-lg">無料プラン</p>
            <p className="text-3xl font-extrabold">¥0</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ AI生成 月3回まで</li>
              <li>✓ 投稿管理</li>
              <li>✓ ネタ帳・カレンダー</li>
            </ul>
            <Link href="/signup" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
              無料で始める
            </Link>
          </div>
          <div className="border-2 border-blue-500 rounded-xl p-6 space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg">有料プラン</p>
              <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">おすすめ</span>
            </div>
            <p className="text-3xl font-extrabold">¥980<span className="text-sm font-normal text-gray-400 ml-1">/月</span></p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ AI生成 無制限</li>
              <li>✓ 投稿管理</li>
              <li>✓ ネタ帳・カレンダー</li>
              <li>✓ 優先サポート</li>
            </ul>
            <Link href="/pricing" className={cn(buttonVariants(), 'w-full bg-blue-600 hover:bg-blue-700')}>
              このプランを選ぶ
            </Link>
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/legal/tokusho" className="underline hover:text-gray-600">特定商取引法に基づく表記</Link>
          　|
          <Link href="/legal/terms" className="underline hover:text-gray-600">利用規約</Link>
          　|
          <Link href="/legal/privacy" className="underline hover:text-gray-600">プライバシーポリシー</Link>
        </p>
      </section>

      <PublicFooter />
    </div>
  )
}
