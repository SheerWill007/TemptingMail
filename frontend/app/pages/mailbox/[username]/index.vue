<script setup lang="ts">
import { ArrowLeft, Check, Copy, Inbox as InboxIcon, Paperclip, RefreshCw, Timer, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { api, ApiError, mailboxPath } from '~/utils/api'
import { parseSender, timeAgo, timeLeft } from '~/utils/format'
import type { Inbox } from '~/utils/types'
import { forgetMailbox, isValidUsername, rememberMailbox, safeDecode } from '~/utils/username'

const POLL_INTERVAL_MS = 10_000
/** With a live connection, refetch every 6th tick (60 s) in case an event was missed. */
const LIVE_SAFETY_TICKS = 6

useHead({ title: 'Mailbox', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const username = computed(() => safeDecode(String(route.params.username ?? '')).toLowerCase())
const valid = computed(() => isValidUsername(username.value))
const config = useMailConfig()
const directUrl = useDirectApiUrl()

const inbox = ref<Inbox | null>(null)
const error = ref<string | null>(null)
const refreshing = ref(false)
const copied = ref(false)
const now = ref(Date.now())
const live = ref(false)
let knownIds: Set<string> | null = null
const list = ref<HTMLElement | null>(null)

const address = computed(
  () => inbox.value?.address ?? (config.value ? `${username.value}@${config.value.domain}` : null),
)
const remaining = computed(() => (inbox.value?.expiresAt ? timeLeft(inbox.value.expiresAt, now.value) : null))
const messages = computed(() => inbox.value?.messages ?? [])

useReveal(list, () => messages.value.length)

async function load() {
  try {
    const data = await api.inbox(username.value)
    // Announce messages that arrived since the previous poll.
    if (knownIds) {
      const fresh = data.messages.filter((m) => !knownIds!.has(m.id))
      if (fresh.length === 1) toast.success(`New email from ${parseSender(fresh[0]!.from).name}`)
      else if (fresh.length > 1) toast.success(`${fresh.length} new emails`)
    }
    knownIds = new Set(data.messages.map((m) => m.id))
    inbox.value = data
    error.value = null
    now.value = Date.now()
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Failed to load emails.'
  }
}

// Open (create or revive) the mailbox, subscribe to live events, and keep polling as a fallback.
let source: EventSource | null = null
let timer: ReturnType<typeof setInterval> | undefined
let clock: ReturnType<typeof setInterval> | undefined
const onVisible = () => document.visibilityState === 'visible' && void load()

onMounted(() => {
  if (!valid.value) return
  rememberMailbox(username.value)

  api
    .createMailbox(username.value)
    .catch(() => {
      // Rate limited or offline: mail is still delivered and the inbox can still be read.
    })
    .finally(() => void load())

  // Server-Sent Events: the browser reconnects automatically after transient failures.
  if (typeof EventSource !== 'undefined') {
    source = new EventSource(directUrl(`${mailboxPath(username.value)}/events`))
    source.onopen = () => (live.value = true)
    source.onerror = () => (live.value = false)
    source.addEventListener('message', () => void load())
  }

  let ticks = 0
  timer = setInterval(() => {
    ticks += 1
    if (document.visibilityState !== 'visible') return
    // While live, poll only occasionally as a safety net.
    if (!live.value || ticks % LIVE_SAFETY_TICKS === 0) void load()
  }, POLL_INTERVAL_MS)
  document.addEventListener('visibilitychange', onVisible)
  clock = setInterval(() => (now.value = Date.now()), 30_000)
})

onBeforeUnmount(() => {
  source?.close()
  clearInterval(timer)
  clearInterval(clock)
  document.removeEventListener('visibilitychange', onVisible)
})

async function handleRefresh() {
  refreshing.value = true
  trackEvent('manual_refresh')
  await load()
  refreshing.value = false
}

async function handleCopy() {
  if (!address.value) return
  try {
    await navigator.clipboard.writeText(address.value)
    copied.value = true
    toast.success('Email copied to clipboard')
    trackEvent('email_copied')
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.error('Could not access the clipboard')
  }
}

async function handleDeleteInbox() {
  if (!window.confirm(`Delete ${address.value} and all of its messages? This cannot be undone.`)) return
  try {
    await api.deleteMailbox(username.value)
    forgetMailbox(username.value)
    toast.success('Mailbox deleted')
    await navigateTo('/')
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Failed to delete mailbox')
  }
}

const messageHref = (id: string) => `/mailbox/${encodeURIComponent(username.value)}/message/${encodeURIComponent(id)}`
</script>

<template>
  <div v-if="!valid" class="flex flex-1 items-center justify-center">
    <div class="glass max-w-md space-y-4 rounded-2xl p-8 text-center">
      <h1 class="text-2xl font-bold">Invalid mailbox name</h1>
      <p class="text-white/70">
        Names may contain letters, numbers, dots, dashes and underscores, and must start and end with a letter or
        number.
      </p>
      <NuxtLink to="/" class="solid-button"><ArrowLeft class="size-4" /> Back to home</NuxtLink>
    </div>
  </div>

  <div v-else class="mx-auto w-full max-w-5xl space-y-8">
    <div class="space-y-6">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white">
        <ArrowLeft class="size-4" /> Back to Home
      </NuxtLink>

      <div class="space-y-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <h1 class="text-4xl font-bold text-white md:text-5xl">Your Mailbox</h1>
          <p
            v-if="remaining"
            class="flex items-center gap-1.5 text-sm text-white/60"
            :title="new Date(inbox!.expiresAt!).toLocaleString()"
          >
            <Timer class="size-4" /> Expires in {{ remaining }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="glass min-w-0 flex-1 rounded-xl px-4 py-3 shadow-none">
            <p class="truncate font-mono text-sm text-white md:text-base">{{ address ?? '…' }}</p>
          </div>
          <button class="glass-button" :disabled="!address" aria-label="Copy address" @click="handleCopy">
            <Check v-if="copied" class="size-4" />
            <Copy v-else class="size-4" />
            <span class="hidden sm:inline">{{ copied ? 'Copied' : 'Copy' }}</span>
          </button>
          <button :disabled="refreshing" class="glass-button" aria-label="Refresh" @click="handleRefresh">
            <RefreshCw :class="['size-4', refreshing && 'animate-spin']" />
            <span class="hidden sm:inline">Refresh</span>
          </button>
          <button class="glass-button hover:bg-red-500/30" aria-label="Delete mailbox" @click="handleDeleteInbox">
            <Trash2 class="size-4" />
            <span class="hidden sm:inline">Delete</span>
          </button>
        </div>
        <p class="flex items-center gap-2 text-xs text-white/50" role="status">
          <span class="relative flex size-2">
            <span
              v-if="live"
              class="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"
            />
            <span :class="['relative inline-flex size-2 rounded-full', live ? 'bg-green-400' : 'bg-amber-400']" />
          </span>
          {{ live ? 'Live: new mail appears instantly' : 'Checking for new mail every 10 seconds' }}
        </p>
      </div>
    </div>

    <div ref="list" class="space-y-4" aria-live="polite">
      <div v-if="!inbox && !error" class="flex flex-col items-center justify-center gap-3 py-20">
        <div class="size-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p class="text-white/60">Loading emails…</p>
      </div>

      <div v-else-if="error && !inbox" class="glass space-y-4 rounded-2xl p-8 text-center">
        <p class="text-white/80">{{ error }}</p>
        <button class="glass-button" @click="handleRefresh"><RefreshCw class="size-4" /> Try again</button>
      </div>

      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center space-y-4 py-20">
        <div class="glass flex size-16 items-center justify-center rounded-2xl shadow-none">
          <InboxIcon class="size-8 text-white/40" />
        </div>
        <div class="space-y-2 text-center">
          <p class="text-xl font-semibold text-white">No emails yet</p>
          <p class="text-white/60">Messages sent to this address will appear here automatically.</p>
        </div>
      </div>

      <template v-else>
        <NuxtLink v-for="message in messages" :key="message.id" :to="messageHref(message.id)" class="reveal block">
          <article
            :class="[
              'glass space-y-2 rounded-2xl p-6 transition-all hover:bg-white/15',
              !message.isRead && 'border-white/40',
            ]"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-2">
                <span v-if="!message.isRead" class="size-2 shrink-0 rounded-full bg-sky-400" aria-label="Unread" />
                <p :class="['truncate text-white', !message.isRead ? 'font-semibold' : 'text-white/80']">
                  {{ parseSender(message.from).name }}
                </p>
              </div>
              <span class="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap text-white/60">
                <Paperclip v-if="message.hasAttachments" class="size-4" aria-label="Has attachments" />
                <time :datetime="message.createdAt" :title="new Date(message.createdAt).toLocaleString()">
                  {{ timeAgo(message.createdAt, now) }}
                </time>
              </span>
            </div>
            <h2 :class="['line-clamp-1 text-lg text-white', !message.isRead && 'font-semibold']">
              {{ message.subject || '(No Subject)' }}
            </h2>
            <p v-if="message.preview" class="line-clamp-2 text-sm text-white/70">{{ message.preview }}</p>
          </article>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
