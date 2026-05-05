import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAiUsage, getUserPlan } from '@/lib/ai-usage'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PLAN_LIMITS } from '@/types'
import { DashboardCTA } from '@/components/dashboard/dashboard-cta'

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const unique = [...new Set(dates.map((d) => d.slice(0, 10)))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  if (unique[0] !== today) return 0
  let streak = 1
  for (let i = 1; i < unique.length; i++) {
    const diff = (new Date(unique[i - 1]).getTime() - new Date(unique[i]).getTime()) / 86400000
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
  const overLimit = remaining === 0

  const today = new Date().toISOString().slice(0, 10)
  const monthPrefix = today.slice(0, 7)
  const todayCount = posts.filter((p) => p.created_at?.slice(0, 10) === today).length
  const monthCount = posts.filter((p) => p.created_at?.slice(0, 7) === monthPrefix).length
  const streak = calcStreak(posts.map((p) => p.created_at ?? ''))

  const draftCount = posts.filter((p) => p.status === 'draft').length
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length
  const unusedIdeas = ideas.filter((i) => !i.used).length

  // KPI 目標（固定値、将来的に設定画面へ）
  const GOAL_TODAY = 1
  const GOAL_MONTH = 20
  const GOAL_STREAK = 7

  const kpis = [
    { label: '今日', value: todayCount, goal: GOAL_TODAY, unit: '件', icon: '📅', color: 'text-emerald-600', barColor: 'bg-emerald-400' },
    { label: '今月', value: monthCount, goal: GOAL_MONTH, unit: '件', icon: '📊', color: 'text-blue-600', barColor: 'bg-blue-400' },
    { label: '連続', value: streak, goal: GOAL_STREAK, unit: '日', icon: '🔥', color: 'text-orange-500', barColor: 'bg-orange-400' },
  ]

  const managementCards = [
    { label: '下書き', value: draftCount, icon: '✏️', href: '/posts?status=draft', action: '続きを書く', color: 'text-yellow-600' },
    { label: 'ネタ', value: unusedIdeas, icon: '💡', href: '/ideas', action: 'ネタを探す', color: 'text-purple-600' },
    { label: '予約', value: scheduledCount, icon: '📅', href: '/posts?status=scheduled', action: '予定を確認', color: 'text-blue-600' },
    { label: '投稿', value: posts.length, icon: '📝', href: '/posts', action: '一覧を見る', color: 'text-gray-600' },
  ]

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-2xl pb-24">

      {/* ① ヘッダー */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">
          今日の一投稿、<br className="md:hidden" />始めよう。
        </h1>
      </div>

      {/* ② ③ CTA */}
      <DashboardCTA />

      {/* ④ KPI */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((kpi) => {
          const pct = Math.min((kpi.value / kpi.goal) * 100, 100)
          const achieved = kpi.value >= kpi.goal
          return (
            <Card key={kpi.label} className={achieved ? 'ring-2 ring-emerald-300' : ''}>
              <CardContent className="p-3 text-center space-y-2">
                <div className="text-lg">{kpi.icon}</div>
                <div>
                  <span className={`text-xl font-extrabold ${kpi.color}`}>{kpi.value}</span>
                  <span className="text-xs text-gray-400">/{kpi.goal}{kpi.unit}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${kpi.barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-gray-400">{kpi.label}{achieved ? ' ✓' : ''}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ⑤ 管理カード */}
      <div className="grid grid-cols-2 gap-3">
        {managementCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow active:scale-95">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">{card.label}</div>
                  <div className={`text-xl font-bold ${card.color}`}>
                    {card.value}<span className="text-xs font-normal text-gray-400 ml-0.5">件</span>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mt-0.5">{card.action} →</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ⑥ 課金導線 */}
      {plan === 'free' && (
        <div className={cn(
          'rounded-2xl p-4 space-y-3',
          overLimit ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-bold text-sm ${overLimit ? 'text-red-700' : 'text-emerald-800'}`}>
                {overLimit ? '⚠️ AI生成の上限に達しました' : '✨ AI生成'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                今月 {aiUsage} / {limit} 回使用
              </p>
            </div>
            <span className="text-2xl">{overLimit ? '🔒' : '🤖'}</span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overLimit ? 'bg-red-400' : usagePercent >= 66 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants(),
              'w-full',
              overLimit ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            {overLimit ? '🚀 Proにアップグレードして続ける' : 'Proプランを見る — 制限なし'}
          </Link>
        </div>
      )}
      {plan !== 'free' && (
        <p className="text-xs text-center text-gray-300">AI生成: 無制限プラン ✓</p>
      )}
    </div>
  )
}
