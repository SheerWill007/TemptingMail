"use client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { trackEvent } from "@/lib/posthog"
import { gsap } from "gsap"
import { Header, Footer } from "@/components/layout"
import { ArrowRight, Mail, Shield, Clock } from "lucide-react"

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    gsap.fromTo(
      ".hero-content",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
    )
  }, [])

  const validateUsername = (input: string): string => {
    const beforeAtSign = input.split('@')[0]
    return beforeAtSign.toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  const handleCreateMailbox = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username")
      return
    }

    setIsLoading(true)
    trackEvent('mailbox_creation_attempt', { username: username.trim() })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      })

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}))
        toast.error('Rate limit exceeded', {
          description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
        })
        trackEvent('rate_limit_hit', { endpoint: 'mailboxes/custom' })
        return
      }

      trackEvent('mailbox_created', { username: username.trim() })
      window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`
    } catch (err) {
      console.error('Error creating mailbox:', err)
      toast.error('Failed to create mailbox. Please try again.')
      trackEvent('mailbox_creation_failed', { username: username.trim() })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="hero-content w-full max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
              Temporary Email.
              <br />
              <span className="text-white/60">Zero Commitment.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
              Create disposable email addresses instantly. No registration required.
            </p>
          </div>

          {/* Input Section */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 pr-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(validateUsername(e.target.value))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && username.trim() && !isLoading) {
                      handleCreateMailbox()
                    }
                  }}
                  placeholder="Enter your username"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 px-4 py-4 text-lg"
                />
                <button
                  onClick={handleCreateMailbox}
                  disabled={!username.trim() || isLoading}
                  className="flex items-center gap-2 bg-white text-black px-6 py-4 rounded-xl font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="animate-spin">↻</span>
                  ) : (
                    <>
                      <span>Create</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-white/60 text-sm">
              Your email will be: <span className="font-semibold text-white">{username || "username"}</span>@temp.willx.tech
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-12">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Instant Setup</h3>
              <p className="text-white/60 text-sm">Create unlimited temporary email addresses in seconds</p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Privacy First</h3>
              <p className="text-white/60 text-sm">No registration, no tracking, no data collection</p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Auto Cleanup</h3>
              <p className="text-white/60 text-sm">Messages automatically deleted after 24 hours</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
