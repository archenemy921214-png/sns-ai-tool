import { PublicHeader } from '@/components/shared/public-header'
import { PublicFooter } from '@/components/shared/public-footer'

const ROWS = [
  { label: '販売事業者', value: '野呂剛士' },
  { label: '所在地', value: '大阪府大東市三箇1-22-14' },
  { label: 'お問い合わせ', value: 'メールにて受付（archenemy921214@gmail.com）' },
  { label: '販売価格', value: '各プランページに記載（無料プラン：¥0 / 有料プラン：¥980/月）' },
  { label: '商品代金以外の必要料金', value: 'インターネット接続料金・通信料金等はお客様のご負担となります' },
  { label: '支払い方法', value: 'クレジットカード決済（Stripe）' },
  { label: '支払い時期', value: 'お申し込み時に決済されます。以降は毎月同日に自動更新されます' },
  { label: 'サービス提供時期', value: '決済完了後、直ちにご利用いただけます' },
  {
    label: '返品・キャンセルについて',
    value: 'デジタルサービスの性質上、決済後の返金・キャンセルは原則としてお受けしておりません',
  },
  {
    label: '解約について',
    value: 'サブスクリプションはいつでも解約可能です。解約後は次回更新日以降の請求は発生しません',
  },
  {
    label: '動作環境',
    value: 'インターネットに接続されたPC・スマートフォン・タブレットのブラウザ',
  },
  {
    label: '表現および商品に関する注意書き',
    value: '本サービスによる生成結果の正確性・完全性・有用性を保証するものではありません',
  },
]

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-extrabold mb-8">特定商取引法に基づく表記</h1>
        <div className="border rounded-xl overflow-hidden">
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`flex flex-col md:flex-row md:items-start gap-1 md:gap-0 px-5 py-4 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              <dt className="md:w-48 shrink-0 font-medium text-gray-700">{row.label}</dt>
              <dd className="text-gray-800 md:flex-1">{row.value}</dd>
            </div>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
