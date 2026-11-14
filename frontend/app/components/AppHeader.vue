<script setup lang="ts">
import { Mail } from '@lucide/vue'
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 text-2xl font-bold text-white transition-colors hover:text-white/80"
      >
        <Mail class="size-6" aria-hidden="true" />
        TempMail
      </NuxtLink>
      <nav>
        <NuxtLink to="/about" class="font-medium text-white/80 transition-colors hover:text-white">About</NuxtLink>
      </nav>
    </div>
  </header>
</template>
