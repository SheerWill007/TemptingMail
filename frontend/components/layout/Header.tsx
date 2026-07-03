"use client"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold text-white hover:text-white/80 transition-colors">
          TempMail
        </a>
        
        <a 
          href="/about" 
          className="text-white/80 hover:text-white transition-colors font-medium"
        >
          About
        </a>
      </div>
    </header>
  )
}
