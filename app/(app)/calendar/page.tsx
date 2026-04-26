import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from '@/components/calendar/calendar-client'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, sns_type, status, scheduled_at, created_at')
    .eq('user_id', user.id)
    .not('scheduled_at', 'is', null)
    .order('scheduled_at', { ascending: true })

  const allPosts = await supabase
    .from('posts')
    .select('id, title, content, sns_type, status, scheduled_at, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投稿カレンダー</h1>
        <p className="text-gray-500 mt-1">予約投稿をカレンダーで管理</p>
      </div>
      <CalendarClient
        scheduledPosts={posts ?? []}
        allPosts={allPosts.data ?? []}
      />
    </div>
  )
}
