import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IdeasClient } from '@/components/ideas/ideas-client'
import { type SnsType } from '@/types'

export default async function IdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [ideasResult, profileResult] = await Promise.all([
    supabase.from('ideas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('sns_type, tone').eq('id', user.id).single(),
  ])

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ネタ帳</h1>
        <p className="text-gray-500 mt-1">AIで投稿アイデアを生成・管理</p>
      </div>
      <IdeasClient
        ideas={ideasResult.data ?? []}
        userId={user.id}
        defaultSnsType={(profileResult.data?.sns_type?.[0] as SnsType) ?? 'twitter'}
      />
    </div>
  )
}
