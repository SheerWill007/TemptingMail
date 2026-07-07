# Frontend Application - Temporary Email Service

Modern web interface for temporary email service built with Next.js 15, featuring server-side rendering, advanced animations, and responsive design patterns.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Build and Deployment](#build-and-deployment)
- [Component Documentation](#component-documentation)
- [Animation System](#animation-system)
- [API Integration](#api-integration)
- [Security](#security)
- [Performance](#performance)
- [Testing](#testing)
- [Maintenance](#maintenance)

---

## Overview

The frontend application provides a modern, responsive user interface for temporary email management. Built with enterprise-grade frameworks and libraries, it delivers a performant single-page application experience with progressive enhancement.

### Core Features

- Server-side rendering for optimal initial page load
- Client-side routing with prefetching
- Real-time inbox updates via polling
- Responsive design across all device categories
- Hardware-accelerated animations
- Accessible UI components
- Progressive web application capabilities

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

---

## Architecture

### Application Structure

```
┌──────────────────────────────────────┐
│         Next.js App Router           │
│  (Server Components + Client Hydration)│
└──────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│  Server Layer  │  │   Client Layer  │
│  - SSR         │  │   - Hydration   │
│  - API Routes  │  │   - Interactions │
│  - Data Fetch  │  │   - Animations  │
└────────────────┘  └─────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│   API Client   │  │   State Mgmt    │
│  - Fetch       │  │   - React State │
│  - Cache       │  │   - URL State   │
│  - Retry       │  │   - Local State │
└────────────────┘  └─────────────────┘
```

### Rendering Strategy

- **Server Components**: Used for static content and data fetching
- **Client Components**: Used for interactive elements and animations
- **Hybrid Approach**: Optimizes performance and user experience

---

## Technology Stack

### Core Framework
- **Next.js**: 15.1.6 (App Router)
- **React**: 19.0.0 (Server Components)
- **TypeScript**: 5.7.3 (Strict mode)

### Styling and Design
- **Tailwind CSS**: 4.0.6 (Utility-first CSS)
- **PostCSS**: 8.x (CSS processing)
- **CSS Modules**: Built-in Next.js support

### Animation Libraries
- **GSAP**: 3.12.5 (GreenSock Animation Platform)
- **Lenis**: 1.1.17 (Smooth scrolling)

### UI Components
- **Radix UI**: Accessible component primitives
  - @radix-ui/react-slot
  - Additional primitives as needed
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

### Utilities
- **clsx**: Conditional class names
- **tailwind-merge**: Tailwind class merging
- **next-themes**: Theme management
- **DOMPurify**: HTML sanitization

### Development Tools
- **ESLint**: Code quality enforcement
- **TypeScript**: Type checking
- **Next.js Dev Tools**: Built-in debugging

---

## Project Structure

```
frontend/
├── app/                                 # Next.js App Router
│   ├── layout.tsx                      # Root layout with providers
│   ├── page.tsx                        # Home page
│   ├── globals.css                     # Global styles and Tailwind
│   ├── not-found.tsx                   # 404 page
│   ├── about/                          # About page
│   │   └── page.tsx
│   └── mailbox/                        # Mailbox routes
│       └── [username]/
│           ├── page.tsx                # Mailbox view
│           └── message/
│               └── [messageId]/
│                   └── page.tsx        # Message detail
│
├── components/                         # React components
│   ├── PostHogProvider.tsx            # Analytics wrapper
│   ├── layout/                         # Layout components
│   │   ├── Header.tsx                 # Application header
│   │   ├── Footer.tsx                 # Application footer
│   │   ├── BorderDecoration.tsx       # Visual decorations
│   │   └── index.ts                   # Barrel export
│   └── ui/                            # UI primitives
│       ├── animated-button.tsx        # Animated button component
│       ├── button.tsx                 # Base button component
│       ├── sonner.tsx                 # Toast notifications
│       ├── waves-ladder.tsx           # Visual element
│       └── [icons]/                   # Icon components
│
├── lib/                               # Utility libraries
│   ├── api.ts                        # API client with caching
│   ├── types.ts                      # TypeScript type definitions
│   ├── utils.ts                      # Utility functions
│   ├── sanitize-html.ts              # HTML sanitization
│   └── posthog.ts                    # Analytics integration
│
├── public/                           # Static assets
│   ├── favicon.svg                   # Favicon
│   ├── PBX1.png                      # Application screenshot
│   └── fonts/                        # Custom fonts
│
├── font/                             # Font files
│   ├── PlaywriteAUQLD-VariableFont_wght.ttf
│   └── static/                       # Static font weights
│
├── .env.example                      # Environment template
├── .eslintrc.json                    # ESLint configuration
├── components.json                   # Radix UI configuration
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies
├── postcss.config.mjs                # PostCSS configuration
├── tailwind.config.ts                # Tailwind configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher (recommended) or npm 9.0.0+

### Setup Instructions

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment configuration:
```bash
cp .env.example .env.local
```

4. Configure environment variables (see Configuration section)

5. Verify installation:
```bash
pnpm run build
```

---

## Configuration

### Environment Variables

Create `.env.local` file with the following variables:

**Required Configuration**

```bash
# API endpoint for backend services
NEXT_PUBLIC_API_BASE=http://localhost:3001

# Public URL of the application
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email domain for display purposes
NEXT_PUBLIC_MAIL_DOMAIN=localhost
```

**Optional Configuration**

```bash
# Analytics configuration (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=<analytics-key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Next.js Configuration

The `next.config.ts` file contains build and runtime configuration:

```typescript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add image domains if needed
  },
}
```

### Tailwind Configuration

Custom theme configuration in `tailwind.config.ts`:

```typescript
{
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        // Custom fonts
      }
    }
  }
}
```

---

## Development

### Development Server

Start the development server with hot module replacement:

```bash
pnpm dev
```

Access the application at: http://localhost:3000

The development server includes:
- Hot module replacement
- Fast refresh for React components
- Source map support
- Real-time error overlay

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Code Quality Tools

**ESLint Configuration**
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

**TypeScript Configuration**
- Strict mode enabled
- Path aliases configured
- Incremental compilation

---

## Build and Deployment

### Production Build

Generate optimized production build:

```bash
pnpm build
```

Build output location: `.next/`

### Deployment Options

#### Option 1: Vercel (Recommended)

Vercel provides zero-configuration deployment for Next.js applications.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Configuration:
1. Connect Git repository
2. Configure environment variables in dashboard
3. Deploy automatically on push to main branch

#### Option 2: Self-Hosted

For self-hosted deployment on VPS or cloud infrastructure:

```bash
# Build application
pnpm build

# Start production server
pnpm start
```

Use PM2 for process management:
```bash
pm2 start npm --name "frontend" -- start
pm2 save
pm2 startup
```

#### Option 3: Docker

Dockerfile for containerized deployment:

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t temp-mail-frontend .
docker run -p 3000:3000 temp-mail-frontend
```

### Environment-Specific Builds

Development:
```bash
NODE_ENV=development pnpm build
```

Production:
```bash
NODE_ENV=production pnpm build
```

---

## Component Documentation

### Page Components

#### Home Page (app/page.tsx)
**Purpose**: Landing page with mailbox creation interface
**Features**:
- Username input with validation
- Mailbox creation form
- Feature highlights
- Call-to-action elements

#### Mailbox Page (app/mailbox/[username]/page.tsx)
**Purpose**: Display inbox for specific mailbox
**Features**:
- Message list with real-time updates
- Email preview cards
- Auto-refresh mechanism
- Copy-to-clipboard functionality
- Loading and error states

#### Message Page (app/mailbox/[username]/message/[messageId]/page.tsx)
**Purpose**: Display full email message
**Features**:
- HTML email rendering
- Plain text fallback
- Attachment list
- Sanitized content display
- Navigation controls

### Layout Components

#### Header (components/layout/Header.tsx)
**Purpose**: Application header with navigation
**Features**:
- Logo and branding
- Theme toggle (if implemented)
- Responsive mobile menu
- Accessibility considerations

#### Footer (components/layout/Footer.tsx)
**Purpose**: Application footer with metadata
**Features**:
- Attribution
- Links to resources
- Version information
- Copyright notice

### UI Components

#### Button (components/ui/button.tsx)
**Purpose**: Reusable button component
**Variants**: primary, secondary, outline, ghost
**Sizes**: sm, md, lg
**States**: default, hover, active, disabled

#### Animated Button (components/ui/animated-button.tsx)
**Purpose**: Button with animation effects
**Features**:
- Hover animations
- Click feedback
- Loading state
- Ripple effect

---

## Animation System

### GSAP Integration

GSAP (GreenSock Animation Platform) provides high-performance animations.

**Features Used**:
- Timeline-based animations
- Easing functions
- Transform properties
- Scroll-triggered animations

**Performance Optimization**:
- Hardware acceleration via CSS transforms
- RequestAnimationFrame for smooth 60fps
- Lazy loading of animation library

### Lenis Smooth Scrolling

Lenis provides momentum-based smooth scrolling.

**Configuration**:
```typescript
const lenis = new Lenis({
  lerp: 0.08,              // Smoothing factor
  smoothWheel: true,       // Enable smooth wheel scrolling
  wheelMultiplier: 1,      // Scroll speed multiplier
  touchMultiplier: 2,      // Touch scroll multiplier
})
```

**Implementation Details**:
- Integrated with React component lifecycle
- Compatible with scroll-triggered animations
- Optimized for performance

---

## API Integration

### API Client (lib/api.ts)

The API client provides a centralized interface for backend communication.

**Features**:
- Request deduplication
- Response caching with TTL
- Automatic retry on failure
- Error handling and normalization
- TypeScript type safety

**Core Functions**:

```typescript
// Create custom mailbox
async function createCustomMailbox(username: string): Promise<Mailbox>

// Fetch messages for mailbox
async function fetchMessages(address: string): Promise<MailboxResponse>

// Fetch specific message
async function fetchMessage(messageId: string): Promise<Message>

// Download attachment
async function downloadAttachment(messageId: string, index: number): Promise<Blob>
```

**Error Handling**:
- Network errors: Automatic retry with exponential backoff
- HTTP errors: Mapped to user-friendly messages
- Timeout errors: Configurable timeout period

### Caching Strategy

**In-Memory Cache**:
- TTL: 60 seconds
- Key: Request URL
- Invalidation: Time-based expiration

**Benefits**:
- Reduced backend load
- Faster response times
- Improved user experience

---

## Security

### Input Sanitization

**Username Input**:
- Character whitelist: alphanumeric, hyphen, underscore, dot
- Length validation: 1-64 characters
- Client-side validation before API call

**Email Content**:
- HTML sanitization via DOMPurify
- Removal of dangerous tags: script, iframe, object
- Removal of event handlers: onclick, onerror
- Attribute whitelist for allowed HTML elements

### Content Security Policy

Recommended CSP headers (configured at deployment):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.yourdomain.com;
```

### HTTPS Enforcement

- All production deployments must use HTTPS
- Automatic HTTP to HTTPS redirect
- HSTS header recommended

### Data Protection

- No sensitive data stored in localStorage
- No cookies used for authentication
- Minimal client-side data retention
- Automatic cleanup on navigation

---

## Performance

### Optimization Techniques

**Code Splitting**:
- Automatic route-based splitting via Next.js
- Dynamic imports for heavy components
- Lazy loading of third-party libraries

**Image Optimization**:
- Next.js Image component for automatic optimization
- WebP format with fallback
- Responsive images with srcset
- Lazy loading below the fold

**Font Optimization**:
- Self-hosted fonts for performance
- Font display: swap for faster initial render
- Subset fonts to reduce file size

**JavaScript Optimization**:
- Tree shaking for unused code
- Minification and compression
- Modern build target (ES2020+)

### Performance Metrics

**Target Metrics**:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

**Monitoring**:
- Web Vitals API for real user monitoring
- Lighthouse CI for automated testing
- Performance budgets enforced in CI/CD

---

## Testing

### Test Strategy

**Unit Testing** (Future Implementation):
- Jest for test runner
- React Testing Library for component testing
- Coverage target: 80%

**Integration Testing** (Future Implementation):
- Playwright for end-to-end testing
- Critical user flows covered
- Cross-browser testing

**Type Safety**:
- TypeScript strict mode
- No implicit any
- Comprehensive type coverage

### Running Tests

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run e2e tests
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

---

## Maintenance

### Dependency Updates

Regular updates recommended:

```bash
# Check for outdated packages
pnpm outdated

# Update dependencies
pnpm update

# Update Next.js
pnpm add next@latest react@latest react-dom@latest
```

### Build Cache Management

```bash
# Clean Next.js cache
rm -rf .next

# Clean node modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Troubleshooting

**Build Failures**:
1. Clear cache: `rm -rf .next`
2. Reinstall dependencies: `pnpm install`
3. Check Node.js version compatibility

**Runtime Errors**:
1. Check browser console for errors
2. Verify environment variables
3. Check API connectivity

**Performance Issues**:
1. Profile with React DevTools
2. Check bundle size with `pnpm build`
3. Analyze with Lighthouse

---

## Additional Resources

### Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- GSAP: https://greensock.com/docs/

### Support
- GitHub Issues: Report bugs and request features
- Project Repository: https://github.com/SheerWill007/temp-mail

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: WilliamBenLaw
