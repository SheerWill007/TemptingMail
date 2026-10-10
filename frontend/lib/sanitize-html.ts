import DOMPurify from 'dompurify'

let hooked = false

function ensureHooks() {
  if (hooked) return
  hooked = true
  // Links open in a new tab without giving the destination a handle on this page.
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

/**
 * Sanitizes untrusted email HTML. The result is additionally rendered inside a sandboxed iframe
 * without script permissions, so this is defence in depth rather than the only barrier.
 */
export function sanitizeEmailHtml(html: string): string {
  if (typeof window === 'undefined') return ''
  // DOMPurify returns its input untouched when it can't run; fail closed to inert text instead.
  if (!DOMPurify.isSupported)
    return textToHtml(
      html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
  ensureHooks()
  return DOMPurify.sanitize(html, {
    FORCE_BODY: true, // keep leading <style> blocks that emails put in <head>
    ADD_TAGS: ['style'],
    ADD_ATTR: ['target'],
    FORBID_TAGS: [
      'script',
      'iframe',
      'frame',
      'frameset',
      'object',
      'embed',
      'applet',
      'base',
      'meta',
      'link',
      'form',
      'input',
      'button',
      'textarea',
      'select',
      'option',
    ],
    FORBID_ATTR: ['action', 'formaction', 'srcdoc'],
  })
}

const REMOTE_CONTENT_RE = /\b(?:src|background|poster)\s*=\s*["']?\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\//i

/** True if the (sanitized) HTML references images or other resources on remote servers. */
export function hasRemoteContent(html: string) {
  return REMOTE_CONTENT_RE.test(html)
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/** Plain-text email -> safe HTML with clickable links. */
export function textToHtml(text: string) {
  const linked = escapeHtml(text).replace(
    /\bhttps?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  )
  return `<pre style="white-space:pre-wrap;word-break:break-word;font:inherit;margin:0">${linked}</pre>`
}
