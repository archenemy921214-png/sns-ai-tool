'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Template, type SnsType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

const SNS_OPTIONS: { value: SnsType | 'all'; label: string }[] = [
  { value: 'all', label: '汎用' },
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
]

export function TemplatesClient({ templates: initialTemplates, userId }: { templates: Template[]; userId: string }) {
  const router = useRouter()
  const [templates, setTemplates] = useState(initialTemplates)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [snsType, setSnsType] = useState<SnsType | 'all'>('all')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim() || !content.trim()) {
      toast.error('テンプレート名と内容を入力してください')
      return
    }
    setSaving(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: userId,
        name,
        content,
        sns_type: snsType === 'all' ? null : snsType,
      })
      .select()
      .single()

    if (error) {
      toast.error('保存に失敗しました')
      setSaving(false)
      return
    }

    setTemplates((prev) => [data as Template, ...prev])
    setOpen(false)
    setName('')
    setContent('')
    setSnsType('all')
    toast.success('テンプレートを保存しました')
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('このテンプレートを削除しますか？')) return
    const supabase = createClient()
    await supabase.from('templates').delete().eq('id', id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    toast.success('削除しました')
  }

  async function handleCopy(content: string) {
    await navigator.clipboard.writeText(content)
    toast.success('クリップボードにコピーしました')
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="inline-flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-2.5 h-8 transition-colors">
          + テンプレートを追加
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>テンプレートを作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>テンプレート名 *</Label>
              <Input placeholder="例：週次振り返り" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>SNS</Label>
              <Select value={snsType} onValueChange={(v) => setSnsType(v as SnsType | 'all')}>
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
              <Label>テンプレート内容 *</Label>
              <Textarea
                placeholder="今週の振り返り&#10;✅ 達成したこと:&#10;📚 学んだこと:&#10;🎯 来週の目標:"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {templates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p>テンプレートがありません</p>
          <p className="text-sm mt-1">よく使う投稿パターンを保存しておきましょう</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{template.name}</span>
                  {template.sns_type && (
                    <span className="text-xs text-gray-400 uppercase">{template.sns_type}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">{template.content}</p>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleCopy(template.content)}
                  >
                    コピー
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(template.id)}
                  >
                    削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
