import { cn } from '@/lib/utils'
import { Footer } from './Footer'
import { Header } from './Header'

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={cn('flex-1 px-4 pt-24 pb-16', className)}>{children}</main>
      <Footer />
    </div>
  )
}
