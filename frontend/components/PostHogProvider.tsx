'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Only initialize if PostHog key is provided
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    
    if (typeof window !== 'undefined' && posthogKey && !posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') console.log('PostHog initialized')
        }
      })
    } else if (!posthogKey && process.env.NODE_ENV === 'development') {
      console.log('PostHog not initialized: NEXT_PUBLIC_POSTHOG_KEY not found')
    }
  }, [])

  useEffect(() => {
    if (pathname && posthog.__loaded) {
      posthog.capture('$pageview')
    }
  }, [pathname])

  return <>{children}</>
}
