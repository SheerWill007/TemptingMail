"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <header
        className="flex h-16 min-h-[64px] items-center justify-between px-4 bg-background text-foreground"
      >
        <a className="flex flex-row items-center gap-2" href="/">
          <svg width="32" height="32" viewBox="0 0 100 100">
            <path
              d="M20 15 C15 15, 10 20, 10 25 L10 35 C10 40, 15 45, 20 45 L25 45 L25 75 C25 80, 30 85, 35 85 L40 85 C45 85, 50 80, 50 75 L50 45 L55 45 C60 45, 65 40, 65 35 L65 25 C65 20, 60 15, 55 15 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-custom text-xl font-semibold">TempMail</span>
        </a>
        <div className="flex flex-row items-center gap-2 md:gap-6">
          <div className="w-8 h-[1.15rem]" />
        </div>
      </header>
    )
  }

  return (
    <header
      className="flex h-16 min-h-[64px] items-center justify-between px-4 bg-background text-foreground"
    >
      <a className="flex flex-row items-center gap-2" href="/">
        <svg width="32" height="32" viewBox="0 0 100 100">
          <path
            d="M20 15 C15 15, 10 20, 10 25 L10 35 C10 40, 15 45, 20 45 L25 45 L25 75 C25 80, 30 85, 35 85 L40 85 C45 85, 50 80, 50 75 L50 45 L55 45 C60 45, 65 40, 65 35 L65 25 C65 20, 60 15, 55 15 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-custom text-xl font-semibold">TempMail</span>
      </a>

      <div className="flex flex-row items-center gap-2 md:gap-6">
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          onClick={toggleDarkMode}
          className={`peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none ${isDark ? "bg-gray-600" : "bg-gray-200"
            }`}
        >
          <span
            className={`bg-white pointer-events-none flex size-4 items-center justify-between rounded-full text-black ring-0 transition-transform duration-300 ${isDark ? "translate-x-4" : "translate-x-0"
              }`}
          >
            {isDark ? <Sun className="mx-auto size-2.5" /> : <Moon className="mx-auto size-2.5" />}
          </span>
        </button>
      </div>
    </header>
  )
}
