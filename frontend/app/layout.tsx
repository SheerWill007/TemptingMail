import type { Metadata } from "next"
import { PostHogProvider } from "@/components/PostHogProvider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://temp.willx.tech'),
  title: "Temp Mail - Temporary Email Service",
  description: "Create disposable email addresses instantly. No registration required. Privacy-first temporary email service.",
  openGraph: {
    title: "Temp Mail - Temporary Email Service",
    description: "Create disposable email addresses and receive emails without registration. Your privacy-first temporary email service.",
    url: "https://temp.willx.tech",
    siteName: "Temp Mail",
    images: [
      {
        url: "/temp-mail-opengraph-new.png",
        width: 1200,
        height: 630,
        alt: "Temp Mail - Temporary Email Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Temp Mail - Temporary Email Service",
    description: "Create disposable email addresses and receive emails without registration.",
    images: ["/temp-mail-opengraph-new.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Toaster />
      </body>
    </html>
  )
}
