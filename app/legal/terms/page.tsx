import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />
      <main className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <div>
          <h1 className="text-2xl font-extrabold mb-2">利用規約</h1>
          <p className="text-sm text-gray-500">最終更新日：2025年5月</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">第1条（サービスの内容）</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Postly（以下「本サービス」）は、AIを活用してSNS投稿文を生成するWebサービスです。ユーザーはテーマを入力することで、投稿文のアイデアや本文を生成することができます。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">第2条（生成コンテンツの利用責任）</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            本サービスが生成したコンテンツの利用および投稿については、ユーザー自身の責任において行うものとします。生成結果に起因するいかなる損害についても、当サービス運営者は責任を負いません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">第3条（禁止事項）</h2>
          <p className="text-sm text-gray-700 leading-relaxed">ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="text-sm text-gray-700 space-y-1 pl-4 list-disc">
            <li>法令または公序良俗に反する行為</li>
            <li>第三者の権利（著作権・肖像権・名誉権等）を侵害する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>不正アクセスやスパム行為</li>
            <li>その他、当サービス運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">第4条（サービスの変更・中断）</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            当サービスは、予告なくサービス内容を変更・中断・終了する場合があります。これにより生じた損害について、当サービス運営者は責任を負いません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">第5条（保証の否認）</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            本サービスが生成するコンテンツの正確性・完全性・有用性・特定目的への適合性を保証するものではありません。生成結果による成果・成功も保証しません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">第6条（料金・課金）</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            有料プランは月額980円（税込）の月額課金制です。お支払いはクレジットカード決済（Stripe）にて行われます。課金はお申し込み時に開始され、毎月同日に自動更新されます。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">第7条（解約）</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            有料プランはいつでも解約することができます。解約後は次回更新日以降の請求は発生しません。解約手続きはアカウント設定ページから行えます。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">第8条（準拠法）</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            本規約は日本法に準拠します。本サービスに関する紛争については、大阪地方裁判所を専属合意管轄裁判所とします。
          </p>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
