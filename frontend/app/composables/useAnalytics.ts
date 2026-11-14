import posthog from 'posthog-js'

/** Optional analytics. A no-op unless NUXT_PUBLIC_POSTHOG_KEY is set. Never pass addresses or content. */
export function trackEvent(eventName: string, properties?: Record<string, string | number | boolean>) {
  if (import.meta.server || !posthog.__loaded) return
  try {
    posthog.capture(eventName, properties)
  } catch (error) {
    if (import.meta.dev) console.warn('PostHog tracking failed:', error)
  }
}
