import Lenis from 'lenis'

/** Smooth scrolling, skipped for users who prefer reduced motion. */
export default defineNuxtPlugin(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  requestAnimationFrame(function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  })
})
