import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'
import { PricingClient } from '@/components/pricing/pricing-client'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold">料金プラン</h1>
          <p className="text-gray-500">すべてのプランで主要機能をご利用いただけます</p>
        </div>

        <PricingClient />

        {/* 決済・解約情報 */}
        <div className="border rounded-xl p-6 bg-gray-50 space-y-3 text-sm text-gray-700">
          <h2 className="font-bold text-base">お支払いについて</h2>
          <ul className="space-y-2">
            <li>💳 <strong>決済方法：</strong>クレジットカード（Visa・Mastercard・JCB・American Express）</li>
            <li>⚡ <strong>利用開始：</strong>決済完了後、すぐにご利用いただけます</li>
            <li>🔄 <strong>課金サイクル：</strong>月額課金（毎月同日に自動更新）</li>
            <li>🚪 <strong>解約：</strong>いつでも解約可能。解約後は次回更新日以降の請求は発生しません</li>
            <li>📋 <strong>返金：</strong>デジタルサービスの性質上、原則として返金はお受けしておりません</li>
          </ul>
        </div>

        {/* リーガルリンク */}
        <p className="text-center text-sm text-gray-400">
          ご利用にあたっては
          <a href="/legal/terms" className="underline hover:text-gray-600 mx-1">利用規約</a>
          および
          <a href="/legal/privacy" className="underline hover:text-gray-600 mx-1">プライバシーポリシー</a>
          に同意したものとみなします。
          <br className="hidden md:block" />
          <a href="/legal/tokusho" className="underline hover:text-gray-600 mx-1">特定商取引法に基づく表記</a>
          もあわせてご確認ください。
        </p>
      </div>

      <PublicFooter />
    </div>
  )
}
