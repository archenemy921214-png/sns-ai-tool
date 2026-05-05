import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAiUsage, getUserPlan } from '@/lib/ai-usage'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PLAN_LIMITS } from '@/types'

const SUBTITLES = [
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

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const unique = [...new Set(dates.map((d) => d.slice(0, 10)))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  if (unique[0] !== today) return 0
  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1])
    const curr = new Date(unique[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, postsResult, ideasResult, aiUsage, plan] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', user.id).single(),
    supabase.from('posts').select('id, status, created_at').eq('user_id', user.id),
    supabase.from('ideas').select('id, used').eq('user_id', user.id),
    getAiUsage(user.id),
    getUserPlan(user.id),
  ])

  const posts = postsResult.data ?? []
  const ideas = ideasResult.data ?? []
  const limit = PLAN_LIMITS[plan]
  const usagePercent = limit === Infinity ? 0 : Math.round((aiUsage / limit) * 100)
  const remaining = limit === Infinity ? null : Math.max(limit - aiUsage, 0)

  const today = new Date().toISOString().slice(0, 10)
  const monthPrefix = today.slice(0, 7)
  const todayCount = posts.filter((p) => p.created_at?.slice(0, 10) === today).length
  const monthCount = posts.filter((p) => p.created_at?.slice(0, 7) === monthPrefix).length
  const streak = calcStreak(posts.map((p) => p.created_at ?? ''))

  const draftCount = posts.filter((p) => p.status === 'draft').length
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length
  const unusedIdeas = ideas.filter((i) => !i.used).length

  const subtitle = SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]
  const name = profile.data?.display_name ?? 'ユーザー'

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-2xl pb-24">

      {/* ① ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{name} さん、今日は何を投稿する？</h1>
        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
      </div>

      {/* ② メインCTA + ③ サブCTA */}
      <div className="flex flex-col gap-3">
        <Link
          href="/posts/new"
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-bold text-base py-4 shadow-md shadow-emerald-100"
        >
          ✨ ランダムで投稿を作る
        </Link>
        <Link
          href="/ideas"
          className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all font-semibold text-base py-3.5"
        >
          💡 ネタを選んで作る
        </Link>
      </div>

      {/* ④ KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '今日の投稿', value: todayCount, unit: '件', icon: '📅', color: 'text-emerald-600' },
          { label: '今月投稿数', value: monthCount, unit: '件', icon: '📊', color: 'text-blue-600' },
          { label: '連続日数', value: streak, unit: '日', icon: '🔥', color: 'text-orange-500' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 text-center">
              <div className="text-xl mb-1">{kpi.icon}</div>
              <div className={`text-2xl font-extrabold ${kpi.color}`}>
                {kpi.value}<span className="text-sm font-medium text-gray-400 ml-0.5">{kpi.unit}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ⑤ 管理カード */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '下書き', value: draftCount, icon: '✏️', href: '/posts?status=draft', color: 'text-yellow-600' },
          { label: 'ネタ', value: unusedIdeas, icon: '💡', href: '/ideas', color: 'text-purple-600' },
          { label: '予約', value: scheduledCount, icon: '📅', href: '/posts?status=scheduled', color: 'text-blue-600' },
          { label: '投稿一覧', value: posts.length, icon: '📝', href: '/posts', color: 'text-gray-600' },
        ].map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow active:scale-95">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <div className="text-xs text-gray-400">{card.label}</div>
                  <div className={`text-xl font-bold ${card.color}`}>{card.value}<span className="text-xs font-normal text-gray-400 ml-0.5">件</span></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ⑥ 課金導線 */}
      <Card className={remaining === 0 ? 'border-red-200 bg-red-50' : ''}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">AI生成</span>
            <Badge variant={plan === 'free' ? 'secondary' : 'default'} className="capitalize text-xs">
              {plan}
            </Badge>
          </div>
          {limit === Infinity ? (
            <p className="text-sm font-medium text-emerald-600">無制限プラン ✓</p>
          ) : (
            <>
              <div className="flex justify-between text-xs text-gray-500">
                <span>今月の残り</span>
                <span className={`font-semibold ${remaining === 0 ? 'text-red-500' : 'text-gray-800'}`}>
                  {remaining} / {limit} 回
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent >= 100 ? 'bg-red-400' : usagePercent >= 66 ? 'bg-yellow-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  remaining === 0
                    ? 'w-full bg-red-500 hover:bg-red-600'
                    : 'w-full bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {remaining === 0 ? '🚀 Proにアップグレード' : 'プランを見る'}
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
