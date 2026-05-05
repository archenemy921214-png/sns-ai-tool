import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />
      <main className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold mb-2">お問い合わせ</h1>
          <p className="text-gray-600 leading-relaxed">
            サービスに関するご質問・不具合・解約に関するお問い合わせはこちらからご連絡ください。
          </p>
        </div>

        <div className="border rounded-xl p-6 space-y-4 bg-gray-50">
          <h2 className="font-bold">メールにてお問い合わせ</h2>
          <p className="text-sm text-gray-600">
            下記メールアドレスにご連絡いただくか、件名に「SNS AI Tool お問い合わせ」とご記入ください。
          </p>
          <a
            href="mailto:archenemy921214@gmail.com"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline text-base"
          >
            📧 archenemy921214@gmail.com
          </a>
          <ul className="text-sm text-gray-500 space-y-1 pt-2">
            <li>・通常2〜3営業日以内にご返信します</li>
            <li>・解約のご依頼はアカウント設定ページからもお手続きいただけます</li>
          </ul>
        </div>

        <div className="border rounded-xl p-6 space-y-2 text-sm text-gray-700">
          <h2 className="font-bold">よくあるお問い合わせ</h2>
          <div className="space-y-3 pt-1">
            <div>
              <p className="font-medium">解約したい</p>
              <p className="text-gray-500">アカウント設定ページ → サブスクリプション管理から解約できます。</p>
            </div>
            <div>
              <p className="font-medium">AI生成の回数が増えない</p>
              <p className="text-gray-500">無料プランは月3回までです。有料プランにアップグレードすると無制限になります。</p>
            </div>
            <div>
              <p className="font-medium">パスワードを忘れた</p>
              <p className="text-gray-500">ログインページの「パスワードを忘れた方はこちら」からリセットできます。</p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
