import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-600">SNS AI Tool</Link>
        <nav className="flex items-center gap-2">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">料金</Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">お問い合わせ</Link>
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>ログイン</Link>
          <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }), 'bg-blue-600 hover:bg-blue-700')}>
            無料で始める
          </Link>
        </nav>
      </div>
    </header>
  )
}
