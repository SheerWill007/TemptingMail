'use client'

import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { useEffect } from 'react'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

/** Optional analytics; does nothing unless NEXT_PUBLIC_POSTHOG_KEY is set. */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return
    posthog.init(POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      autocapture: false,
      disable_session_recording: true,
    })
  }, [])

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return
    // Strip mailbox names and message ids so addresses never reach analytics.
    const page = pathname.replace(/^\/mailbox\/[^/]+(\/message\/[^/]+)?/, (_m, msg) =>
      msg ? '/mailbox/:username/message/:id' : '/mailbox/:username',
    )
    posthog.capture('$pageview', { $current_url: `${window.location.origin}${page}` })
  }, [pathname])

  return <>{children}</>
}
