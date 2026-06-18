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

    // Initial animation on mount
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power3.out",
      }
    )

    // Floating animation
    gsap.to(cardRef.current, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    })

    // Mouse move parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return

      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      const xPos = (clientX / innerWidth - 0.5) * 20
      const yPos = (clientY / innerHeight - 0.5) * 20

      gsap.to(cardRef.current, {
        rotationY: xPos,
        rotationX: -yPos,
        duration: 0.5,
        ease: "power2.out",
        transformPerspective: 1000,
      })
    }

    const handleMouseLeave = () => {
      if (!cardRef.current) return

      gsap.to(cardRef.current, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.5,
        ease: "power2.out",
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    cardRef.current.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cardRef.current?.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className="w-full max-w-2xl bg-card rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  )
}