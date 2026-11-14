<script setup lang="ts">
import type { NuxtError } from '#app'
import { Home, Mail, RefreshCw } from '@lucide/vue'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

useHead({ title: notFound.value ? 'Page Not Found' : 'Error' })
</script>

<template>
  <NuxtLayout>
    <div class="flex flex-1 items-center justify-center">
      <div class="glass max-w-md space-y-6 rounded-2xl p-10 text-center">
        <template v-if="notFound">
          <div class="mx-auto flex size-20 items-center justify-center rounded-full bg-white/10">
            <Mail class="size-10 text-white/70" />
          </div>
          <div class="space-y-2">
            <h1 class="text-6xl font-bold text-white">404</h1>
            <h2 class="text-2xl font-semibold text-white/80">Page Not Found</h2>
            <p class="text-white/60">The page you're looking for doesn't exist or has expired.</p>
          </div>
          <button class="solid-button" @click="clearError({ redirect: '/' })"><Home class="size-4" /> Go Home</button>
        </template>
        <template v-else>
          <h1 class="text-2xl font-bold text-white">Something went wrong</h1>
          <p class="text-white/60">An unexpected error occurred. Please try again.</p>
          <button class="solid-button" @click="clearError({ redirect: '/' })">
            <RefreshCw class="size-4" /> Try again
          </button>
        </template>
      </div>
    </div>
  </NuxtLayout>
</template>
