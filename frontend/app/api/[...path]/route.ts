import type { NextRequest } from 'next/server'

/**
 * Same-origin proxy to the backend API. Keeps the browser on one origin (no CORS, and inline
 * email images resolve against /api) and lets API_URL be set at runtime rather than build time.
 * In the Docker/Caddy deployment, /api is routed straight to the backend and this is bypassed.
 */
export const dynamic = 'force-dynamic'

const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/+$/, '')

const FORWARDED_REQUEST_HEADERS = ['accept', 'accept-language', 'content-type', 'user-agent']
const DROPPED_RESPONSE_HEADERS = [
  'connection',
  'keep-alive',
  'transfer-encoding',
  // fetch() already decoded the body, so these no longer describe it.
  'content-encoding',
  'content-length',
]

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const target = `${API_URL}/api/${path.map(encodeURIComponent).join('/')}${req.nextUrl.search}`

  const headers = new Headers()
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers.get(name)
    if (value) headers.set(name, value)
  }
  // Preserve the client IP for the API's per-IP rate limits.
  const forwardedFor = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip')
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor)

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    })
    const responseHeaders = new Headers(upstream.headers)
    for (const name of DROPPED_RESPONSE_HEADERS) responseHeaders.delete(name)
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch {
    return Response.json({ error: 'The mail service is temporarily unavailable.' }, { status: 502 })
  }
}

export { proxy as GET, proxy as POST, proxy as DELETE }
