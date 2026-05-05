'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DashboardCTA() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleRandom() {
    setLoading(true)
    setTimeout(() => router.push('/posts/new'), 900)
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleRandom}
        disabled={loading}
        className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:scale-100 transition-all text-white font-bold text-base py-4 shadow-md shadow-emerald-100"
      >
        {loading ? (
          <span className="animate-pulse">✨ ネタを考えています…</span>
        ) : (
          '✨ ランダムで投稿を作る'
        )}
      </button>
      <a
        href="/ideas"
        className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all font-semibold text-base py-3.5"
      >
        💡 ネタを選んで作る
      </a>
    </div>
  )
}
