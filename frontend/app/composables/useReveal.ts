import { gsap } from 'gsap'
import type { Ref, WatchSource } from 'vue'

/** Fades in `.reveal` descendants of `root` (staggered). Re-runs when `trigger` changes. */
export function useReveal(root: Ref<HTMLElement | null>, trigger?: WatchSource) {
  let tween: gsap.core.Tween | null = null

  function run() {
    tween?.kill()
    const el = root.value
    if (!el) return
    const targets = el.querySelectorAll<HTMLElement>('.reveal')
    if (!targets.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(targets, { opacity: 1 })
      return
    }
    tween = gsap.fromTo(
      targets,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' },
    )
  }

  onMounted(run)
  if (trigger) watch(trigger, () => nextTick(run))
  onBeforeUnmount(() => tween?.kill())
}
