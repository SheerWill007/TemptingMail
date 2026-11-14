<script setup lang="ts">
import { ArrowLeft, Code, Download, FileText, ImageOff, Paperclip, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { api, ApiError } from '~/utils/api'
import { formatBytes, parseSender } from '~/utils/format'
import { hasRemoteContent, sanitizeEmailHtml, textToHtml } from '~/utils/sanitize-html'
import type { MessageDetail } from '~/utils/types'
import { safeDecode } from '~/utils/username'

useHead({ title: 'Message', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const username = computed(() => safeDecode(String(route.params.username ?? '')).toLowerCase())
const messageId = computed(() => safeDecode(String(route.params.messageId ?? '')))
const inboxHref = computed(() => `/mailbox/${encodeURIComponent(username.value)}`)
const directUrl = useDirectApiUrl()

const status = ref<'loading' | 'error' | 'ready'>('loading')
const errorMessage = ref('')
const message = ref<MessageDetail | null>(null)
const view = ref<'html' | 'text'>('html')
const showRemote = ref(false)

onMounted(async () => {
  try {
    const data = await api.message(username.value, messageId.value)
    message.value = data
    status.value = 'ready'
    if (!data.html) view.value = 'text'
    trackEvent('message_opened', { has_html: Boolean(data.html), attachments: data.attachments.length })
  } catch (e) {
    status.value = 'error'
    errorMessage.value = e instanceof ApiError ? e.message : 'Failed to load message'
  }
})

const body = computed(() => {
  const m = message.value
  if (!m) return null
  if (view.value === 'html' && m.html) {
    const clean = sanitizeEmailHtml(m.html)
    return { html: clean, remote: hasRemoteContent(clean) }
  }
  return { html: textToHtml(m.text || '(This message has no text content.)'), remote: false }
})

const sender = computed(() => (message.value ? parseSender(message.value.from) : null))
const files = computed(() => message.value?.attachments.filter((a) => !a.inline) ?? [])

async function handleDelete() {
  try {
    await api.deleteMessage(username.value, messageId.value)
    toast.success('Message deleted')
    await navigateTo(inboxHref.value)
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Failed to delete message')
  }
}
</script>

<template>
  <div v-if="!message" class="flex flex-1 items-center justify-center">
    <div v-if="status === 'loading'" class="flex flex-col items-center gap-3">
      <div class="size-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      <p class="text-white/60">Loading message…</p>
    </div>
    <div v-else class="glass space-y-4 rounded-2xl p-8 text-center">
      <p class="text-xl text-white">{{ errorMessage || 'Message not found' }}</p>
      <p class="text-sm text-white/60">It may have expired or been deleted.</p>
      <NuxtLink :to="inboxHref" class="solid-button"><ArrowLeft class="size-4" /> Back to Mailbox</NuxtLink>
    </div>
  </div>

  <div v-else class="mx-auto w-full max-w-4xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <NuxtLink :to="inboxHref" class="inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white">
        <ArrowLeft class="size-4" /> Back to Mailbox
      </NuxtLink>
      <div class="flex gap-2">
        <a :href="directUrl(message.rawUrl)" class="glass-button px-3 py-2 text-sm" download>
          <Download class="size-4" /> .eml
        </a>
        <button class="glass-button px-3 py-2 text-sm hover:bg-red-500/30" @click="handleDelete">
          <Trash2 class="size-4" /> Delete
        </button>
      </div>
    </div>

    <article class="glass overflow-hidden rounded-2xl">
      <header class="space-y-4 border-b border-white/10 p-6 md:p-8">
        <h1 class="text-2xl font-bold break-words text-white md:text-3xl">{{ message.subject || '(No Subject)' }}</h1>
        <dl class="grid grid-cols-[4rem_1fr] gap-x-2 gap-y-2 text-sm">
          <dt class="text-white/50">From</dt>
          <dd class="min-w-0 break-words text-white/80">
            <span class="font-medium text-white">{{ sender!.name }}</span>
            <span v-if="sender!.email !== sender!.name" class="text-white/60"> &lt;{{ sender!.email }}&gt;</span>
          </dd>
          <dt class="text-white/50">To</dt>
          <dd class="min-w-0 break-words text-white/80">{{ message.to }}</dd>
          <dt class="text-white/50">Date</dt>
          <dd class="text-white/80">{{ new Date(message.date).toLocaleString() }}</dd>
        </dl>
      </header>

      <div class="space-y-4 p-4 md:p-6">
        <div v-if="message.html || body?.remote" class="flex flex-wrap items-center justify-between gap-3">
          <div
            v-if="message.html"
            class="inline-flex rounded-xl border border-white/20 bg-white/5 p-1 text-sm"
            role="tablist"
          >
            <button
              v-for="v in ['html', 'text'] as const"
              :key="v"
              role="tab"
              :aria-selected="view === v"
              :class="[
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors',
                view === v ? 'bg-white text-black' : 'text-white/70 hover:text-white',
              ]"
              @click="view = v"
            >
              <Code v-if="v === 'html'" class="size-4" />
              <FileText v-else class="size-4" />
              {{ v === 'html' ? 'HTML' : 'Plain text' }}
            </button>
          </div>
          <span v-else />
          <button
            v-if="body?.remote && !showRemote"
            class="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
            @click="showRemote = true"
          >
            <ImageOff class="size-4" /> Remote images blocked · <span class="underline">Show images</span>
          </button>
        </div>

        <EmailFrame
          v-if="body"
          :key="`${view}-${showRemote}`"
          :html="body.html"
          :allow-remote="showRemote"
          :title="message.subject || 'Email content'"
        />
      </div>

      <footer v-if="files.length" class="space-y-3 border-t border-white/10 p-6 md:p-8">
        <h2 class="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Paperclip class="size-4" /> {{ files.length }} attachment{{ files.length > 1 ? 's' : '' }}
        </h2>
        <ul class="flex flex-wrap gap-3">
          <li v-for="file in files" :key="file.index">
            <a
              :href="`${directUrl(file.url)}?download`"
              :download="file.filename"
              class="glass-button max-w-xs px-3 py-2 text-sm"
            >
              <Download class="size-4 shrink-0" />
              <span class="truncate">{{ file.filename }}</span>
              <span class="shrink-0 text-white/50">{{ formatBytes(file.size) }}</span>
            </a>
          </li>
        </ul>
      </footer>
    </article>
  </div>
</template>
