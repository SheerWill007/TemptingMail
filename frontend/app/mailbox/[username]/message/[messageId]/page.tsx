'use client'

import { ArrowLeft, Code, Download, FileText, ImageOff, Paperclip, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EmailFrame } from '@/components/EmailFrame'
import { PageShell } from '@/components/layout'
import { api, ApiError, apiUrl } from '@/lib/api'
import { formatBytes, parseSender } from '@/lib/format'
import { safeDecode } from '@/lib/mailbox'
import { trackEvent } from '@/lib/posthog'
import { hasRemoteContent, sanitizeEmailHtml, textToHtml } from '@/lib/sanitize-html'
import type { MessageDetail } from '@/lib/types'
import { cn } from '@/lib/utils'

type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; message: MessageDetail }

export default function MessagePage() {
  const params = useParams<{ username: string; messageId: string }>()
  const username = safeDecode(params.username).toLowerCase()
  const messageId = safeDecode(params.messageId)
  const router = useRouter()
  const inboxHref = `/mailbox/${encodeURIComponent(username)}`

  const [state, setState] = useState<State>({ status: 'loading' })
  const [view, setView] = useState<'html' | 'text'>('html')
  const [showRemote, setShowRemote] = useState(false)

  useEffect(() => {
    let active = true
    api
      .message(username, messageId)
      .then((message) => {
        if (!active) return
        setState({ status: 'ready', message })
        if (!message.html) setView('text')
        trackEvent('message_opened', { has_html: Boolean(message.html), attachments: message.attachments.length })
      })
      .catch((e) => {
        if (active) setState({ status: 'error', message: e instanceof ApiError ? e.message : 'Failed to load message' })
      })
    return () => {
      active = false
    }
  }, [username, messageId])

  const message = state.status === 'ready' ? state.message : null

  const body = useMemo(() => {
    if (!message) return null
    if (view === 'html' && message.html) {
      const clean = sanitizeEmailHtml(message.html)
      return { html: clean, remote: hasRemoteContent(clean) }
    }
    return { html: textToHtml(message.text || '(This message has no text content.)'), remote: false }
  }, [message, view])

  async function handleDelete() {
    try {
      await api.deleteMessage(username, messageId)
      toast.success('Message deleted')
      router.push(inboxHref)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to delete message')
    }
  }

  if (!message) {
    return (
      <PageShell className="flex items-center justify-center">
        {state.status === 'loading' ? (
          <div className="flex flex-col items-center gap-3">
            <div className="size-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-white/60">Loading message…</p>
          </div>
        ) : (
          <div className="glass space-y-4 rounded-2xl p-8 text-center">
            <p className="text-xl text-white">{state.status === 'error' ? state.message : 'Message not found'}</p>
            <p className="text-sm text-white/60">It may have expired or been deleted.</p>
            <Link href={inboxHref} className="solid-button">
              <ArrowLeft className="size-4" /> Back to Mailbox
            </Link>
          </div>
        )}
      </PageShell>
    )
  }

  const sender = parseSender(message.from)
  const files = message.attachments.filter((a) => !a.inline)

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={inboxHref} className="inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="size-4" /> Back to Mailbox
          </Link>
          <div className="flex gap-2">
            <a href={apiUrl(message.rawUrl)} className="glass-button px-3 py-2 text-sm" download>
              <Download className="size-4" /> .eml
            </a>
            <button onClick={handleDelete} className="glass-button px-3 py-2 text-sm hover:bg-red-500/30">
              <Trash2 className="size-4" /> Delete
            </button>
          </div>
        </div>

        <article className="glass overflow-hidden rounded-2xl">
          <header className="space-y-4 border-b border-white/10 p-6 md:p-8">
            <h1 className="text-2xl font-bold break-words text-white md:text-3xl">{message.subject || '(No Subject)'}</h1>
            <dl className="grid grid-cols-[4rem_1fr] gap-x-2 gap-y-2 text-sm">
              <dt className="text-white/50">From</dt>
              <dd className="min-w-0 break-words text-white/80">
                <span className="font-medium text-white">{sender.name}</span>
                {sender.email !== sender.name && <span className="text-white/60"> &lt;{sender.email}&gt;</span>}
              </dd>
              <dt className="text-white/50">To</dt>
              <dd className="min-w-0 break-words text-white/80">{message.to}</dd>
              <dt className="text-white/50">Date</dt>
              <dd className="text-white/80">{new Date(message.date).toLocaleString()}</dd>
            </dl>
          </header>

          <div className="space-y-4 p-4 md:p-6">
            {(message.html || body?.remote) && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                {message.html ? (
                  <div className="inline-flex rounded-xl border border-white/20 bg-white/5 p-1 text-sm" role="tablist">
                    {(['html', 'text'] as const).map((v) => (
                      <button
                        key={v}
                        role="tab"
                        aria-selected={view === v}
                        onClick={() => setView(v)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors',
                          view === v ? 'bg-white text-black' : 'text-white/70 hover:text-white',
                        )}
                      >
                        {v === 'html' ? <Code className="size-4" /> : <FileText className="size-4" />}
                        {v === 'html' ? 'HTML' : 'Plain text'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span />
                )}
                {body?.remote && !showRemote && (
                  <button onClick={() => setShowRemote(true)} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
                    <ImageOff className="size-4" /> Remote images blocked · <span className="underline">Show images</span>
                  </button>
                )}
              </div>
            )}

            {body && (
              <EmailFrame
                key={`${view}-${showRemote}`}
                html={body.html}
                allowRemote={showRemote}
                title={message.subject || 'Email content'}
              />
            )}
          </div>

          {files.length > 0 && (
            <footer className="space-y-3 border-t border-white/10 p-6 md:p-8">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Paperclip className="size-4" /> {files.length} attachment{files.length > 1 ? 's' : ''}
              </h2>
              <ul className="flex flex-wrap gap-3">
                {files.map((file) => (
                  <li key={file.index}>
                    <a
                      href={`${apiUrl(file.url)}?download`}
                      download={file.filename}
                      className="glass-button max-w-xs px-3 py-2 text-sm"
                    >
                      <Download className="size-4 shrink-0" />
                      <span className="truncate">{file.filename}</span>
                      <span className="shrink-0 text-white/50">{formatBytes(file.size)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </footer>
          )}
        </article>
      </div>
    </PageShell>
  )
}
