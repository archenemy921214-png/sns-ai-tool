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

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
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
            <Label>トーン</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger className="w-full">
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
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? '保存中...' : 'プロフィールを保存'}
          </Button>
        </CardContent>
      </Card>

      {(() => {
        const usagePercent = limit === Infinity ? 0 : Math.round((aiUsage / limit) * 100)
        const overLimit = limit !== Infinity && aiUsage >= limit
        return plan === 'free' ? (
          <div className={cn(
            'rounded-2xl p-4 space-y-3',
            overLimit ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold text-sm ${overLimit ? 'text-red-700' : 'text-emerald-800'}`}>
                  {overLimit ? '⚠️ AI生成の上限に達しました' : '✨ AI生成'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  今月 {aiUsage} / {limit} 回使用
                </p>
              </div>
              <span className="text-2xl">{overLimit ? '🔒' : '🤖'}</span>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${overLimit ? 'bg-red-400' : usagePercent >= 66 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <a
              href="/pricing"
              className={cn(buttonVariants(), 'w-full', overLimit ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700')}
            >
              {overLimit ? '🚀 Proにアップグレードして続ける' : 'Proプランを見る — 制限なし'}
            </a>
          </div>
        ) : (
          <div className="rounded-2xl p-4 space-y-3 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-emerald-800">✨ AI生成: 無制限</p>
                {subscription?.current_period_end && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    次回更新日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
                  </p>
                )}
              </div>
              <span className="text-2xl">🤖</span>
            </div>
            <Button variant="outline" className="w-full" onClick={handlePortal}>
              サブスクリプションを管理
            </Button>
          </div>
        )
      })()}

      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          🚪 ログアウト
        </button>
      </div>
    </div>
  )
}
