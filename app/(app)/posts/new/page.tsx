import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostEditor } from '@/components/posts/post-editor'
import { type SnsType, type Tone } from '@/types'

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('sns_type, tone')
    .eq('id', user.id)
    .single()

  const defaultSnsType = (profile?.sns_type?.[0] as SnsType) ?? 'twitter'
  const defaultTone = (profile?.tone as Tone) ?? 'casual'

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">新規投稿</h1>
        <p className="text-gray-500 mt-1">AIで投稿文を生成または手動で入力</p>
      </div>
      <PostEditor userId={user.id} defaultSnsType={defaultSnsType} defaultTone={defaultTone} />
    </div>
  )
}
