'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Profile, type Subscription, type Plan, type SnsType, type Tone } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { toast } from 'sonner'

const SNS_OPTIONS: { value: SnsType; label: string }[] = [
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'threads', label: 'Threads' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'other', label: 'その他' },
]

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'casual', label: 'カジュアル' },
  { value: 'professional', label: 'プロフェッショナル' },
  { value: 'friendly', label: 'フレンドリー' },
  { value: 'formal', label: 'フォーマル' },
  { value: 'humorous', label: 'ユーモラス' },
]

interface SettingsClientProps {
  profile: Profile | null
  subscription: Subscription | null
  email: string
  aiUsage: number
  plan: Plan
  limit: number
  checkoutSuccess: boolean
}

export function SettingsClient({
  profile,
  subscription,
  email,
  aiUsage,
  plan,
  limit,
  checkoutSuccess,
}: SettingsClientProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [selectedSns, setSelectedSns] = useState<SnsType[]>((profile?.sns_type as SnsType[]) ?? [])
  const [tone, setTone] = useState<Tone>((profile?.tone as Tone) ?? 'casual')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (checkoutSuccess) {
      toast.success('プランのアップグレードが完了しました！')
    }
  }, [checkoutSuccess])

  function toggleSns(sns: SnsType) {
    setSelectedSns((prev) =>
      prev.includes(sns) ? prev.filter((s) => s !== sns) : [...prev, sns]
    )
  }

  async function handleSaveProfile() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio, sns_type: selectedSns, tone })
      .eq('id', profile?.id)

    if (error) {
      toast.error('保存に失敗しました')
    } else {
      toast.success('プロフィールを更新しました')
      router.refresh()
    }
    setSaving(false)
  }

  async function handlePortal() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        console.error('[portal] API error:', data)
        throw new Error(data.error ?? 'Portal failed')
      }
      window.location.href = data.url
    } catch (err) {
      console.error('[portal] error:', err)
      toast.error('ポータルへのアクセスに失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">プロフィール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>メールアドレス</Label>
            <Input value={email} disabled className="bg-gray-50" />
          </div>
          <div className="space-y-1.5">
            <Label>表示名</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>自己紹介・運用テーマ</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>運用SNS</Label>
            <div className="flex flex-wrap gap-2">
              {SNS_OPTIONS.map((sns) => (
                <button
                  key={sns.value}
                  onClick={() => toggleSns(sns.value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedSns.includes(sns.value)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-gray-300 text-gray-600 hover:border-emerald-400'
                  }`}
                >
                  {sns.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>デフォルトトーン</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? '保存中...' : 'プロフィールを保存'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            サブスクリプション
            <Badge variant={plan === 'free' ? 'secondary' : 'default'} className="capitalize">
              {plan}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">今月のAI生成使用回数</span>
            <span className="font-medium">
              {aiUsage} / {limit === Infinity ? '無制限' : limit} 回
            </span>
          </div>
          {limit !== Infinity && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min((aiUsage / limit) * 100, 100)}%` }}
              />
            </div>
          )}

          <Separator />

          {plan !== 'free' && subscription?.current_period_end && (
            <p className="text-sm text-gray-500">
              次回更新日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
            </p>
          )}

          {plan === 'free' ? (
            <a
              href="/pricing"
              className={cn(buttonVariants(), 'bg-emerald-600 hover:bg-emerald-700')}
            >
              プランをアップグレード
            </a>
          ) : (
            <Button
              variant="outline"
              onClick={handlePortal}
              >
              サブスクリプションを管理
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
