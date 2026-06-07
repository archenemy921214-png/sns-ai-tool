import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLAN_LIMITS, ANALYSIS_LIMITS, type Plan } from '@/types'

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

function getAnalysisPeriod(): string {
  return 'analyze-' + getCurrentPeriod()
}

export async function getAnalysisUsage(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ai_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('period', getAnalysisPeriod())
    .single()
  return data?.count ?? 0
}

export async function checkAndIncrementAnalysis(userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  plan: Plan
}> {
  if (await isOwner(userId)) {
    return { allowed: true, current: 0, limit: Infinity, plan: 'free' }
  }

  const plan = await getUserPlan(userId)
  const limit = ANALYSIS_LIMITS[plan]

  if (limit === Infinity) {
    const supabase = await createClient()
    await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_period: getAnalysisPeriod() })
    const current = await getAnalysisUsage(userId)
    return { allowed: true, current, limit, plan }
  }

  const current = await getAnalysisUsage(userId)
  if (current >= limit) {
    return { allowed: false, current, limit, plan }
  }

  const supabase = await createClient()
  await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_period: getAnalysisPeriod() })
  return { allowed: true, current: current + 1, limit, plan }
}

export async function isOwner(userId: string): Promise<boolean> {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) return false
  const admin = createAdminClient()
  const { data } = await admin.auth.admin.getUserById(userId)
  return data?.user?.email === ownerEmail
}

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  plan: Plan
}> {
  if (await isOwner(userId)) {
    return { allowed: true, current: 0, limit: Infinity, plan: 'free' }
  }

  const plan = await getUserPlan(userId)
  const limit = PLAN_LIMITS[plan]

  if (limit === Infinity) {
    const supabase = await createClient()
    await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_period: getCurrentPeriod() })
    const current = await getAiUsage(userId)
    return { allowed: true, current, limit, plan }
  }

  const current = await getAiUsage(userId)
  if (current >= limit) {
    return { allowed: false, current, limit, plan }
  }

  const supabase = await createClient()
  await supabase.rpc('increment_ai_usage', { p_user_id: userId, p_period: getCurrentPeriod() })
  return { allowed: true, current: current + 1, limit, plan }
}
