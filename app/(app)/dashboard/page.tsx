import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAiUsage, getUserPlan } from '@/lib/ai-usage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PLAN_LIMITS } from '@/types'

const DASHBOARD_SUBTITLES = [
  'まずはネタ帳からアイデアを探してみましょう',
  '下書きが溜まっていたら、今日こそ公開してみましょう',
  '一言でも投稿するだけで、存在感は変わります',
  '今日の出来事をそのまま投稿のネタにしてみましょう',
  '短い投稿でも、続けることが一番の戦略です',
  'テンプレートを使えば、投稿作成が一気に楽になります',
  'AIに任せて、あとは投稿ボタンを押すだけです',
  '予約投稿を使えば、忙しい日も発信が止まりません',
  'フォロワーが増えるのは、投稿した日の積み重ねです',
  '今日のひとつの投稿が、明日のつながりを生みます',
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, postsResult, ideasResult, aiUsage, plan] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('posts').select('id, status').eq('user_id', user.id),
    supabase.from('ideas').select('id, used').eq('user_id', user.id),
    getAiUsage(user.id),
    getUserPlan(user.id),
  ])

  const posts = postsResult.data ?? []
  const ideas = ideasResult.data ?? []
  const limit = PLAN_LIMITS[plan]
  const usagePercent = limit === Infinity ? 0 : Math.round((aiUsage / limit) * 100)

  const stats = [
    { label: '総投稿数', value: posts.length, icon: '📝', color: 'text-blue-600' },
    { label: '下書き', value: posts.filter((p) => p.status === 'draft').length, icon: '✏️', color: 'text-yellow-600' },
    { label: '予約済み', value: posts.filter((p) => p.status === 'scheduled').length, icon: '📅', color: 'text-green-600' },
    { label: 'ネタ数', value: ideas.length, icon: '💡', color: 'text-purple-600' },
  ]

  const subtitle = DASHBOARD_SUBTITLES[Math.floor(Math.random() * DASHBOARD_SUBTITLES.length)]

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {profile.data?.display_name ?? 'ユーザー'} さん、今日はどんなネタを投稿しますか？
        </h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            AI生成使用量
            <Badge variant={plan === 'free' ? 'secondary' : 'default'} className="capitalize">
              {plan}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {limit === Infinity ? (
            <p className="text-sm font-medium text-emerald-600">無制限</p>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">今月の残り回数</span>
                <span className={`font-semibold ${limit - aiUsage <= 0 ? 'text-red-500' : 'text-gray-900'}`}>
                  残り {Math.max(limit - aiUsage, 0)} 回 / {limit} 回
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent >= 100 ? 'bg-red-500' : usagePercent >= 66 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              {limit - aiUsage <= 0 ? (
                <Link
                  href="/pricing"
                  className={cn(buttonVariants({ size: 'sm' }), 'bg-emerald-600 hover:bg-emerald-700 mt-1')}
                >
                  Proにアップグレード
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'mt-1')}
                >
                  プランを見る
                </Link>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
          <CardContent className="p-6 flex flex-col items-start gap-3">
            <div className="text-3xl">✏️</div>
            <div>
              <h3 className="font-semibold">新しい投稿を作成</h3>
              <p className="text-sm text-gray-500">AIで投稿文を生成・保存</p>
            </div>
            <Link
              href="/posts/new"
              className={cn(buttonVariants(), 'bg-emerald-600 hover:bg-emerald-700')}
            >
              投稿を作成
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-100 hover:border-amber-300 transition-colors">
          <CardContent className="p-6 flex flex-col items-start gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-semibold">ネタを生成する</h3>
              <p className="text-sm text-gray-500">AIで投稿アイデアをまとめて作成</p>
            </div>
            <Link
              href="/ideas"
              className={cn(buttonVariants({ variant: 'outline' }), 'border-amber-400 text-amber-700 hover:bg-amber-50')}
            >
              ネタ帳へ
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
