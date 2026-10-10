import posthog from 'posthog-js'

/** Optional analytics. A no-op unless NEXT_PUBLIC_POSTHOG_KEY is set. Never pass addresses or content. */
export function trackEvent(eventName: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined' || !posthog.__loaded) return
  try {
    posthog.capture(eventName, properties)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.warn('PostHog tracking failed:', error)
  }
}
