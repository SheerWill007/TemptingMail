"use client"
import { Header, Footer } from "@/components/layout"
import { Shield, Zap, Lock, Heart, CheckCircle, ArrowLeft } from "lucide-react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import Link from "next/link"

export default function AboutPage() {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll('.fade-in')
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          stagger: 0.1, 
          ease: "power3.out",
          delay: 0.2
        }
      )
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div ref={contentRef} className="max-w-4xl mx-auto space-y-16">
          {/* Back Button */}
          <div className="fade-in">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero */}
          <div className="fade-in text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Why Temp Mail?
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              A simple solution to protect your privacy online without sacrificing convenience.
            </p>
          </div>

          {/* The Problem */}
          <div className="fade-in space-y-6">
            <h2 className="text-3xl font-bold text-white">The Problem</h2>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 space-y-4">
              <p className="text-lg text-white/80">
                Every day, you're asked for your email address for things you don't care about:
              </p>
              <ul className="space-y-3">
                {[
                  "Testing services without commitment",
                  "Downloading resources behind email gates",
                  "Avoiding spam from promotional newsletters",
                  "One-time verifications and signups"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-lg text-white/80 pt-4">
                The result? Your inbox becomes a graveyard of spam and security risks.
              </p>
            </div>
          </div>

          {/* The Solution */}
          <div className="fade-in space-y-6">
            <h2 className="text-3xl font-bold text-white">Our Solution</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Instant Email",
                  description: "Create disposable addresses in seconds. No registration required."
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  description: "Keep your real email safe from spam and data breaches."
                },
                {
                  icon: Lock,
                  title: "Auto Cleanup",
                  description: "Messages deleted after 24 hours. Zero digital footprint."
                },
                {
                  icon: Heart,
                  title: "Free Forever",
                  description: "No premium tiers, no hidden costs. Built to help."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission */}
          <div className="fade-in space-y-6">
            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 space-y-4">
              <p className="text-lg text-white/80">
                We believe privacy should be accessible to everyone. Temp Mail was created to give 
                you control over your digital identity without requiring technical knowledge.
              </p>
              <p className="text-lg text-white/80">
                This is a community-driven project built with transparency and privacy at its core. 
                We don't track you, we don't sell your data, and we don't ask for personal information.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="fade-in text-center pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-white/90 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Create Your Email</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
