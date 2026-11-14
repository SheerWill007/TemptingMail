import { api } from '~/utils/api'
import type { MailConfig } from '~/utils/types'

let configPromise: Promise<MailConfig> | null = null

/** Public service config (mail domain, TTL) from the API, fetched once per page load. */
export function useMailConfig() {
  const runtime = useRuntimeConfig()
  const config = ref<MailConfig | null>(null)

  onMounted(() => {
    configPromise ??= api.config().catch(() => {
      configPromise = null
      return { domain: runtime.public.mailDomain, ttlHours: 24, maxMessageBytes: 10 * 1024 * 1024 }
    })
    void configPromise.then((c) => (config.value = c))
  })

  return config
}

/**
 * URL for things the browser fetches outside of JSON calls: live event streams and downloads.
 * They go straight to the backend when NUXT_PUBLIC_API_BASE is set, avoiding serverless limits on
 * long-lived and large responses; otherwise they use the same-origin proxy.
 */
export function useDirectApiUrl() {
  const base = String(useRuntimeConfig().public.apiBase || '').replace(/\/+$/, '')
  return (path: string) => `${base}${path}`
}
