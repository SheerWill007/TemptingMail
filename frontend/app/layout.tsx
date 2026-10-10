import type { Metadata, Viewport } from 'next'
import { LenisProvider } from '@/components/LenisProvider'
import { PostHogProvider } from '@/components/PostHogProvider'
import { Toaster } from '@/components/ui/sonner'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const title = 'Temp Mail - Free Disposable Email'
const description =
  'Create a disposable email address instantly. No registration, no tracking. Messages self-destruct after 24 hours.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: '%s · Temp Mail' },
  description,
  applicationName: 'Temp Mail',
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: 'Temp Mail',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0b0d12',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <PostHogProvider>{children}</PostHogProvider>
        </LenisProvider>
        <Toaster />
      </body>
    </html>
  )
}
