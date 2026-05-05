import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'SNS AI Tool - AI SNS投稿作成ツール',
  description: 'SNS AI Toolは、Instagram・Threads・XなどのSNS投稿文をAIで作成できるWebサービスです。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${nunito.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground font-[family-name:var(--font-nunito)]">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
