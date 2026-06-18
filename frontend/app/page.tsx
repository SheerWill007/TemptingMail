"use client"
import { Screen } from "@/components/screen"
import { Header, Footer, BorderDecoration } from "@/components/layout"
import FloatingCard from "@/components/FloatingCard"
import { useState } from "react"
import { toast } from "sonner"
import { trackEvent } from "@/lib/posthog"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }
  
  const validateUsername = (input: string): string => {
    const beforeAtSign = input.split('@')[0];
    return beforeAtSign.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  return (
    <div
      className="min-h-screen bg-background relative overflow-y-auto"
    >
      <div className="md:hidden flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 bg-background overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center h-full">
            <FloatingCard>
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
                Your Temporary Email Address
              </h2>
              <form className="w-full" onSubmit={handleSubmit}>
                <div className="input-box-col flex flex-col sm:flex-row gap-4 items-center">
                  <div className="input-warp flex-1 relative">
                    <input
                      id="mail"
                      type="text"
                      value={username}
                      placeholder="Enter your username"
                      onChange={(e) => setUsername(validateUsername(e.target.value))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && username.trim()) {
                          trackEvent('mailbox_creation_attempt', {
                            username: username.trim(),
                            method: 'enter_key'
                          });

                          fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username.trim() })
                          })
                          .then(async (res) => {
                            if (res.status === 429) {
                              trackEvent('rate_limit_hit', {
                                endpoint: 'mailboxes/custom',
                                method: 'enter_key'
                              });
                              const errorData = await res.json().catch(() => ({}));
                              toast.error('Rate limit exceeded', {
                                description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
                                duration: 5000,
                              });
                              return;
                            }
                            trackEvent('mailbox_created', {
                              username: username.trim(),
                              method: 'enter_key'
                            });
                            window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`;
                          })
                          .catch((err) => {
                            trackEvent('mailbox_creation_failed', {
                              username: username.trim(),
                              method: 'enter_key',
                              error: err.message
                            });
                            console.error('Error creating mailbox:', err);
                          });
                        }
                      }}
                      className="emailbox-input w-full px-6 py-4 pr-20 rounded-full bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg font-bold placeholder:text-muted-foreground"
                    />

                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors"
                      onClick={() => {
                        if (username.trim()) {
                          trackEvent('mailbox_creation_attempt', {
                            username: username.trim(),
                            method: 'button_click'
                          });

                          fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username.trim() })
                          })
                          .then(async (res) => {
                            if (res.status === 429) {
                              trackEvent('rate_limit_hit', {
                                endpoint: 'mailboxes/custom',
                                method: 'button_click'
                              });
                              const errorData = await res.json().catch(() => ({}));
                              toast.error('Rate limit exceeded', {
                                description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
                                duration: 5000,
                              });
                              return;
                            }
                            trackEvent('mailbox_created', {
                              username: username.trim(),
                              method: 'button_click'
                            });
                            window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`;
                          })
                          .catch((err) => {
                            trackEvent('mailbox_creation_failed', {
                              username: username.trim(),
                              method: 'button_click',
                              error: err.message
                            });
                            console.error('Error creating mailbox:', err);
                          });
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Your email will be: <span className="font-bold text-foreground">{username || "username"}</span>@temp.willx.tech
                </p>
                <p className="text-center mt-2 text-xs text-muted-foreground">
                  Only lowercase letters and numbers are allowed
                </p>
              </form>
            </FloatingCard>

            <div className="w-full max-w-2xl mt-16 space-y-6">
              <div className="flex items-start gap-3">
                <p className="font-features leading-relaxed text-foreground">
                  Temp Mail Service
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"></div>
                <p className="font-features leading-relaxed text-foreground">
                  Your mails are public. Don't use it for important mails. Use it to subscribe to all unwanted services.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"></div>
                <p className="font-features leading-relaxed text-foreground">
                  Your mails will be cleared from the database to prevent junk after 24 hours. Please save all the data
                  that you might need later!
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <div className="hidden md:block">
        <Screen>
          <Header />

          <main className="flex-1 bg-background overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center h-full">
              <FloatingCard>
                <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
                  Your Temporary Email Address
                </h2>
                <form className="w-full" onSubmit={handleSubmit}>
                  <div className="input-box-col flex flex-col sm:flex-row gap-4 items-center">
                    <div className="input-warp flex-1 relative">
                      <input
                        id="mail"
                        type="text"
                        value={username}
                        placeholder="Enter your username"
                        onChange={(e) => setUsername(validateUsername(e.target.value))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && username.trim()) {
                          fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username.trim() })
                          })
                          .then(async (res) => {
                            if (res.status === 429) {
                              const errorData = await res.json().catch(() => ({}));
                              toast.error('Rate limit exceeded', {
                                description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
                                duration: 5000,
                              });
                              return;
                            }
                            window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`;
                          })
                          .catch((err) => {
                            console.error('Error creating mailbox:', err);
                          });
                          }
                        }}
                        className="emailbox-input w-full px-6 py-4 pr-20 rounded-full bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg font-bold placeholder:text-muted-foreground"
                      />

                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors"
                        onClick={() => {
                          if (username.trim()) {
                          fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username.trim() })
                          })
                          .then(async (res) => {
                            if (res.status === 429) {
                              const errorData = await res.json().catch(() => ({}));
                              toast.error('Rate limit exceeded', {
                                description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
                                duration: 5000,
                              });
                              return;
                            }
                            window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`;
                          })
                          .catch((err) => {
                            console.error('Error creating mailbox:', err);
                          });
                          }
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-center mt-4 text-sm text-muted-foreground">
                    Your email will be: <span className="font-bold text-foreground">{username || "username"}</span>@temp.willx.tech
                  </p>
                </form>
              </FloatingCard>

              <div className="w-full max-w-2xl mt-16 space-y-6">
                <div className="flex items-start gap-3">
                  <p className="font-features leading-relaxed text-foreground">
                    Temp Mail Service
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"></div>
                  <p className="font-features leading-relaxed text-foreground">
                    Your mails are public. Don't use it for important mails. Use it to subscribe to all unwanted services.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"></div>
                  <p className="font-features leading-relaxed text-foreground">
                    Your mails will be cleared from the database to prevent junk after 24 hours. Please save all the data
                    that you might need later!
                  </p>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </Screen>
      </div>
    </div>
  )
}
              <form className="w-full" onSubmit={handleSubmit}>
                <div className="input-box-col flex flex-col sm:flex-row gap-4 items-center">
                  <div className="input-warp flex-1 relative">
                    <input
                      id="mail"
                      type="text"
                      value={username}
                      placeholder="Enter your username"
                      onChange={(e) => setUsername(validateUsername(e.target.value))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && username.trim()) {
                          trackEvent('mailbox_creation_attempt', {
                            username: username.trim(),
                            method: 'enter_key'
                          });

                          fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username.trim() })
                          })
                          .then(async (res) => {
                            if (res.status === 429) {
                              trackEvent('rate_limit_hit', {
                                endpoint: 'mailboxes/custom',
                                method: 'enter_key'
                              });
                              const errorData = await res.json().catch(() => ({}));
                              toast.error('Rate limit exceeded', {
                                description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
                                duration: 5000,
                              });
                              return;
                            }
                            trackEvent('mailbox_created', {
                              username: username.trim(),
                              method: 'enter_key'
                            });
                            window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`;
                          })
                          .catch((err) => {
                            trackEvent('mailbox_creation_failed', {
                              username: username.trim(),
                              method: 'enter_key',
                              error: err.message
                            });
                            console.error('Error creating mailbox:', err);
                          });
                        }
                      }}
                      className="emailbox-input w-full px-6 py-4 pr-20 rounded-full border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg font-bold placeholder:text-muted-foreground"
                    />

                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors"
                      onClick={() => {
                        if (username.trim()) {
                          trackEvent('mailbox_creation_attempt', {
                            username: username.trim(),
                            method: 'button_click'
                          });

                          fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username.trim() })
                          })
                          .then(async (res) => {
                            if (res.status === 429) {
                              trackEvent('rate_limit_hit', {
                                endpoint: 'mailboxes/custom',
                                method: 'button_click'
                              });
                              const errorData = await res.json().catch(() => ({}));
                              toast.error('Rate limit exceeded', {
                                description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
                                duration: 5000,
                              });
                              return;
                            }
                            trackEvent('mailbox_created', {
                              username: username.trim(),
                              method: 'button_click'
                            });
                            window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`;
                          })
                          .catch((err) => {
                            trackEvent('mailbox_creation_failed', {
                              username: username.trim(),
                              method: 'button_click',
                              error: err.message
                            });
                            console.error('Error creating mailbox:', err);
                          });
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Your email will be: <span className="font-bold text-foreground">{username || "username"}</span>@temp.willx.tech
                </p>
                <p className="text-center mt-2 text-xs text-muted-foreground">
                  Only lowercase letters and numbers are allowed
                </p>
              </form>
            </div>

            <div className="w-full max-w-2xl mt-16 space-y-6">
              <div className="flex items-start gap-3">
                <p className="font-features leading-relaxed text-foreground">
                  Temp Mail Service
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"></div>
                <p className="font-features leading-relaxed text-foreground">
                  Your mails are public. Don't use it for important mails. Use it to subscribe to all unwanted services.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"></div>
                <p className="font-features leading-relaxed text-foreground">
                  Your mails will be cleared from the database to prevent junk after 24 hours. Please save all the data
                  that you might need later!
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <div className="hidden md:block">
        <Screen>
          <Header />

          <main className="flex-1 bg-background overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center h-full">
              <div className="temp-emailbox w-full max-w-2xl border-2 border-dashed border-border rounded-lg p-8 bg-card">
                <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
                  Your Temporary Email Address
                </h2>
                <form className="w-full" onSubmit={handleSubmit}>
                  <div className="input-box-col flex flex-col sm:flex-row gap-4 items-center">
                    <div className="input-warp flex-1 relative">
                      <input
                        id="mail"
                        type="text"
                        value={username}
                        placeholder="Enter your username"
                        onChange={(e) => setUsername(validateUsername(e.target.value))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && username.trim()) {
                          fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username.trim() })
                          })
                          .then(async (res) => {
                            if (res.status === 429) {
                              const errorData = await res.json().catch(() => ({}));
                              toast.error('Rate limit exceeded', {
                                description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
                                duration: 5000,
                              });
                              return;
                            }
                            window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`;
                          })
                          .catch((err) => {
                            console.error('Error creating mailbox:', err);
                          });
                          }
                        }}
                        className="emailbox-input w-full px-6 py-4 pr-20 rounded-full border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg font-bold placeholder:text-muted-foreground"
                      />

                      <button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors"
                        onClick={() => {
                          if (username.trim()) {
                          fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'}/api/mailboxes/custom`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username.trim() })
                          })
                          .then(async (res) => {
                            if (res.status === 429) {
                              const errorData = await res.json().catch(() => ({}));
                              toast.error('Rate limit exceeded', {
                                description: errorData.error || 'Too many mailboxes created. Please try again after 1 hour.',
                                duration: 5000,
                              });
                              return;
                            }
                            window.location.href = `/mailbox/${encodeURIComponent(username.trim())}`;
                          })
                          .catch((err) => {
                            console.error('Error creating mailbox:', err);
                          });
                          }
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-center mt-4 text-sm text-muted-foreground">
                    Your email will be: <span className="font-bold text-foreground">{username || "username"}</span>@temp.willx.tech
                  </p>
                </form>
              </div>

              <div className="w-full max-w-2xl mt-16 space-y-6">
                <div className="flex items-start gap-3">
                  <p className="font-features leading-relaxed text-foreground">
                    Temp Mail Service
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"></div>
                  <p className="font-features leading-relaxed text-foreground">
                    Your mails are public. Don't use it for important mails. Use it to subscribe to all unwanted services.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary"></div>
                  <p className="font-features leading-relaxed text-foreground">
                    Your mails will be cleared from the database to prevent junk after 24 hours. Please save all the data
                    that you might need later!
                  </p>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </Screen>
      </div>
    </div>
  )
}