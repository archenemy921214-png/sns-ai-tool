import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PostsTable } from '@/components/posts/posts-table'

export default async function PostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">投稿管理</h1>
          <p className="text-gray-500 mt-1">{posts?.length ?? 0} 件の投稿</p>
        </div>
        <Link
          href="/posts/new"
          className={cn(buttonVariants(), 'bg-emerald-600 hover:bg-emerald-700')}
        >
          + 新規投稿
        </Link>
      </div>
      <PostsTable posts={posts ?? []} />
    </div>
  )
}
