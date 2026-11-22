import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

// Domains /studio (embedded Sanity Studio) needs at runtime, per
// https://www.sanity.io/docs/studio/system-requirements. There's no
// per-request nonce (headers() is static, it doesn't run through middleware),
// so script-src/style-src need 'unsafe-inline' to avoid breaking Next's
// hydration payload and the runtime styles of the styled-components Studio
// uses - see the commit note on this limitation.
const sanityConnectSrc = [
  "https://*.api.sanity.io",
  "https://*.apicdn.sanity.io",
  "https://*.sanity-cdn.com",
  "https://media.sanity.io",
  "https://manage.sanity.io",
];

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://media.sanity.io",
  "font-src 'self' data:",
  `connect-src 'self' ${sanityConnectSrc.join(" ")}`,
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
