"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { RefreshCw, Copy, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Header, Footer } from "@/components/layout"
import { fetchMessages } from "@/lib/api"
import { trackEvent } from "@/lib/posthog"
import { gsap } from "gsap"

export default function MailboxPage() {
  const params = useParams()
  const username = params.username as string
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadEmails(true)
  }, [])

  useEffect(() => {
    if (contentRef.current && !loading) {
      const cards = contentRef.current.querySelectorAll('.email-card')
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" }
      )
    }
  }, [emails, loading])

  const loadEmails = async (forceRefresh = false) => {
    setLoading(true)
    try {
      const result = await fetchMessages(`${username}@temp.willx.tech`, forceRefresh)
      setEmails(result.messages || [])
    } catch (error) {
      console.error('Failed to load emails:', error)
      toast.error("Failed to load emails. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    trackEvent('manual_refresh', { username })
    
    try {
      await loadEmails(true)
      toast.success("Mailbox refreshed!")
    } catch (error) {
      toast.error("Failed to refresh")
    } finally {
      setRefreshing(false)
    }
  }

  const copyEmail = () => {
    const email = `${username}@temp.willx.tech`
    navigator.clipboard.writeText(email)
    trackEvent('email_copied', { username, email })
    toast.success("Email copied to clipboard!")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Your Mailbox
              </h1>
              
              {/* Email Display */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3">
                  <p className="text-white font-mono text-sm md:text-base truncate">
                    {username}@temp.willx.tech
                  </p>
                </div>
                
                <button
                  onClick={copyEmail}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all text-white font-medium"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
                
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all text-white font-medium disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emails List */}
          <div ref={contentRef} className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-white/60">Loading emails...</p>
                </div>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white/40" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold text-white">No emails yet</p>
                  <p className="text-white/60">Messages will appear here when you receive them</p>
                </div>
              </div>
            ) : (
              emails.map((email) => (
                <Link
                  key={email.id}
                  href={`/mailbox/${username}/message/${email.id}`}
                  className="email-card block"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {email.subject || "(No Subject)"}
                      </h3>
                      <span className="text-sm text-white/60 whitespace-nowrap">
                        {email.createdAt ? new Date(email.createdAt).toLocaleDateString() : email.time}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-2">
                      {email.preview}
                    </p>
                    <p className="text-xs text-white/50">
                      From: {email.from}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
