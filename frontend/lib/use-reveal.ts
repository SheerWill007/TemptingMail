'use client'

import { gsap } from 'gsap'
import { useEffect, type RefObject } from 'react'

/** Fades in `.reveal` descendants of `ref` (staggered). Re-runs when `deps` change. */
export function useReveal(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = root.querySelectorAll<HTMLElement>('.reveal')
    if (!targets.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(targets, { opacity: 1 })
      return
    }
    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' },
    )
    return () => {
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
