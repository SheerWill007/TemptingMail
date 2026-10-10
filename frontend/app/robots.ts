import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    // Mailboxes are private-by-obscurity; keep them out of search results.
    rules: { userAgent: '*', allow: '/', disallow: ['/mailbox/', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
