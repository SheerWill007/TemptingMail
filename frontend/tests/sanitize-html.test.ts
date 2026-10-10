import DOMPurify from 'dompurify'
import { describe, expect, it } from 'vitest'
import { hasRemoteContent, sanitizeEmailHtml, textToHtml } from '@/lib/sanitize-html'

describe('sanitizeEmailHtml', () => {
  it('runs with a real DOMPurify (not the fail-closed fallback)', () => {
    expect(DOMPurify.isSupported).toBe(true)
  })

  it('fails closed to inert text when DOMPurify is unsupported', () => {
    const purify = DOMPurify as { isSupported: boolean }
    purify.isSupported = false
    try {
      const html = sanitizeEmailHtml('<p>Hi</p><img src=x onerror="alert(1)">')
      expect(html).not.toMatch(/<img|onerror/)
      expect(html).toContain('Hi')
    } finally {
      purify.isSupported = true
    }
  })

  it('removes scripts, event handlers and forms', () => {
    const html = sanitizeEmailHtml(
      '<p>Hi</p><script>alert(1)</script><img src="x" onerror="alert(2)"><form action="https://evil.test"><input name="pw"><button>Go</button></form>',
    )
    expect(html).toContain('<p>Hi</p>')
    expect(html).not.toMatch(/<script|onerror|<form|<input|<button|evil\.test/i)
  })

  it('removes frames, objects and base tags', () => {
    const html = sanitizeEmailHtml(
      '<iframe src="https://x.test"></iframe><object data="x"></object><base href="https://x.test">',
    )
    expect(html).not.toMatch(/<iframe|<object|<base/i)
  })

  it('strips javascript: URLs', () => {
    expect(sanitizeEmailHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:')
  })

  it('keeps email styles', () => {
    expect(sanitizeEmailHtml('<style>p{color:red}</style><p>x</p>')).toContain('<style>p{color:red}</style>')
  })

  it('opens links in a new tab without opener or referrer', () => {
    const html = sanitizeEmailHtml('<a href="https://example.com">x</a>')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})

describe('hasRemoteContent', () => {
  it.each([
    '<img src="https://t.test/p.gif">',
    "<img src='http://t.test/p.gif'>",
    '<img src=//t.test/p.gif>',
    '<td background="https://t.test/bg.png">',
    '<div style="background:url(https://t.test/bg.png)">',
  ])('detects %s', (html) => expect(hasRemoteContent(html)).toBe(true))

  it.each([
    '<img src="/api/mailboxes/a/messages/b/attachments/0">',
    '<img src="data:image/png;base64,AAAA">',
    '<p>hi</p>',
  ])('ignores %s', (html) => expect(hasRemoteContent(html)).toBe(false))
})

describe('textToHtml', () => {
  it('escapes markup and links URLs', () => {
    const html = textToHtml('<b>hi</b> see https://example.com/a?b=1.')
    expect(html).toContain('&lt;b&gt;hi&lt;/b&gt;')
    expect(html).toContain('<a href="https://example.com/a?b=1" target="_blank" rel="noopener noreferrer">')
    expect(html).toMatch(/<\/a>\.<\/pre>$/)
  })
})
