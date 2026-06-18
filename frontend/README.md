# 🎨 Temp Mail Frontend

Modern, animated frontend for the Temp Mail service built with Next.js 15, featuring GSAP animations and Lenis smooth scrolling.

## ✨ Features

- 🎭 **GSAP Animations** - Floating cards with mouse parallax effects
- 🌊 **Lenis Smooth Scrolling** - Buttery smooth page transitions
- 🎨 **Borderless Design** - Modern glassmorphism-inspired aesthetic
- 🌓 **Dark/Light Mode** - Elegant theme switching
- 📱 **Fully Responsive** - Optimized for all device sizes
- ⚡ **Real-time Updates** - Smart polling with exponential backoff
- 🎯 **Type-Safe** - Full TypeScript coverage

## 🏗️ Tech Stack

```
Next.js 15 (App Router)
├── React 19
├── TypeScript 5
├── Tailwind CSS 4
├── GSAP 3.12 (Animations)
├── Lenis (Smooth Scroll)
├── Radix UI (Components)
└── Sonner (Toasts)
```

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Homepage with floating card
│   ├── globals.css             # Global styles
│   └── mailbox/
│       └── [username]/
│           ├── page.tsx        # Mailbox view
│           └── message/
│               └── [messageId]/
│                   └── page.tsx # Message detail
├── components/
│   ├── FloatingCard.tsx        # GSAP animated card
│   ├── SmoothScrollProvider.tsx
│   ├── theme-provider.tsx      # Theme context
│   ├── PostHogProvider.tsx     # Analytics wrapper
│   ├── layout/
│   │   ├── Header.tsx          # App header
│   │   ├── Footer.tsx          # App footer
│   │   └── BorderDecoration.tsx
│   └── ui/                     # Radix UI components
│       ├── button.tsx
│       ├── sonner.tsx
│       └── ...
├── lib/
│   ├── api.ts                  # API client
│   ├── types.ts                # TypeScript types
│   ├── utils.ts                # Utility functions
│   ├── sanitize-html.ts        # HTML sanitization
│   └── posthog.ts              # Analytics
├── styles/
│   └── globals.css             # Tailwind + custom styles
├── public/
│   ├── favicon.svg
│   └── temp-mail-image.png
└── package.json
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Install animation libraries
pnpm add gsap lenis
```

### Environment Variables

Create `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎭 Animation System

### FloatingCard Component

Located at `components/FloatingCard.tsx`

**Features:**
- **Entrance Animation** (1s): Fade in + scale + translate
- **Floating Loop** (infinite): Y-axis oscillation with sine easing
- **Mouse Parallax**: 3D rotation following mouse position
- **Auto-return**: Smooth return to neutral on mouse leave

**Usage:**
```tsx
import FloatingCard from "@/components/FloatingCard"

<FloatingCard>
  <h2>Your content here</h2>
</FloatingCard>
```

### Smooth Scrolling

Located at `components/SmoothScrollProvider.tsx`

**Configuration:**
```typescript
const lenis = new Lenis({
  lerp: 0.08,           // Smoothness (0-1)
  smoothWheel: true,    // Enable smooth wheel
  wheelMultiplier: 1,   // Scroll speed
})
```

**Usage:**
```tsx
import SmoothScrollProvider from "@/components/SmoothScrollProvider"

<SmoothScrollProvider>
  <YourApp />
</SmoothScrollProvider>
```

## 🎨 Design System

### Color Palette

Defined in `styles/globals.css`:

```css
/* Light Mode */
--background: #DBDBDB;      /* Pixel White */
--foreground: #0A0A0A;      /* Existential Angst */
--primary: #373839;         /* Dark Summoning */
--secondary: #999999;       /* Million Grey */
--muted: #5F6062;           /* Kettleman */

/* Dark Mode */
--background: #0A0A0A;
--foreground: #DBDBDB;
--card: #1F1F20;           /* Inkwell Inception */
```

### Typography

