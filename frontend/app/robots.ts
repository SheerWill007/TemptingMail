import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    // Mailboxes are private-by-obscurity; keep them out of search results.
    rules: { userAgent: '*', allow: '/', disallow: ['/mailbox/', '/api/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
