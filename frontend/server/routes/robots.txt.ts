export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, '')
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  // Mailboxes are private-by-obscurity; keep them out of search results.
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /mailbox/',
    'Disallow: /api/',
    '',
    `Sitemap: ${site}/sitemap.xml`,
    '',
  ].join('\n')
})