```css
--font-sans: var(--font-inter);
--font-headline: var(--font-headline);
--font-features: var(--font-features);
```

### Shadows

```css
.shadow-xl   /* Large cards */
.shadow-lg   /* Medium cards */
.shadow-md   /* Small elements */
```

### Border Radius

```css
.rounded-2xl   /* Large cards */
.rounded-xl    /* Medium cards */
.rounded-full  /* Buttons */
```

## 📱 Responsive Design

### Breakpoints

```typescript
mobile:    < 768px
tablet:    768px - 1024px
desktop:   > 1024px
```

### Layout Strategy

- **Mobile**: Stacked layout with touch-optimized interactions
- **Desktop**: `Screen` component with fixed dimensions
- **Both**: Separate views optimized for each platform

## 🔌 API Integration

### API Client (`lib/api.ts`)

**Features:**
- Request deduplication
- Response caching (60s)
- Automatic retry on failure
- Error handling

**Usage:**
```typescript
import { fetchMessages, createCustomMailbox } from "@/lib/api"

// Create mailbox
const mailbox = await createCustomMailbox("username")

// Fetch messages
const result = await fetchMessages("user@temp.willx.tech")
```

## 🎯 Key Components

### HomePage (`app/page.tsx`)
- FloatingCard with GSAP animations
- Username input with validation
- Mailbox creation
- Feature descriptions

### MailboxPage (`app/mailbox/[username]/page.tsx`)
- Real-time message polling
- Smart refresh with exponential backoff
- Error handling with retry
- Email list display
- Copy to clipboard

### MessagePage (`app/mailbox/[username]/message/[messageId]/page.tsx`)
- Email detail view
- HTML sanitization
- Safe content rendering
- Back navigation

### Header (`components/layout/Header.tsx`)
- Logo and branding
- Dark/light mode toggle
- Responsive design

### Footer (`components/layout/Footer.tsx`)
- Attribution
- GitHub link
- Bottom-left positioning

## 🛠️ Development

### Scripts

```bash
pnpm dev        # Start dev server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

### Code Style

- TypeScript strict mode
- ESLint with Next.js config
- Prettier for formatting
- Consistent file structure

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Configuration:**
- Set environment variables in Vercel dashboard
- Enable automatic deployments from Git
- Configure custom domain

### Other Platforms

**Netlify:**
```bash
# Build command
pnpm build

# Publish directory
.next
```

**AWS Amplify:**
- Build command: `pnpm build`
- Output directory: `.next`

### Environment Variables

Set in your deployment platform:
```env
NEXT_PUBLIC_API_BASE=https://api.willx.tech
NEXT_PUBLIC_SITE_URL=https://temp.willx.tech
```

## 🧪 Testing

```bash
# Run tests (when configured)
pnpm test

# Type checking
pnpm tsc --noEmit
```

## 📦 Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `react-dom` - React DOM
- `typescript` - Type safety

### Animation
- `gsap` - Animation library
- `lenis` - Smooth scrolling
- `framer-motion` - Additional animations

### UI
- `@radix-ui/*` - UI primitives
- `tailwindcss` - CSS framework
- `lucide-react` - Icons
- `sonner` - Toast notifications

### Utilities
- `clsx` - Class names utility
- `tailwind-merge` - Tailwind class merging
- `next-themes` - Theme management
- `dompurify` - HTML sanitization

## 🎯 Performance Optimization

- **Route Prefetching**: Automatic with Next.js Link
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Tree Shaking**: Enabled by default
- **CSS Optimization**: Tailwind CSS purging

## 🔒 Security

- **HTML Sanitization**: DOMPurify for email content
- **XSS Prevention**: React automatic escaping
- **HTTPS Only**: Production configuration
- **No Sensitive Data**: Client-side only

## 🤝 Contributing

See main [README.md](../README.md) for contribution guidelines.

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.

---

Made with ❤️ by [WilliamBenLaw](https://github.com/SheerWill007)