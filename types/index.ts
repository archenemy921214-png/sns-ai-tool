export type Plan = 'free' | 'pro'
export type PostStatus = 'draft' | 'scheduled' | 'published'
export type SnsType = 'twitter' | 'instagram' | 'threads' | 'linkedin' | 'facebook' | 'other'
export type Tone = 'formal' | 'casual' | 'friendly' | 'professional' | 'humorous'

export interface Profile {
  id: string
  display_name: string | null
  sns_type: SnsType[]
  bio: string | null
  tone: Tone | null
  onboarded: boolean
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  title: string | null
  content: string
  sns_type: SnsType | null
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
  tags: string[]
  ai_generated: boolean
  created_at: string
  updated_at: string
}

export interface Idea {
  id: string
  user_id: string
  title: string
  description: string | null
  tags: string[]
  used: boolean
  created_at: string
}

export interface Template {
  id: string
  user_id: string
  name: string
  content: string
  sns_type: SnsType | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: Plan
  status: string | null
  current_period_end: string | null
}

export interface AiUsage {
  id: string
  user_id: string
  period: string
  count: number
}

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 3,
  pro: Infinity,
}

export const PLAN_PRICES = {
  pro: { label: 'Pro', price: 980, description: 'AI生成無制限/月' },
}

// SNS分析アシスタント
export interface AnalysisScores {
  hook: number
  empathy: number
  savePotential: number
  leadNaturalness: number
  ctaStrength: number
  platformFit: number
  monetization: number
}

export interface NextPostIdea {
  title: string
  purpose: string
  target: string
  angle: string
  cta: string
}

export interface AnalysisResult {
  overallScore: number
  scores: AnalysisScores
  goodPoints: string[]
  weakPoints: string[]
  reasonNotPerforming: string
  monetizationIssues: string
  improvedPost: string
  nextPostIdeas: NextPostIdea[]
  hashtags: string[]
  ctaIdeas: string[]
}

export interface SnsAnalysis {
  id: string
  user_id: string
  platform: string
  genre: string
  goal: string
  target_audience: string
  original_post: string
  notes: string | null
  image_urls: string[]
  insight_image_urls: string[]
  result: AnalysisResult
  overall_score: number
  created_at: string
}

export const ANALYSIS_LIMITS: Record<Plan, number> = {
  free: 3,
  pro: Infinity,
}
