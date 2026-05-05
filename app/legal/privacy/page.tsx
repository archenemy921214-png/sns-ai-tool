import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />
      <main className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <div>
          <h1 className="text-2xl font-extrabold mb-2">プライバシーポリシー</h1>
          <p className="text-sm text-gray-500">最終更新日：2025年5月</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. 取得する情報</h2>
          <p className="text-sm text-gray-700 leading-relaxed">本サービスでは、以下の情報を取得する場合があります。</p>
          <ul className="text-sm text-gray-700 space-y-1 pl-4 list-disc">
            <li>メールアドレス</li>
            <li>利用履歴（生成した投稿文・ネタ・アクセスログ等）</li>
            <li>決済情報（カード情報はStripeが管理し、本サービスでは保持しません）</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. 利用目的</h2>
          <ul className="text-sm text-gray-700 space-y-1 pl-4 list-disc">
            <li>サービスの提供・運営</li>
            <li>本人確認および不正利用の防止</li>
            <li>利用状況の確認・改善</li>
            <li>お問い合わせへの対応</li>
            <li>決済処理</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">3. 第三者への提供</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. 決済処理について</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            決済処理にはStripe, Inc.のサービスを利用しています。クレジットカード情報は本サービスのサーバーには送信・保存されず、Stripeが安全に管理します。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Cookieの使用</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            本サービスはログイン状態の維持のためCookieを使用します。ブラウザの設定によりCookieを無効化することも可能ですが、一部機能が利用できない場合があります。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">6. 個人情報の管理</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            取得した個人情報は適切な安全管理措置を講じて保管します。不要になった情報は速やかに削除します。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">7. お問い合わせ</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            個人情報の取り扱いに関するお問い合わせは、<a href="/contact" className="text-blue-600 underline">お問い合わせページ</a>よりご連絡ください。
          </p>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
