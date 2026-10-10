'use client'

import { ArrowLeft, Check, Copy, Inbox as InboxIcon, Paperclip, RefreshCw, Timer, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout'
import { api, ApiError } from '@/lib/api'
import { parseSender, timeAgo, timeLeft } from '@/lib/format'
import { forgetMailbox, isValidUsername, rememberMailbox, safeDecode, useMailConfig } from '@/lib/mailbox'
import { trackEvent } from '@/lib/posthog'
import type { Inbox } from '@/lib/types'
import { useReveal } from '@/lib/use-reveal'
import { cn } from '@/lib/utils'

const POLL_INTERVAL_MS = 10_000

export default function MailboxPage() {
  const params = useParams<{ username: string }>()
  const username = safeDecode(params.username).toLowerCase()
  const valid = isValidUsername(username)
  const router = useRouter()
  const config = useMailConfig()

  const [inbox, setInbox] = useState<Inbox | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const knownIds = useRef<Set<string> | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const address = inbox?.address ?? (config ? `${username}@${config.domain}` : null)

  const load = useCallback(async () => {
    try {
      const data = await api.inbox(username)
      // Announce messages that arrived since the previous poll.
      if (knownIds.current) {
        const fresh = data.messages.filter((m) => !knownIds.current!.has(m.id))
        if (fresh.length === 1) toast.success(`New email from ${parseSender(fresh[0]!.from).name}`)
        else if (fresh.length > 1) toast.success(`${fresh.length} new emails`)
      }
      knownIds.current = new Set(data.messages.map((m) => m.id))
      setInbox(data)
      setError(null)
      setNow(Date.now())
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load emails.')
    }
  }, [username])

  // Open (create or revive) the mailbox, then poll while the tab is visible.
  useEffect(() => {
    if (!valid) return
    let cancelled = false
    rememberMailbox(username)

    api
      .createMailbox(username)
      .catch(() => {
        // Rate limited or offline: mail is still delivered and the inbox can still be read.
      })
      .finally(() => {
        if (!cancelled) void load()
      })

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void load()
    }, POLL_INTERVAL_MS)
    const onVisible = () => document.visibilityState === 'visible' && void load()
    document.addEventListener('visibilitychange', onVisible)
    const clock = setInterval(() => setNow(Date.now()), 30_000)

    return () => {
      cancelled = true
      clearInterval(timer)
      clearInterval(clock)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [username, valid, load])

  useReveal(listRef, [inbox?.messages.length ?? -1])

  async function handleRefresh() {
    setRefreshing(true)
    trackEvent('manual_refresh')
    await load()
    setRefreshing(false)
  }

  async function handleCopy() {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Email copied to clipboard')
      trackEvent('email_copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not access the clipboard')
    }
  }

  async function handleDeleteInbox() {
    if (!window.confirm(`Delete ${address} and all of its messages? This cannot be undone.`)) return
    try {
      await api.deleteMailbox(username)
      forgetMailbox(username)
      toast.success('Mailbox deleted')
      router.push('/')
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to delete mailbox')
    }
  }

  if (!valid) {
    return (
      <PageShell className="flex items-center justify-center">
        <div className="glass max-w-md space-y-4 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold">Invalid mailbox name</h1>
          <p className="text-white/70">
            Names may contain letters, numbers, dots, dashes and underscores, and must start and end with a letter or
            number.
          </p>
          <Link href="/" className="solid-button">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
        </div>
      </PageShell>
    )
  }

  const remaining = inbox?.expiresAt ? timeLeft(inbox.expiresAt, now) : null
  const messages = inbox?.messages ?? []

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="size-4" /> Back to Home
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h1 className="text-4xl font-bold text-white md:text-5xl">Your Mailbox</h1>
              {remaining && (
                <p className="flex items-center gap-1.5 text-sm text-white/60" title={new Date(inbox!.expiresAt!).toLocaleString()}>
                  <Timer className="size-4" /> Expires in {remaining}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="glass min-w-0 flex-1 rounded-xl px-4 py-3 shadow-none">
                <p className="truncate font-mono text-sm text-white md:text-base">{address ?? '…'}</p>
              </div>
              <button onClick={handleCopy} className="glass-button" disabled={!address} aria-label="Copy address">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button onClick={handleRefresh} disabled={refreshing} className="glass-button" aria-label="Refresh">
                <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button onClick={handleDeleteInbox} className="glass-button hover:bg-red-500/30" aria-label="Delete mailbox">
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
            <p className="flex items-center gap-2 text-xs text-white/50">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-400" />
              </span>
              Checking for new mail automatically
            </p>
          </div>
        </div>

        <div ref={listRef} className="space-y-4" aria-live="polite">
          {!inbox && !error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="size-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p className="text-white/60">Loading emails…</p>
            </div>
          ) : error && !inbox ? (
            <div className="glass space-y-4 rounded-2xl p-8 text-center">
              <p className="text-white/80">{error}</p>
              <button onClick={handleRefresh} className="glass-button">
                <RefreshCw className="size-4" /> Try again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-20">
              <div className="glass flex size-16 items-center justify-center rounded-2xl shadow-none">
                <InboxIcon className="size-8 text-white/40" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-xl font-semibold text-white">No emails yet</p>
                <p className="text-white/60">Messages sent to this address will appear here automatically.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const sender = parseSender(message.from)
              return (
                <Link
                  key={message.id}
                  href={`/mailbox/${encodeURIComponent(username)}/message/${encodeURIComponent(message.id)}`}
                  className="reveal block"
                >
                  <article
                    className={cn(
                      'glass space-y-2 rounded-2xl p-6 transition-all hover:bg-white/15',
                      !message.isRead && 'border-white/40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-2">
                        {!message.isRead && <span className="size-2 shrink-0 rounded-full bg-sky-400" aria-label="Unread" />}
                        <p className={cn('truncate text-white', !message.isRead ? 'font-semibold' : 'text-white/80')}>
                          {sender.name}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap text-white/60">
                        {message.hasAttachments && <Paperclip className="size-4" aria-label="Has attachments" />}
                        <time dateTime={message.createdAt} title={new Date(message.createdAt).toLocaleString()}>
                          {timeAgo(message.createdAt, now)}
                        </time>
                      </span>
                    </div>
                    <h2 className={cn('line-clamp-1 text-lg text-white', !message.isRead && 'font-semibold')}>
                      {message.subject || '(No Subject)'}
                    </h2>
                    {message.preview && <p className="line-clamp-2 text-sm text-white/70">{message.preview}</p>}
                  </article>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </PageShell>
  )
}
