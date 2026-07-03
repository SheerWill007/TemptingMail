"use client"
import { Github, Linkedin, Globe, Star } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Made by */}
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>by</span>
            <a
              href="https://github.com/SheerWill007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              WilliamBenLaw
            </a>
          </div>

          {/* Center - Star button */}
          <a
            href="https://github.com/SheerWill007/Temp-Mail"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all font-medium text-white"
          >
            <Star className="w-4 h-4" />
            <span>Star on GitHub</span>
          </a>

          {/* Right - Social links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/SheerWill007"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://linkedin.com/in/williambenjaminlaw"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-white" />
            </a>
            <a
              href="https://willx.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              aria-label="Portfolio"
            >
              <Globe className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
