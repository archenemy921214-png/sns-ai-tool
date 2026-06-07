import OpenAI from 'openai'
import type { AnalysisResult } from '@/types'

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

  const humanRule = `【必須ルール：人間らしい文章にすること】
①敬体→常体に統一する
「です」「ます」を全部取る。〜です→〜だ、〜ます→〜る／〜ない、〜でしょう→〜だろう／切り捨てる。

②接続詞を切るか消す
残していい接続詞：でも／だから／だって
消す接続詞：「なぜなら〜から」→「〜から。」で切る、「さらに」「また」「加えて」「このように」「つまり」→削除

③二文を一文に圧縮する
「〜という特徴があります。だから〜できます。」→「〜だから〜できる。」
「それが〜です。〜という意味です。」→「〜だ。」

④文末のバリエーションを増やす
体言止め・疑問形・余韻止め・短文ぶつ切りを混ぜる。「だ」「する」だけに偏らない。

⑤副詞と強調語を抜く
実は／非常に／大変／とても／圧倒的に／特に → 全部削除。残すのは「まじで」「普通に」レベルの口語のみ。`

  const prompt = `以下の条件でSNS投稿文を1つ作成してください。

SNS: ${params.snsType}（${snsGuide[params.snsType] ?? snsGuide.other}）
トピック: ${params.topic}
トーン: ${params.tone}
${params.keywords ? `キーワード: ${params.keywords}` : ''}
${params.additionalInstructions ? `追加指示: ${params.additionalInstructions}` : ''}

${humanRule}

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

export async function analyzePost(params: {
  platform: string
  genre: string
  goal: string
  targetAudience: string
  originalPost: string
  notes?: string
  imageUrls?: string[]
  insightImageUrls?: string[]
}): Promise<AnalysisResult> {
  const systemPrompt = `あなたはSNS運用コンサルタントです。
目的は単にバズらせることではなく、フォロワー増加・保存数・コメント・LINE登録・無料相談・セミナー集客・商品購入につながる改善提案をすることです。

以下を特に重視してください：
- 1行目の強さ（フック）
- 読者の悩みとの一致
- 共感性
- 保存したくなる情報量
- 売り込み感の少なさ
- CTAの自然さ
- プロフィール遷移につながるか
- LINE登録や相談につながるか
- 投稿者本人の言葉らしさ（AIっぽさを減らすこと）

改善後の投稿文は、元の投稿者の口調を保ちつつ自然に改善してください。AIっぽい文体は絶対に避けてください。

必ず以下のJSON形式のみで出力してください（説明文不要）：
{
  "overallScore": 数値(0-100),
  "scores": {
    "hook": 数値(0-100),
    "empathy": 数値(0-100),
    "savePotential": 数値(0-100),
    "leadNaturalness": 数値(0-100),
    "ctaStrength": 数値(0-100),
    "platformFit": 数値(0-100),
    "monetization": 数値(0-100)
  },
  "goodPoints": ["良い点1", "良い点2", "良い点3"],
  "weakPoints": ["弱い点1", "弱い点2", "弱い点3"],
  "reasonNotPerforming": "伸びなかった理由の具体的な説明",
  "monetizationIssues": "売上・登録につながらない原因の説明",
  "improvedPost": "改善後の投稿文（自然な文体で）",
  "nextPostIdeas": [
    {"title": "テーマ名", "purpose": "狙い", "target": "想定ターゲット", "angle": "投稿の切り口", "cta": "CTA"},
    {"title": "テーマ名", "purpose": "狙い", "target": "想定ターゲット", "angle": "投稿の切り口", "cta": "CTA"},
    {"title": "テーマ名", "purpose": "狙い", "target": "想定ターゲット", "angle": "投稿の切り口", "cta": "CTA"}
  ],
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2", ...],
  "ctaIdeas": ["CTA案1", "CTA案2", "CTA案3"]
}`

  const userPrompt = `投稿媒体: ${params.platform}
投稿ジャンル: ${params.genre}
投稿目的: ${params.goal}
ターゲット: ${params.targetAudience || '未指定'}

【投稿本文】
${params.originalPost}

【補足情報】
${params.notes || 'なし'}${params.insightImageUrls?.length ? '\n\n※インサイト画像がアップロードされています。画像内のリーチ・保存数・いいね数・コメント数・プロフィールアクセス数などの数値も分析に活用してください。' : ''}`

  type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail: 'high' | 'low' | 'auto' } }

  const contentParts: ContentPart[] = [{ type: 'text', text: userPrompt }]

  const allImageUrls = [...(params.imageUrls ?? []), ...(params.insightImageUrls ?? [])]
  for (const url of allImageUrls) {
    contentParts.push({ type: 'image_url', image_url: { url, detail: 'high' } })
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contentParts },
    ],
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw) as AnalysisResult
  return parsed
}
