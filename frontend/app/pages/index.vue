<script setup lang="ts">
import { ArrowRight, Clock, History, LoaderCircle, Mail, Shield, Shuffle } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { api, ApiError } from '~/utils/api'
import { cleanUsernameInput, getRecentMailboxes, isValidUsername, rememberMailbox } from '~/utils/username'

const FEATURES = [
  { icon: Mail, title: 'Instant Setup', text: 'Pick any name or get a random one. Ready in a second.' },
  { icon: Shield, title: 'Privacy First', text: 'No sign-up, no tracking, remote images blocked by default.' },
  { icon: Clock, title: 'Auto Cleanup', text: 'Mailboxes and messages self-destruct after 24 hours.' },
]

const config = useMailConfig()
const username = ref('')
const pending = ref<'custom' | 'random' | null>(null)
const recent = ref<string[]>([])
const root = ref<HTMLElement | null>(null)
useReveal(root)

// localStorage is only available in the browser.
onMounted(() => (recent.value = getRecentMailboxes()))

const valid = computed(() => isValidUsername(username.value))
const domain = computed(() => config.value?.domain ?? '…')

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  username.value = cleanUsernameInput(input.value)
  // Keep the field in sync when cleaning removed characters but the model value didn't change.
  input.value = username.value
}

async function open(kind: 'custom' | 'random') {
  if (pending.value) return
  if (kind === 'custom' && !valid.value) {
    toast.error('Please enter a valid username', {
      description: 'Letters, numbers, dots, dashes and underscores. Must start and end with a letter or number.',
    })
    return
  }
  pending.value = kind
  try {
    const mailbox = await api.createMailbox(kind === 'custom' ? username.value : undefined)
    trackEvent('mailbox_opened', { kind })
    rememberMailbox(mailbox.username)
    await navigateTo(`/mailbox/${encodeURIComponent(mailbox.username)}`)
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'Failed to create mailbox. Please try again.')
    if (error instanceof ApiError && error.status === 429) trackEvent('rate_limit_hit', { endpoint: 'mailboxes' })
    pending.value = null
  }
}
</script>

<template>
  <div class="flex flex-1 items-center justify-center py-12">
    <div ref="root" class="mx-auto w-full max-w-4xl space-y-8 text-center">
      <div class="reveal space-y-4">
        <h1 class="text-5xl font-bold tracking-tight text-white md:text-7xl">
          Temporary Email.<br />
          <span class="text-white/60">Zero Commitment.</span>
        </h1>
        <p class="mx-auto max-w-2xl text-xl text-white/70 md:text-2xl">
          Create disposable email addresses instantly. No registration required.
        </p>
      </div>

      <form class="reveal mx-auto max-w-2xl space-y-4" @submit.prevent="open('custom')">
        <div class="glass flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center">
          <label for="username" class="sr-only">Username</label>
          <div class="flex min-w-0 flex-1 items-center px-4">
            <input
              id="username"
              type="text"
              :value="username"
              placeholder="your-name"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              maxlength="64"
              class="min-w-0 flex-1 bg-transparent py-4 text-lg font-medium text-white outline-none placeholder:text-white/40"
              @input="onInput"
            />
            <span class="hidden shrink-0 truncate text-lg text-white/50 sm:inline">@{{ domain }}</span>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              :disabled="pending !== null"
              class="glass-button flex-1 py-4 sm:flex-none"
              title="Generate a random address"
              @click="open('random')"
            >
              <LoaderCircle v-if="pending === 'random'" class="size-5 animate-spin" />
              <Shuffle v-else class="size-5" />
              <span class="sm:sr-only">Random</span>
            </button>
            <button type="submit" :disabled="!valid || pending !== null" class="solid-button flex-1 py-4 sm:flex-none">
              <LoaderCircle v-if="pending === 'custom'" class="size-5 animate-spin" />
              <template v-else>Create <ArrowRight class="size-5" /></template>
            </button>
          </div>
        </div>

        <p class="text-sm text-white/70 drop-shadow-md">
          Your email will be: <span class="font-semibold break-all text-white">{{ username || 'username' }}</span
          >@{{ domain }}
        </p>

        <div v-if="recent.length" class="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm">
          <History class="size-4 text-white/50" aria-label="Recent mailboxes" />
          <NuxtLink
            v-for="name in recent"
            :key="name"
            :to="`/mailbox/${encodeURIComponent(name)}`"
            class="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            {{ name }}
          </NuxtLink>
        </div>
      </form>

      <div class="mx-auto grid max-w-3xl gap-6 pt-12 md:grid-cols-3">
        <div v-for="feature in FEATURES" :key="feature.title" class="reveal space-y-3 text-center">
          <div class="glass mx-auto flex size-12 items-center justify-center rounded-xl shadow-none">
            <component :is="feature.icon" class="size-6 text-white" />
          </div>
          <h2 class="font-semibold text-white">{{ feature.title }}</h2>
          <p class="text-sm text-white/60">{{ feature.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
