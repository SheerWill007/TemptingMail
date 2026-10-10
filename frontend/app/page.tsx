'use client'

import { ArrowRight, Clock, History, LoaderCircle, Mail, Shield, Shuffle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { PageShell } from '@/components/layout'
import { api, ApiError } from '@/lib/api'
import { cleanUsernameInput, getRecentMailboxes, isValidUsername, rememberMailbox, useMailConfig } from '@/lib/mailbox'
import { trackEvent } from '@/lib/posthog'
import { useReveal } from '@/lib/use-reveal'

const FEATURES = [
  { icon: Mail, title: 'Instant Setup', text: 'Pick any name or get a random one. Ready in a second.' },
  { icon: Shield, title: 'Privacy First', text: 'No sign-up, no tracking, remote images blocked by default.' },
  { icon: Clock, title: 'Auto Cleanup', text: 'Mailboxes and messages self-destruct after 24 hours.' },
]

export default function HomePage() {
  const router = useRouter()
  const config = useMailConfig()
  const [username, setUsername] = useState('')
  const [pending, setPending] = useState<'custom' | 'random' | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  useReveal(rootRef)

  useEffect(() => {
    // localStorage is only available after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(getRecentMailboxes())
  }, [])

  const valid = isValidUsername(username)
  const domain = config?.domain ?? '…'

  async function open(kind: 'custom' | 'random') {
    if (pending) return
    if (kind === 'custom' && !valid) {
      toast.error('Please enter a valid username', {
        description: 'Letters, numbers, dots, dashes and underscores. Must start and end with a letter or number.',
      })
      return
    }
    setPending(kind)
    try {
      const mailbox = await api.createMailbox(kind === 'custom' ? username : undefined)
      trackEvent('mailbox_opened', { kind })
      rememberMailbox(mailbox.username)
      router.push(`/mailbox/${encodeURIComponent(mailbox.username)}`)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create mailbox. Please try again.'
      toast.error(message)
      if (error instanceof ApiError && error.status === 429) trackEvent('rate_limit_hit', { endpoint: 'mailboxes' })
      setPending(null)
    }
  }

  return (
    <PageShell className="flex items-center justify-center py-28">
      <div ref={rootRef} className="mx-auto w-full max-w-4xl space-y-8 text-center">
        <div className="reveal space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
            Temporary Email.
            <br />
            <span className="text-white/60">Zero Commitment.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/70 md:text-2xl">
            Create disposable email addresses instantly. No registration required.
          </p>
        </div>

        <form
          className="reveal mx-auto max-w-2xl space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void open('custom')
          }}
        >
          <div className="glass flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center">
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <div className="flex min-w-0 flex-1 items-center px-4">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(cleanUsernameInput(e.target.value))}
                placeholder="your-name"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={64}
                className="min-w-0 flex-1 bg-transparent py-4 text-lg font-medium text-white outline-none placeholder:text-white/40"
              />
              <span className="hidden shrink-0 truncate text-lg text-white/50 sm:inline">@{domain}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void open('random')}
                disabled={pending !== null}
                className="glass-button flex-1 py-4 sm:flex-none"
                title="Generate a random address"
              >
                {pending === 'random' ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <Shuffle className="size-5" />
                )}
                <span className="sm:sr-only">Random</span>
              </button>
              <button
                type="submit"
                disabled={!valid || pending !== null}
                className="solid-button flex-1 py-4 sm:flex-none"
              >
                {pending === 'custom' ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <>
                    Create <ArrowRight className="size-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-white/70 drop-shadow-md">
            Your email will be: <span className="font-semibold break-all text-white">{username || 'username'}</span>@
            {domain}
          </p>

          {recent.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm">
              <History className="size-4 text-white/50" aria-label="Recent mailboxes" />
              {recent.map((name) => (
                <Link
                  key={name}
                  href={`/mailbox/${encodeURIComponent(name)}`}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {name}
                </Link>
              ))}
            </div>
          )}
        </form>

        <div className="mx-auto grid max-w-3xl gap-6 pt-12 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="reveal space-y-3 text-center">
              <div className="glass mx-auto flex size-12 items-center justify-center rounded-xl shadow-none">
                <Icon className="size-6 text-white" />
              </div>
              <h2 className="font-semibold text-white">{title}</h2>
              <p className="text-sm text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
