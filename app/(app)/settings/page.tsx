import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAiUsage, getUserPlan } from '@/lib/ai-usage'
import { SettingsClient } from '@/components/settings/settings-client'
import { PLAN_LIMITS } from '@/types'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>
}) {
  const { checkout } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, subscriptionResult, aiUsage, plan] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    getAiUsage(user.id),
    getUserPlan(user.id),
  ])

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-500 mt-1">プロフィールとサブスクリプションの管理</p>
      </div>
      <SettingsClient
        profile={profileResult.data}
        subscription={subscriptionResult.data}
        email={user.email ?? ''}
        aiUsage={aiUsage}
        plan={plan}
        limit={PLAN_LIMITS[plan]}
        checkoutSuccess={checkout === 'success'}
      />
    </div>
  )
}
