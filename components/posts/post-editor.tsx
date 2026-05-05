'use client'

import { useState } from 'react'
import { useInputHistory } from '@/hooks/use-input-history'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Post, type PostStatus, type SnsType, type Tone } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { UpgradeModal } from '@/components/shared/upgrade-modal'

const SNS_OPTIONS: { value: SnsType; label: string; limit: number }[] = [
  { value: 'twitter', label: 'X (Twitter)', limit: 140 },
  { value: 'instagram', label: 'Instagram', limit: 2200 },
  { value: 'threads', label: 'Threads', limit: 500 },
  { value: 'linkedin', label: 'LinkedIn', limit: 3000 },
  { value: 'facebook', label: 'Facebook', limit: 63206 },
  { value: 'other', label: 'その他', limit: 99999 },
]

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'casual', label: 'カジュアル' },
  { value: 'professional', label: 'プロフェッショナル' },
  { value: 'friendly', label: 'フレンドリー' },
  { value: 'formal', label: 'フォーマル' },
  { value: 'humorous', label: 'ユーモラス' },
]

interface PostEditorProps {
  post?: Post
  userId: string
  defaultSnsType?: SnsType
  defaultTone?: Tone
  defaultTopic?: string
}

export function PostEditor({ post, userId, defaultSnsType = 'twitter', defaultTone = 'casual', defaultTopic = '' }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [snsType, setSnsType] = useState<SnsType>(post?.sns_type ?? defaultSnsType)
  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'draft')
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : ''
  )

  const [copied, setCopied] = useState(false)

  const [aiTopic, setAiTopic] = useState(defaultTopic)
  const [aiTone, setAiTone] = useState<Tone>(defaultTone)
  const [aiKeywords, setAiKeywords] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { history: topicHistory, addToHistory: addTopic } = useInputHistory('post-topic')
  const { history: keywordsHistory, addToHistory: addKeywords } = useInputHistory('post-keywords')

  const selectedSns = SNS_OPTIONS.find((s) => s.value === snsType)
  const charCount = content.length
  const overLimit = selectedSns ? charCount > selectedSns.limit : false

  async function handleAiGenerate() {
    if (!aiTopic.trim()) {
      toast.error('トピックを入力してください')
      return
    }
    setAiGenerating(true)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          snsType,
          tone: aiTone,
          keywords: aiKeywords,
        }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setShowUpgrade(true)
        return
      }

      if (!res.ok) {
        toast.error(data.error ?? 'AI生成に失敗しました')
        return
      }

      addTopic(aiTopic)
      if (aiKeywords.trim()) addKeywords(aiKeywords)
      setContent(data.content)
      toast.success(
        data.remaining !== null ? `生成しました（残り${data.remaining}回）` : '生成しました'
      )
    } catch {
      toast.error('ネットワークエラーが発生しました')
    } finally {
      setAiGenerating(false)
    }
  }

  async function handleSave(targetStatus?: PostStatus) {
    if (!content.trim()) {
      toast.error('投稿内容を入力してください')
      return
    }
    setSaving(true)

    const saveStatus = targetStatus ?? status
    const supabase = createClient()

    const payload = {
      user_id: userId,
      title: title || null,
      content,
      sns_type: snsType,
      status: saveStatus,
      scheduled_at: saveStatus === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      tags: [],
      ai_generated: post?.ai_generated ?? content !== post?.content,
      updated_at: new Date().toISOString(),
    }

    let error
    if (post) {
      ;({ error } = await supabase.from('posts').update(payload).eq('id', post.id))
    } else {
      ;({ error } = await supabase.from('posts').insert({ ...payload, ai_generated: false }))
    }

    if (error) {
      console.error('save error:', error)
      toast.error(`保存に失敗しました: ${error.message}`)
      setSaving(false)
      return
    }

    toast.success(saveStatus === 'draft' ? '下書きを保存しました' : '保存しました')
    router.push('/posts')
    router.refresh()
  }

  return (
    <>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">✨ AI投稿文生成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>トピック・テーマ *</Label>
              <Input
                placeholder="例：TypeScriptの型安全性について"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                list="post-topic-history"
              />
              <datalist id="post-topic-history">
                {topicHistory.map((v) => <option key={v} value={v} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>SNS</Label>
                <Select value={snsType} onValueChange={(v) => setSnsType(v as SnsType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SNS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>トーン</Label>
                <Select value={aiTone} onValueChange={(v) => setAiTone(v as Tone)}>
                  <SelectTrigger>
                    <SelectValue>
                      {(value: string | null) => TONE_OPTIONS.find((t) => t.value === value)?.label ?? ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>キーワード（任意）</Label>
              <Input
                placeholder="例：効率化, 生産性, TypeScript"
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                list="post-keywords-history"
              />
              <datalist id="post-keywords-history">
                {keywordsHistory.map((v) => <option key={v} value={v} />)}
              </datalist>
            </div>
            <Button
              onClick={handleAiGenerate}
              disabled={aiGenerating || !aiTopic.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {aiGenerating ? '生成中...' : '✨ AI生成'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">投稿内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>タイトル（任意）</Label>
              <Input
                placeholder="管理用タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label>投稿テキスト *</Label>
                <span className={`text-xs ${overLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {charCount}{selectedSns && selectedSns.limit < 99999 ? ` / ${selectedSns.limit}` : ''}
                </span>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="投稿内容を入力するか、AIで生成してください"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className={overLimit ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const urls: Record<string, string> = {
                        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`,
                        threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(content)}`,
                        linkedin: 'https://www.linkedin.com/feed/?shareActive=true',
                        instagram: 'https://www.instagram.com/',
                        facebook: 'https://www.facebook.com/',
                        other: '',
                      }
                      const url = urls[snsType]
                      if (url) window.open(url, '_blank')
                    }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-gray-100 transition-colors"
                    title="SNSで開く"
                  >
                    <ExternalLink className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(content)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="コピー"
                  >
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label>ステータス</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
                <SelectTrigger>
                  <SelectValue>
                    {(value: string | null) => ({ draft: '下書き', scheduled: '予約済み', published: '公開済み' }[value ?? ''] ?? '')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="scheduled">予約済み</SelectItem>
                  <SelectItem value="published">公開済み</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === 'scheduled' && (
              <div className="space-y-1.5">
                <Label>予約日時</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={saving || !content.trim()}
              >
                下書き保存
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleSave()}
                disabled={saving || !content.trim() || overLimit}
              >
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
