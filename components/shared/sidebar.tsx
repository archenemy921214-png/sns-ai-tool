'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'ホーム', icon: '🏠' },
  { href: '/posts', label: '投稿', icon: '📝' },
  { href: '/ideas', label: 'ネタ帳', icon: '💡' },
  { href: '/calendar', label: 'カレンダー', icon: '📅' },
  { href: '/settings', label: '設定', icon: '⚙️' },
]

const desktopExtra = [
  { href: '/posts/new', label: '新規投稿', icon: '✏️' },
  { href: '/templates', label: 'テンプレート', icon: '📋' },
  { href: '/pricing', label: 'プラン管理', icon: '💎' },
]

function isActive(pathname: string, href: string) {
  if (href === '/posts') return pathname === '/posts' || pathname.startsWith('/posts/')
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('ログアウトしました')
    router.push('/login')
  }

  return (
    <>
      {/* ===== PC: 左サイドバー ===== */}
      <aside className="hidden md:flex w-60 flex-shrink-0 border-r bg-white flex-col h-screen sticky top-0">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-xl font-bold text-emerald-600">
            Postly
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[...navItems, ...desktopExtra].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive(pathname, item.href)
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-gray-100 transition-colors"
          >
            🚪 ログアウト
          </button>
        </div>
      </aside>

      {/* ===== スマホ: 上部ヘッダー ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b flex items-center px-4 h-12">
        <Link href="/dashboard" className="text-lg font-bold text-emerald-600">
          Postly
        </Link>
      </header>

      {/* ===== スマホ: FAB ===== */}
      <Link
        href="/posts/new"
        className="md:hidden fixed bottom-20 right-4 z-50 size-11 rounded-full bg-gray-700/70 text-white shadow flex items-center justify-center text-xl active:scale-95 transition-transform"
        aria-label="新規投稿"
      >
        ＋
      </Link>

      {/* ===== スマホ: 下部タブナビ ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t">
        <div className="flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center py-2 text-xs transition-colors',
                  active ? 'text-emerald-600' : 'text-gray-400'
                )}
              >
                <span className="text-xl mb-0.5">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
