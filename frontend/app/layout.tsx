import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { PostHogProvider } from "@/components/PostHogProvider"
import { Toaster } from "@/components/ui/sonner"
import SmoothScrollProvider from "@/components/SmoothScrollProvider"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://temp.willx.tech'),
  title: "Temp Mail",
  description: "Temporary email service - Create disposable email addresses and receive emails without registration",
  openGraph: {
    title: "Temp Mail - Temporary Email Service",
    description: "Create disposable email addresses and receive emails without registration. Your temporary email service for privacy.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SmoothScrollProvider>
            <PostHogProvider>
              {children}
            </PostHogProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
} 