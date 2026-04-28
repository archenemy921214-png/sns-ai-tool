import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

const cspDirectives = [
  "default-src 'self'",
  // 開発時のみ unsafe-eval（Turbopackのソースマップ用）
  `script-src 'self' 'unsafe-inline' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  // Supabase (REST + Realtime) と Stripe API への接続
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  // Stripe Checkout の iframe
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
        ],
      },
    ]
  },
}

export default nextConfig
