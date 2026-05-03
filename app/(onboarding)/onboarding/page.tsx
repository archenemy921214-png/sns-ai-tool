'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { type SnsType, type Tone } from '@/types'

const SNS_OPTIONS: { value: SnsType; label: string }[] = [
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'threads', label: 'Threads' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'other', label: 'その他' },
]

const TONE_OPTIONS: { value: Tone; label: string; desc: string }[] = [
  { value: 'casual', label: 'カジュアル', desc: '親しみやすい口調' },
  { value: 'professional', label: 'プロフェッショナル', desc: 'ビジネス向け' },
  { value: 'friendly', label: 'フレンドリー', desc: '明るく親切な口調' },
  { value: 'formal', label: 'フォーマル', desc: '丁寧な敬語' },
  { value: 'humorous', label: 'ユーモラス', desc: '面白く楽しい口調' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [selectedSns, setSelectedSns] = useState<SnsType[]>([])
  const [selectedTone, setSelectedTone] = useState<Tone>('casual')
  const [loading, setLoading] = useState(false)

  function toggleSns(sns: SnsType) {
    setSelectedSns((prev) =>
      prev.includes(sns) ? prev.filter((s) => s !== sns) : [...prev, sns]
    )
  }

  async function handleComplete() {
    if (!displayName.trim()) {
      toast.error('表示名を入力してください')
      return
    }
    if (selectedSns.length === 0) {
      toast.error('SNSを1つ以上選択してください')
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio,
        sns_type: selectedSns,
        tone: selectedTone,
        onboarded: true,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('保存に失敗しました')
      setLoading(false)
      return
    }

    toast.success('設定が完了しました！')
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-violet-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <CardTitle>初期設定 {step}/3</CardTitle>
          <CardDescription>
            {step === 1 && 'プロフィールを設定しましょう'}
            {step === 2 && '運用するSNSを選択してください'}
            {step === 3 && '投稿のトーンを選択してください'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>表示名 *</Label>
                <Input
                  placeholder="山田 太郎"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>自己紹介・運用テーマ</Label>
                <Textarea
                  placeholder="例：ITエンジニアとして技術情報を発信しています"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={() => setStep(2)}
                disabled={!displayName.trim()}
              >
                次へ
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {SNS_OPTIONS.map((sns) => (
                  <button
                    key={sns.value}
                    onClick={() => toggleSns(sns.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedSns.includes(sns.value)
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{sns.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  戻る
                </Button>
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                  onClick={() => setStep(3)}
                  disabled={selectedSns.length === 0}
                >
                  次へ
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedTone === tone.value
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{tone.label}</span>
                    <span className="text-xs text-gray-500 ml-2">{tone.desc}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  戻る
                </Button>
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? '保存中...' : '完了'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
