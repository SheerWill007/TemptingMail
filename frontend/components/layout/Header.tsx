import Link from 'next/link'
import { Mail } from 'lucide-react'

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white transition-colors hover:text-white/80">
          <Mail className="size-6" aria-hidden />
          TempMail
        </Link>
        <nav>
          <Link href="/about" className="font-medium text-white/80 transition-colors hover:text-white">
            About
          </Link>
        </nav>
      </div>
    </header>
  )
}
