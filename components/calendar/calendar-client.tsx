'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import { type Post } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-400',
  scheduled: 'bg-green-500',
  published: 'bg-blue-500',
}

export function CalendarClient({
  scheduledPosts,
  allPosts,
}: {
  scheduledPosts: Partial<Post>[]
  allPosts: Partial<Post>[]
}) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = monthStart.getDay()
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i)

  function getPostsForDay(date: Date) {
    return allPosts.filter((post) => {
      const dateStr = post.scheduled_at ?? post.created_at
      return dateStr && isSameDay(new Date(dateStr), date)
    })
  }

  const selectedDayPosts = selectedDate ? getPostsForDay(selectedDate) : []

  const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'yyyy年 M月', { locale: ja })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            今月
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            →
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`py-2 text-center text-xs font-medium ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {paddingDays.map((i) => (
            <div key={`pad-${i}`} className="min-h-[80px] border-b border-r p-1 bg-gray-50" />
          ))}
          {days.map((day) => {
            const dayPosts = getPostsForDay(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const dayOfWeek = day.getDay()

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] border-b border-r p-1 cursor-pointer transition-colors ${
                  isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDate(isSelected ? null : day)}
              >
                <div
                  className={`text-xs mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-emerald-600 text-white font-bold'
                      : dayOfWeek === 0
                      ? 'text-red-500'
                      : dayOfWeek === 6
                      ? 'text-blue-500'
                      : 'text-gray-700'
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className={`text-white text-xs px-1 py-0.5 rounded truncate ${
                        STATUS_COLOR[post.status ?? 'draft']
                      }`}
                    >
                      {post.title ?? post.content?.slice(0, 15)}
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-xs text-gray-400 pl-1">+{dayPosts.length - 2}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">
                {format(selectedDate, 'M月d日（E）', { locale: ja })} の投稿
              </h3>
              <Link
                href="/posts/new"
                className={cn(buttonVariants({ size: 'sm' }), 'bg-emerald-600 hover:bg-emerald-700')}
              >
                + 投稿を作成
              </Link>
            </div>
            {selectedDayPosts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">この日の投稿はありません</p>
            ) : (
              <div className="space-y-2">
                {selectedDayPosts.map((post) => (
                  <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full ${STATUS_COLOR[post.status ?? 'draft']}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{post.title ?? post.content?.slice(0, 40)}</p>
                      <p className="text-xs text-gray-400">
                        {post.scheduled_at
                          ? format(new Date(post.scheduled_at), 'HH:mm', { locale: ja })
                          : ''}
                        {' '}
                        <span className="uppercase">{post.sns_type}</span>
                      </p>
                    </div>
                    <Link
                      href={`/posts/${post.id}`}
                      className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'text-xs')}
                    >
                      編集
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> 下書き</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> 予約済み</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> 公開済み</span>
      </div>
    </div>
  )
}
