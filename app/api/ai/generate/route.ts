import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePost } from '@/lib/openai'
import { checkAndIncrementUsage } from '@/lib/ai-usage'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { allowed, current, limit, plan } = await checkAndIncrementUsage(user.id)

  if (!allowed) {
    return NextResponse.json(
      {
        error: `AI生成の上限（${limit}回/月）に達しました。プランをアップグレードしてください。`,
        current,
        limit,
        plan,
      },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { topic, snsType, tone, keywords, additionalInstructions } = body

  if (!topic || !snsType || !tone) {
    return NextResponse.json({ error: 'topic, snsType, tone は必須です' }, { status: 400 })
  }

  try {
    const content = await generatePost({ topic, snsType, tone, keywords, additionalInstructions })
    return NextResponse.json({ content, remaining: limit === Infinity ? null : limit - current - 1 })
  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json({ error: 'AI生成に失敗しました' }, { status: 500 })
  }
}
