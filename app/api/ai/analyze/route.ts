import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzePost } from '@/lib/openai'
import { checkAndIncrementAnalysis } from '@/lib/ai-usage'
import { ANALYSIS_LIMITS } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { allowed, current, limit, plan } = await checkAndIncrementAnalysis(user.id, user.email ?? "")

  if (!allowed) {
    return NextResponse.json(
      {
        error: `分析の上限（月${ANALYSIS_LIMITS.free}回）に達しました。プランをアップグレードしてください。`,
        current,
        limit,
        plan,
      },
      { status: 429 }
    )
  }

  let body: {
    platform?: string
    genre?: string
    goal?: string
    targetAudience?: string
    originalPost?: string
    notes?: string
    imageUrls?: string[]
    insightImageUrls?: string[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 })
  }

  const { platform, genre, goal, targetAudience, originalPost, notes, imageUrls, insightImageUrls } = body

  if (!originalPost?.trim()) {
    return NextResponse.json({ error: '投稿本文を入力してください' }, { status: 400 })
  }
  if (!platform || !genre || !goal) {
    return NextResponse.json({ error: '媒体・ジャンル・目的は必須です' }, { status: 400 })
  }

  let result
  try {
    result = await analyzePost({
      platform,
      genre,
      goal,
      targetAudience: targetAudience ?? '',
      originalPost,
      notes,
      imageUrls,
      insightImageUrls,
    })
  } catch (err) {
    console.error('AI analyze error:', err)
    return NextResponse.json({ error: 'AI分析に失敗しました。しばらくしてから再度お試しください。' }, { status: 500 })
  }

  const { data: saved, error: dbError } = await supabase
    .from('sns_analyses')
    .insert({
      user_id: user.id,
      platform,
      genre,
      goal,
      target_audience: targetAudience ?? '',
      original_post: originalPost,
      notes: notes ?? null,
      image_urls: imageUrls ?? [],
      insight_image_urls: insightImageUrls ?? [],
      result,
      overall_score: result.overallScore ?? 0,
    })
    .select('id')
    .single()

  if (dbError) {
    console.error('DB save error:', dbError)
  }

  const remaining = limit === Infinity ? null : Math.max(limit - current, 0)
  return NextResponse.json({ result, id: saved?.id ?? null, remaining })
}
