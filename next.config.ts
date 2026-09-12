import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

// Dominios que /studio (Sanity Studio embebido) necesita en runtime, según
// https://www.sanity.io/docs/studio/system-requirements. Sin nonce por
// request (headers() es estático, no corre por middleware), así que
// script-src/style-src necesitan 'unsafe-inline' para no romper el
// hydration payload de Next ni los estilos runtime de styled-components
// que usa Studio - ver nota en el commit sobre esta limitación.
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
