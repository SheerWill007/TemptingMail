"use client"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"

type Props = {
  children: React.ReactNode
}

export default function FloatingCard({ children }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    // Simple fade-in animation on mount only - no floating or parallax
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }
    )
  }, [])

  return (
    <div
      ref={cardRef}
      className="w-full max-w-2xl bg-white/15 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
    >
      {children}
    </div>
  )
}
