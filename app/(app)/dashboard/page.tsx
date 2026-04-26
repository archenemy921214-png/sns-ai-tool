import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAiUsage, getUserPlan } from '@/lib/ai-usage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PLAN_LIMITS } from '@/types'

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

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          おかえりなさい、{profile.data?.display_name ?? 'ユーザー'} さん
        </h1>
        <p className="text-gray-500 mt-1">今日も投稿を管理しましょう</p>
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
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">今月の使用回数</span>
            <span className="font-medium">
              {aiUsage} / {limit === Infinity ? '無制限' : limit} 回
            </span>
          </div>
          {limit !== Infinity && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-violet-500'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          )}
          {plan === 'free' && (
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'mt-2')}
            >
              プランをアップグレード
            </Link>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-violet-100 hover:border-violet-300 transition-colors">
          <CardContent className="p-6 flex flex-col items-start gap-3">
            <div className="text-3xl">✏️</div>
            <div>
              <h3 className="font-semibold">新しい投稿を作成</h3>
              <p className="text-sm text-gray-500">AIで投稿文を生成・保存</p>
            </div>
            <Link
              href="/posts/new"
              className={cn(buttonVariants(), 'bg-violet-600 hover:bg-violet-700')}
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
