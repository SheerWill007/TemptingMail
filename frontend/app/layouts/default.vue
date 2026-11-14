<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex flex-1 flex-col px-4 pt-24 pb-16">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
