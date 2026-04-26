import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, type Plan } from '@/types'

export function getCurrentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function getAiUsage(userId: string): Promise<number> {
  const supabase = await createClient()
  const period = getCurrentPeriod()

  const { data } = await supabase
    .from('ai_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('period', period)
    .single()

  return data?.count ?? 0
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', userId)
    .single()

  if (!data) return 'free'
  if (data.status !== 'active' && data.status !== 'trialing') return 'free'
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) return 'free'

  return (data.plan as Plan) ?? 'free'
}

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  plan: Plan
}> {
  // TODO: テスト用に制限を無効化中
  return { allowed: true, current: 0, limit: Infinity, plan: 'free' }
}
