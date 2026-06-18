"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Footer() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'
  return (
    <footer
      className="px-4 py-4 bg-background text-foreground"
    >
      <p className="text-sm text-muted-foreground text-left">
        Made by <a
          href="https://github.com/SheerWill007"
          target="_blank"
          rel="noopener noreferrer"
          className="px-1 py-0.5 rounded text-foreground bg-card hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          WilliamBenLaw
        </a>
      </p>
    </footer>
  )
}
