import tailwindcss from '@tailwindcss/vite'

function origin(url: string | undefined) {
  try {
    return url ? new URL(url).origin : ''
  } catch {
    return ''
  }
}

const isDev = process.env.NODE_ENV !== 'production'
// Read at build time for the security headers below; the same variables also feed runtimeConfig.
const apiOrigin = origin(process.env.NUXT_PUBLIC_API_BASE)
const posthog = process.env.NUXT_PUBLIC_POSTHOG_KEY ? 'https://*.posthog.com' : ''
const httpsSite = (process.env.NUXT_PUBLIC_SITE_URL ?? '').startsWith('https://')

/**
 * Content-Security-Policy. Email bodies render in sandboxed srcdoc iframes, which inherit this
 * policy, so img/style/font sources stay permissive here; the iframe adds its own stricter policy
 * (remote content blocked until the user opts in). Nuxt needs inline scripts for hydration.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${posthog}`,
  "style-src 'self' 'unsafe-inline'",
  'img-src * data: blob:',
  "font-src 'self' data: https:",
  "media-src 'self' data: https:",
  `connect-src 'self' ${apiOrigin} ${posthog}${isDev ? ' ws: wss:' : ''}`,
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(httpsSite ? ['upgrade-insecure-requests'] : []),
]
  .map((d) => d.replace(/\s+/g, ' ').trim())
  .join('; ')

const title = 'Temp Mail - Free Disposable Email'
const description =
  'Create a disposable email address instantly. No registration, no tracking. Messages self-destruct after 24 hours.'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },

  runtimeConfig: {
    /** Server-side only: where /api/** is proxied to (NUXT_API_URL). */
    apiUrl: 'http://localhost:3001',
    public: {
      /** Public URL of this site (NUXT_PUBLIC_SITE_URL), for metadata, robots.txt and the sitemap. */
      siteUrl: 'http://localhost:3000',
      /** Shown until /api/config loads (NUXT_PUBLIC_MAIL_DOMAIN). */
      mailDomain: 'localhost',
      /**
       * Optional direct backend origin (NUXT_PUBLIC_API_BASE). When set, live events and downloads
       * go straight to it instead of through the /api proxy (needs CORS_ORIGINS on the backend).
       */
      apiBase: '',
      /** Source of the deployed version, offered in the footer as the AGPL requires. */
      sourceUrl: 'https://github.com/SheerWill007/TemptingMail',
      posthogKey: '',
      posthogHost: 'https://us.i.posthog.com',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title,
      meta: [
        { name: 'description', content: description },
        { name: 'theme-color', content: '#0b0d12' },
        { name: 'color-scheme', content: 'dark' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:site_name', content: 'Temp Mail' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': csp,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        // Mailbox URLs contain the address, so never leak them to links clicked inside emails.
        'Referrer-Policy': 'no-referrer',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    // Mailbox pages are entirely client-driven; skip SSR so nothing address-specific is rendered server-side.
    '/mailbox/**': { ssr: false },
  },

  typescript: { strict: true },
})
