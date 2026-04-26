import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplatesClient } from '@/components/templates/templates-client'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">テンプレート</h1>
        <p className="text-gray-500 mt-1">よく使う投稿文を保存・管理</p>
      </div>
      <TemplatesClient templates={templates ?? []} userId={user.id} />
    </div>
  )
}
