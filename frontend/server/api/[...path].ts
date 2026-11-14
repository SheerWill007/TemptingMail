/**
 * Same-origin proxy to the backend API. Keeps the browser on one origin (no CORS, and inline
 * email images resolve against /api) and lets NUXT_API_URL be set at runtime rather than build time.
 */
const FORWARDED_REQUEST_HEADERS = ['accept', 'accept-language', 'content-type', 'user-agent', 'x-request-id']
const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'DELETE'])

export default defineEventHandler(async (event) => {
  if (!ALLOWED_METHODS.has(event.method)) {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const apiUrl = String(useRuntimeConfig(event).apiUrl).replace(/\/+$/, '')
  const path = getRouterParam(event, 'path') ?? ''
  const search = getRequestURL(event).search
  const target = `${apiUrl}/api/${path.split('/').map(encodeURIComponent).join('/')}${search}`

  const headers: Record<string, string> = {}
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = getRequestHeader(event, name)
    if (value) headers[name] = value
  }
  // The client IP as seen by the hosting platform, for the API's per-IP rate limits.
  const clientIp = getRequestIP(event, { xForwardedFor: true })
  if (clientIp) headers['x-forwarded-for'] = clientIp

  try {
    return await proxyRequest(event, target, {
      headers,
      fetchOptions: { redirect: 'manual' },
    })
  } catch {
    setResponseStatus(event, 502)
    return { error: 'The mail service is temporarily unavailable.', code: 'SERVICE_UNAVAILABLE' }
  }
})
