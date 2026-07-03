import { useEffect } from "react"
import { gsap } from "gsap"

/**
 * Hook to animate page entrance
 */
export function usePageEntrance() {
  useEffect(() => {
    gsap.fromTo(
      "main",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    )
  }, [])
}

/**
 * Animate element on scroll
 */
export function animateOnScroll(element: HTMLElement, options?: gsap.TweenVars) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            entry.target,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              ...options
            }
          )
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  observer.observe(element)
  return () => observer.disconnect()
}

/**
 * Stagger animation for multiple elements
 */
export function staggerAnimation(elements: NodeListOf<Element> | Element[], options?: gsap.TweenVars) {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      ...options
    }
  )
}

/**
 * Button click animation
 */
export function animateButtonClick(element: HTMLElement) {
  gsap.timeline()
    .to(element, { scale: 0.95, duration: 0.1, ease: "power2.out" })
    .to(element, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.3)" })
}

/**
 * Card hover animation
 */
export function setupCardHover(element: HTMLElement) {
  const handleMouseEnter = () => {
    gsap.to(element, {
      y: -5,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      duration: 0.3,
      ease: "power2.out"
    })
  }

  const handleMouseLeave = () => {
    gsap.to(element, {
      y: 0,
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      duration: 0.3,
      ease: "power2.out"
    })
  }

  element.addEventListener("mouseenter", handleMouseEnter)
  element.addEventListener("mouseleave", handleMouseLeave)

  return () => {
    element.removeEventListener("mouseenter", handleMouseEnter)
    element.removeEventListener("mouseleave", handleMouseLeave)
  }
}
