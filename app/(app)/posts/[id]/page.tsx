import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostEditor } from '@/components/posts/post-editor'
import { type Post, type SnsType, type Tone } from '@/types'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!post) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('sns_type, tone')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投稿を編集</h1>
        <p className="text-gray-500 mt-1">内容を編集して保存してください</p>
      </div>
      <PostEditor
        post={post as Post}
        userId={user.id}
        defaultSnsType={(profile?.sns_type?.[0] as SnsType) ?? 'twitter'}
        defaultTone={(profile?.tone as Tone) ?? 'casual'}
      />
    </div>
  )
}
