import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="border-t bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm font-bold text-gray-800">SNS AI Tool</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-800">トップ</Link>
            <Link href="/pricing" className="hover:text-gray-800">料金</Link>
            <Link href="/legal/tokusho" className="hover:text-gray-800">特定商取引法に基づく表記</Link>
            <Link href="/legal/privacy" className="hover:text-gray-800">プライバシーポリシー</Link>
            <Link href="/legal/terms" className="hover:text-gray-800">利用規約</Link>
            <Link href="/contact" className="hover:text-gray-800">お問い合わせ</Link>
          </nav>
        </div>
        <p className="text-xs text-gray-400 mt-6">© {new Date().getFullYear()} SNS AI Tool. All rights reserved.</p>
      </div>
    </footer>
  )
}
