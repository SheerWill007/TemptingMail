import posthog from 'posthog-js'

/** Optional analytics; does nothing unless NUXT_PUBLIC_POSTHOG_KEY is set. */
export default defineNuxtPlugin(() => {
  const { posthogKey, posthogHost } = useRuntimeConfig().public
  if (!posthogKey) return

  posthog.init(String(posthogKey), {
    api_host: String(posthogHost),
    person_profiles: 'identified_only',
    capture_pageview: false,
    autocapture: false,
    disable_session_recording: true,
  })

  // Strip mailbox names and message ids so addresses never reach analytics.
  const capture = (path: string) => {
    const page = path.replace(/^\/mailbox\/[^/]+(\/message\/[^/]+)?/, (_m, msg) =>
      msg ? '/mailbox/:username/message/:id' : '/mailbox/:username',
    )
    posthog.capture('$pageview', { $current_url: `${window.location.origin}${page}` })
  }
  const router = useRouter()
  router.afterEach((to) => capture(to.path))
  capture(router.currentRoute.value.path)
})
