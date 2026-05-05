import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generatePost(params: {
  topic: string
  snsType: string
  tone: string
  keywords?: string
  additionalInstructions?: string
}): Promise<string> {
  const snsGuide: Record<string, string> = {
    twitter: '140文字以内、ハッシュタグ2〜3個',
    instagram: '絵文字多め、改行を活用、ハッシュタグ5〜10個',
    linkedin: 'プロフェッショナルな文体、段落で区切る',
    facebook: '読みやすい長め文章、親しみやすい口調',
    other: '汎用的なSNS投稿',
  }

  const prompt = `以下の条件でSNS投稿文を1つ作成してください。

SNS: ${params.snsType}（${snsGuide[params.snsType] ?? snsGuide.other}）
トピック: ${params.topic}
トーン: ${params.tone}
${params.keywords ? `キーワード: ${params.keywords}` : ''}
${params.additionalInstructions ? `追加指示: ${params.additionalInstructions}` : ''}

投稿文のみ出力してください。説明文は不要です。`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  })

  return response.choices[0]?.message?.content ?? ''
}

export async function generateIdeas(params: {
  theme: string
  snsType: string
  count: number
}): Promise<Array<{ title: string; description: string }>> {
  const prompt = `SNS投稿のネタを${params.count}件考えてください。

テーマ: ${params.theme}
SNS: ${params.snsType}

以下のJSON形式で出力してください（説明文不要）:
{"ideas": [
  {"title": "ネタのタイトル", "description": "ネタの概要（1〜2文）"},
  ...
]}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content ?? '{}'
  try {
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : (parsed.ideas ?? parsed.items ?? [])
  } catch {
    return []
  }
}
