import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

function origin(url: string | undefined) {
  try {
    return url ? new URL(url).origin : ''
  } catch {
    return ''
  }
}

const apiOrigin = origin(process.env.NEXT_PUBLIC_API_URL)
const posthog = process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'https://*.posthog.com' : ''
const httpsSite = (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://')

/**
 * Content-Security-Policy. Email bodies render in sandboxed srcdoc iframes, which inherit this
 * policy, so img/style/font sources stay permissive here; the iframe adds its own stricter policy
 * (remote content blocked until the user opts in). Next.js needs inline scripts for hydration.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${posthog}`,
  "style-src 'self' 'unsafe-inline'",
  'img-src * data: blob:',
  "font-src 'self' data: https:",
  "media-src 'self' data: https:",
  `connect-src 'self' ${apiOrigin} ${posthog}`,
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(httpsSite ? ['upgrade-insecure-requests'] : []),
]
  .map((d) => d.replace(/\s+/g, ' ').trim())
  .join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Mailbox URLs contain the address, so never leak them to links clicked inside emails.
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

// The repository root has its own package-lock.json (tooling only); pin the app root to this
// directory so the standalone output layout is always `.next/standalone/server.js`.
const appRoot = process.cwd()

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker (`node server.js`).
  output: 'standalone',
  outputFileTracingRoot: appRoot,
  turbopack: { root: appRoot },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
