<script setup lang="ts">
import { ArrowLeft, ArrowRight, CheckCircle, Heart, Lock, Shield, Zap } from '@lucide/vue'

useHead({ title: 'About' })

const root = ref<HTMLElement | null>(null)
useReveal(root)

const problems = [
  'Testing services without commitment',
  'Downloading resources behind email gates',
  'Avoiding spam from promotional newsletters',
  'One-time verifications and signups',
]

const features = [
  {
    icon: Zap,
    title: 'Instant Email',
    description: 'Create disposable addresses in seconds. No registration required.',
  },
  { icon: Shield, title: 'Privacy First', description: 'Keep your real email safe from spam and data breaches.' },
  { icon: Lock, title: 'Auto Cleanup', description: 'Messages deleted after 24 hours. Zero digital footprint.' },
  { icon: Heart, title: 'Free Forever', description: 'No premium tiers, no hidden costs. Built to help.' },
]
</script>

<template>
  <div ref="root" class="mx-auto w-full max-w-4xl space-y-16">
    <div class="reveal">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
        <ArrowLeft class="size-4" /> <span>Back to Home</span>
      </NuxtLink>
    </div>

    <div class="reveal space-y-4 text-center">
      <h1 class="text-5xl font-bold text-white md:text-6xl">Why Temp Mail?</h1>
      <p class="mx-auto max-w-2xl text-xl text-white/70">
        A simple solution to protect your privacy online without sacrificing convenience.
      </p>
    </div>

    <section class="reveal space-y-6">
      <h2 class="text-3xl font-bold text-white">The Problem</h2>
      <div class="glass space-y-4 rounded-2xl p-8 shadow-none">
        <p class="text-lg text-white/80">
          Every day, you're asked for your email address for things you don't care about:
        </p>
        <ul class="space-y-3">
          <li v-for="item in problems" :key="item" class="flex items-start gap-3 text-white/80">
            <CheckCircle class="mt-0.5 size-5 shrink-0 text-green-400" />
            <span>{{ item }}</span>
          </li>
        </ul>
        <p class="pt-4 text-lg text-white/80">The result? Your inbox becomes a graveyard of spam and security risks.</p>
      </div>
    </section>

    <section class="reveal space-y-6">
      <h2 class="text-3xl font-bold text-white">Our Solution</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <div v-for="feature in features" :key="feature.title" class="glass space-y-3 rounded-2xl p-6 shadow-none">
          <div class="flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
            <component :is="feature.icon" class="size-6 text-white" />
          </div>
          <h3 class="text-xl font-semibold text-white">{{ feature.title }}</h3>
          <p class="text-white/70">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <section class="reveal space-y-6">
      <h2 class="text-3xl font-bold text-white">Our Mission</h2>
      <div class="glass space-y-4 rounded-2xl p-8 shadow-none">
        <p class="text-lg text-white/80">
          We believe privacy should be accessible to everyone. Temp Mail was created to give you control over your
          digital identity without requiring technical knowledge.
        </p>
        <p class="text-lg text-white/80">
          This is a community-driven project built with transparency and privacy at its core. We don't track you, we
          don't sell your data, and we don't ask for personal information.
        </p>
      </div>
    </section>

    <div class="reveal pt-8 text-center">
      <NuxtLink to="/" class="solid-button px-8 py-4 text-lg">
        <span>Create Your Email</span> <ArrowRight class="size-5" />
      </NuxtLink>
    </div>
  </div>
</template>
