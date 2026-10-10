/**
 * Public URL of the site, used for metadata, robots.txt and the sitemap.
 * Production builds get it from `.env.production` (https://temp.willx.tech) unless overridden by a
 * real environment variable; `next dev` falls back to localhost.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
