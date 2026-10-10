import { Home, Mail } from 'lucide-react'
import Link from 'next/link'
import { PageShell } from '@/components/layout'

export default function NotFound() {
  return (
    <PageShell className="flex items-center justify-center">
      <div className="glass max-w-md space-y-6 rounded-2xl p-10 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white/10">
          <Mail className="size-10 text-white/70" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <h2 className="text-2xl font-semibold text-white/80">Page Not Found</h2>
          <p className="text-white/60">The page you&apos;re looking for doesn&apos;t exist or has expired.</p>
        </div>
        <Link href="/" className="solid-button">
          <Home className="size-4" /> Go Home
        </Link>
      </div>
    </PageShell>
  )
}
