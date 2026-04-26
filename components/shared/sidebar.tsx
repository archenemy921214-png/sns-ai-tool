'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '🏠' },
  { href: '/posts', label: '投稿管理', icon: '📝' },
  { href: '/posts/new', label: '新規投稿', icon: '✏️' },
  { href: '/ideas', label: 'ネタ帳', icon: '💡' },
  { href: '/calendar', label: 'カレンダー', icon: '📅' },
  { href: '/templates', label: 'テンプレート', icon: '📋' },
]

const bottomItems = [
  { href: '/pricing', label: 'プラン管理', icon: '💎' },
  { href: '/settings', label: '設定', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('ログアウトしました')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 flex-shrink-0 border-r bg-white flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="text-xl font-bold text-violet-600">
          PostAI
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === item.href || (item.href !== '/posts/new' && pathname.startsWith(item.href) && item.href !== '/posts')
                ? 'bg-violet-50 text-violet-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <Separator className="my-2" />

        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-violet-50 text-violet-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-500 hover:text-red-500"
          onClick={handleLogout}
        >
          🚪 ログアウト
        </Button>
      </div>
    </aside>
  )
}
