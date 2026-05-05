'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { type Post, type PostStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

const STATUS_LABEL: Record<PostStatus, { label: string; variant: 'secondary' | 'default' | 'outline' }> = {
  draft: { label: '下書き', variant: 'secondary' },
  scheduled: { label: '予約済み', variant: 'default' },
  published: { label: '公開済み', variant: 'outline' },
}

export function PostsTable({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<PostStatus | 'all'>('all')

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.status === filter)

  async function handleDelete(id: string) {
    if (!confirm('この投稿を削除しますか？')) return
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      toast.error('削除に失敗しました')
      return
    }
    toast.success('削除しました')
    router.refresh()
  }

  async function handleCopy(post: Post) {
    const supabase = createClient()
    const { error } = await supabase.from('posts').insert({
      user_id: post.user_id,
      title: post.title ? `${post.title} (コピー)` : null,
      content: post.content,
      sns_type: post.sns_type,
      status: 'draft',
      tags: post.tags,
      ai_generated: post.ai_generated,
    })
    if (error) {
      toast.error('コピーに失敗しました')
      return
    }
    toast.success('投稿をコピーしました')
    router.refresh()
  }

  async function handleStatusChange(id: string, status: PostStatus) {
    const supabase = createClient()
    const { error } = await supabase.from('posts').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) {
      toast.error('更新に失敗しました')
      return
    }
    toast.success('ステータスを更新しました')
    router.refresh()
  }

  async function handleCopyText(content: string) {
    await navigator.clipboard.writeText(content)
    toast.success('クリップボードにコピーしました')
  }

  return (
    <div>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as PostStatus | 'all')}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">すべて ({posts.length})</TabsTrigger>
          <TabsTrigger value="draft">下書き ({posts.filter((p) => p.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="scheduled">予約済み ({posts.filter((p) => p.status === 'scheduled').length})</TabsTrigger>
          <TabsTrigger value="published">公開済み ({posts.filter((p) => p.status === 'published').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>投稿がありません</p>
          <Link
            href="/posts/new"
            className={cn(buttonVariants({ size: 'sm' }), 'mt-4 bg-emerald-600 hover:bg-emerald-700')}
          >
            投稿を作成する
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-4 bg-white rounded-lg border p-4 hover:border-emerald-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={STATUS_LABEL[post.status].variant} className="text-xs">
                    {STATUS_LABEL[post.status].label}
                  </Badge>
                  {post.sns_type && (
                    <span className="text-xs text-gray-400 uppercase">{post.sns_type}</span>
                  )}
                  {post.ai_generated && (
                    <span className="text-xs text-emerald-500">✨ AI生成</span>
                  )}
                </div>
                {post.title && (
                  <p className="text-sm font-medium text-gray-800 mb-1 truncate">{post.title}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-wrap">{post.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {format(new Date(post.updated_at), 'M月d日 HH:mm', { locale: ja })}
                  {post.scheduled_at && ` • 予約: ${format(new Date(post.scheduled_at), 'M月d日 HH:mm', { locale: ja })}`}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'shrink-0 cursor-pointer')}>
                    ···
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => router.push(`/posts/${post.id}`)}>
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyText(post.content)}>
                    テキストをコピー
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopy(post)}>
                    投稿を複製
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {post.status !== 'draft' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'draft')}>
                      下書きに戻す
                    </DropdownMenuItem>
                  )}
                  {post.status !== 'published' && (
                    <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'published')}>
                      公開済みにする
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(post.id)}
                  >
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
