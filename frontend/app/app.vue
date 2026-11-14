<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

useHead({ titleTemplate: (title) => (title && !title.startsWith('Temp Mail') ? `${title} · Temp Mail` : title || '') })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster theme="dark" position="bottom-right" rich-colors />
</template>
