'use client'

import { RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { PageShell } from '@/components/layout'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <PageShell className="flex items-center justify-center">
      <div className="glass max-w-md space-y-4 rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-white/60">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="solid-button">
          <RefreshCw className="size-4" /> Try again
        </button>
      </div>
    </PageShell>
  )
}
