import Link from 'next/link'

export function DashboardCTA() {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/posts/new"
        className="w-full block text-center rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-bold text-base py-4 shadow-md shadow-emerald-100"
      >
        ✨ ランダムで投稿を作る
      </Link>
      <Link
        href="/ideas"
        className="w-full block text-center rounded-2xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all font-semibold text-base py-3.5"
      >
        💡 ネタを選んで作る
      </Link>
    </div>
  )
}
