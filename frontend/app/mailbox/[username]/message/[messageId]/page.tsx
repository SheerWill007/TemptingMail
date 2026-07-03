"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Header, Footer } from "@/components/layout"
import { fetchMessage } from "@/lib/api"
import { sanitizeEmailHtml } from "@/lib/sanitize-html"
import { trackEvent } from "@/lib/posthog"

export default function MessagePage() {
  const params = useParams()
  const messageId = params.messageId as string
  const username = params.username as string

  const [message, setMessage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const sanitizedHtml = useMemo(() => {
    if (!message?.parsedData?.html) {
      return message?.parsedData?.text
        ? `<p>${message.parsedData.text.replace(/\n/g, '<br>')}</p>`
        : '<p>No content available</p>'
    }
    return sanitizeEmailHtml(message.parsedData.html)
  }, [message])

  useEffect(() => {
    const loadMessage = async () => {
      setLoading(true)
      try {
        const messageData = await fetchMessage(messageId)
        setMessage(messageData)

        trackEvent('message_opened', {
          username,
          message_id: messageId,
          subject: messageData.subject,
        })
      } catch (error) {
        console.error('Failed to load message:', error)
        toast.error("Failed to load message")
      } finally {
        setLoading(false)
      }
    }

    loadMessage()
  }, [messageId, username])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60">Loading message...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!message) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-xl text-white">Message not found</p>
            <Link
              href={`/mailbox/${username}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mailbox
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Link 
            href={`/mailbox/${username}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mailbox</span>
          </Link>

          {/* Message Content */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/10 space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {message.subject || "(No Subject)"}
              </h1>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-white/50 min-w-[60px]">From:</span>
                  <span className="text-white/80">{message.from}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-white/50 min-w-[60px]">To:</span>
                  <span className="text-white/80">{username}@temp.willx.tech</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-white/50 min-w-[60px]">Date:</span>
                  <span className="text-white/80">
                    {message.createdAt 
                      ? new Date(message.createdAt).toLocaleString()
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              <div 
                className="prose prose-sm md:prose-base max-w-none
                  prose-headings:text-white 
                  prose-p:text-white/80 
                  prose-a:text-white hover:prose-a:text-white/80
                  prose-strong:text-white
                  prose-code:text-white
                  prose-pre:bg-white/10 prose-pre:border prose-pre:border-white/20"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
