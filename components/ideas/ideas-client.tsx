'use client'

import { useState } from 'react'
import { useInputHistory } from '@/hooks/use-input-history'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Idea, type SnsType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { toast } from 'sonner'
import { UpgradeModal } from '@/components/shared/upgrade-modal'

const SNS_OPTIONS: { value: SnsType; label: string }[] = [
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'threads', label: 'Threads' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'other', label: 'その他' },
]

export function IdeasClient({
  ideas: initialIdeas,
  userId,
  defaultSnsType,
}: {
  ideas: Idea[]
  userId: string
  defaultSnsType: SnsType
}) {
  const router = useRouter()
  const [ideas, setIdeas] = useState(initialIdeas)
  const [theme, setTheme] = useState('')
  const [snsType, setSnsType] = useState<SnsType>(defaultSnsType)
  const [count, setCount] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { history: themeHistory, addToHistory: addTheme } = useInputHistory('ideas-theme')

  async function handleGenerate() {
    if (!theme.trim()) {
      toast.error('テーマを入力してください')
      return
    }
    setGenerating(true)

    try {
      const res = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, snsType, count }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setShowUpgrade(true)
        return
      }

      if (!res.ok) {
        toast.error(data.error ?? 'ネタ生成に失敗しました')
        return
      }

      addTheme(theme)
      toast.success(`${data.ideas.length}件のネタを生成しました`)
      router.refresh()
      setIdeas((prev) => [...data.ideas.map((idea: Idea) => ({ ...idea, user_id: userId })), ...prev])
    } catch {
      toast.error('ネットワークエラーが発生しました')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('ideas').delete().eq('id', id)
    setIdeas((prev) => prev.filter((i) => i.id !== id))
    toast.success('削除しました')
  }

  async function handleMarkUsed(id: string, used: boolean) {
    const supabase = createClient()
    await supabase.from('ideas').update({ used: !used }).eq('id', id)
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, used: !used } : i)))
  }

  return (
    <>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700">✨ AI ネタ生成</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1 space-y-1.5">
              <Label>テーマ *</Label>
              <Input
                placeholder="例：ITエンジニアの日常"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                list="ideas-theme-history"
              />
              <datalist id="ideas-theme-history">
                {themeHistory.map((v) => <option key={v} value={v} />)}
              </datalist>
            </div>
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
              <Label>生成数</Label>
              <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 8, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}件</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating || !theme.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {generating ? '生成中...' : '✨ ネタを生成する'}
          </Button>
        </CardContent>
      </Card>

      {ideas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">💡</div>
          <p>まだネタがありません</p>
          <p className="text-sm mt-1">テーマを入力してAIにネタを生成させましょう</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ideas.map((idea) => (
            <Card key={idea.id} className={`transition-opacity ${idea.used ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800">{idea.title}</p>
                    {idea.description && (
                      <p className="text-xs text-gray-500 mt-1">{idea.description}</p>
                    )}
                    {idea.used && (
                      <Badge variant="secondary" className="text-xs mt-2">使用済み</Badge>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 px-2"
                      onClick={() => handleMarkUsed(idea.id, idea.used)}
                    >
                      {idea.used ? '未使用に戻す' : '✓'}
                    </Button>
                    <Link
                      href={`/posts/new?topic=${encodeURIComponent(idea.title)}`}
                      className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'text-xs h-7 px-2')}
                    >
                      投稿作成
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 px-2 text-red-400 hover:text-red-600"
                      onClick={() => handleDelete(idea.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  )
}
