/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src * 'self' data: blob:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' data: blob:;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
