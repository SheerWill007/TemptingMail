import { Code, Globe, Star } from 'lucide-react'

const REPO_URL = 'https://github.com/SheerWill007/TemptingMail'
// AGPL-3.0 §13: users of a modified, network-deployed version must be offered its source.
const SOURCE_URL = process.env.NEXT_PUBLIC_SOURCE_URL || REPO_URL

// lucide-react v1 no longer ships brand icons.
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

const iconLink =
  'flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl transition-all hover:bg-white/20'

export function Footer() {
  return (
    <footer className="py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <p className="flex items-center gap-2 text-sm text-white/70">
          Made with <span className="text-red-400">♥</span> by
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:text-white/80">
            WilliamBenLaw
          </a>
        </p>

        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="glass-button px-5 py-2.5">
          <Star className="size-4" aria-hidden />
          Star on GitHub
        </a>

        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
        >
          <Code className="size-4" aria-hidden />
          Source code (AGPL-3.0)
        </a>

        <div className="flex items-center gap-3">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label="GitHub">
            <GitHubIcon className="size-5 text-white" />
          </a>
          <a href="https://www.linkedin.com/in/willxtech" target="_blank" rel="noopener noreferrer" className={iconLink} aria-label="LinkedIn">
            <LinkedInIcon className="size-5 text-white" />
          </a>
          <a href="https://willx.tech" target="_blank" rel="noopener noreferrer" className={iconLink} aria-label="Website">
            <Globe className="size-5 text-white" />
          </a>
        </div>
      </div>
    </footer>
  )
}
