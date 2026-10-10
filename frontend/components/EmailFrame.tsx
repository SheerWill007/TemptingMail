'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const API_ORIGIN = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : ''
  } catch {
    return ''
  }
})()

function buildDocument(bodyHtml: string, allowRemote: boolean) {
  const remote = allowRemote ? ' https: http:' : ''
  const csp = [
    "default-src 'none'",
    `img-src 'self' data: blob: ${API_ORIGIN}${remote}`,
    `style-src 'unsafe-inline'${remote}`,
    `font-src data:${remote}`,
    `media-src 'self' data:${remote}`,
  ].join('; ')

  return `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="no-referrer">
<base target="_blank">
<style>
  html, body { margin: 0; background: #fff; color: #1f2937; }
  body { padding: 20px; font: 15px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; overflow-wrap: anywhere; }
  img { max-width: 100%; height: auto; }
  table { max-width: 100%; }
  a { color: #4f46e5; }
</style>
</head><body>${bodyHtml}</body></html>`
}

/**
 * Renders untrusted email HTML in a sandboxed iframe: no scripts, no forms, no top navigation.
 * `allow-same-origin` (without `allow-scripts`) only lets us measure the content height.
 */
export function EmailFrame({ html, allowRemote, title }: { html: string; allowRemote: boolean; title: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(200)
  const observerRef = useRef<ResizeObserver | null>(null)

  const measure = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (doc?.documentElement) setHeight(Math.max(120, doc.documentElement.scrollHeight))
  }, [])

  const handleLoad = useCallback(() => {
    observerRef.current?.disconnect()
    const doc = iframeRef.current?.contentDocument
    if (!doc?.body) return
    measure()
    observerRef.current = new ResizeObserver(measure)
    observerRef.current.observe(doc.body)
    // Late-loading images change the height without resizing <body> in some browsers.
    doc.querySelectorAll('img').forEach((img) => img.addEventListener('load', measure, { once: true }))
  }, [measure])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={buildDocument(html, allowRemote)}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
      style={{ height }}
      className="block w-full rounded-xl border-0 bg-white"
    />
  )
}
