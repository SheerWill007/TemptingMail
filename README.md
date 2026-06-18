# Temp Mail - Modern Temporary Email Service

A sleek, modern temporary email service with smooth animations and a premium user experience. Built with Next.js 15, TypeScript, GSAP, and PostgreSQL.

![Temp Mail](./frontend/public/temp-mail-image.png)

[Live Demo](https://temp.willx.tech) | [Report Bug](https://github.com/SheerWill007/temp-mail/issues) | [Request Feature](https://github.com/SheerWill007/temp-mail/issues)

---

## Features

- **Instant Email Creation** - Generate temporary email addresses without registration
- **Modern UI** - Borderless design with floating cards and smooth animations
- **Smooth Scrolling** - Lenis-powered smooth page transitions
- **GSAP Animations** - Interactive floating cards with mouse parallax effects
- **Dark/Light Mode** - Theme switching with custom color palette
- **Fully Responsive** - Optimized for mobile, tablet, and desktop
- **Real-time Updates** - Auto-refresh mailbox with smart polling
- **Privacy First** - Emails auto-delete after 24 hours
- **Production Ready** - Robust error handling and rate limiting

---

## Design Philosophy

Built with a glassmorphism-inspired aesthetic featuring:

- **Borderless Cards** - Clean shadows instead of borders
- **Floating Animations** - GSAP-powered 3D card effects
- **Custom Color Palette** - Carefully crafted black/white/gray theme
- **Smooth Interactions** - 60fps animations throughout

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Pixel White | `#DBDBDB` | Light background |
| Existential Angst | `#0A0A0A` | Dark background |
| Dark Summoning | `#373839` | Primary elements |
| Million Grey | `#999999` | Secondary elements |
| Kettleman | `#5F6062` | Muted text |
| Inkwell Inception | `#1F1F20` | Dark mode cards |

---

## Architecture

### Frontend Stack

```
Next.js 15 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS 4
├── GSAP (Animations)
├── Lenis (Smooth Scroll)
└── Radix UI (Components)
```

### Backend Stack

```
Node.js + Express
├── TypeScript
├── Prisma ORM
├── PostgreSQL
├── SMTP Server
└── Node Cron (Cleanup)
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm (recommended) or npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/SheerWill007/temp-mail.git
cd temp-mail
```

2. Backend Setup

```bash
cd backend
pnpm install

# Create .env file
cp .env.example .env

# Configure your .env
DATABASE_URL=postgresql://user:password@localhost:5432/tempmail
SMTP_DOMAIN=temp.willx.tech
API_PORT=3001

# Run migrations
pnpm prisma:migrate
pnpm prisma:generate

# Start backend
pnpm dev
```

3. Frontend Setup

```bash
cd frontend
pnpm install

# Install animation libraries
pnpm add gsap lenis

# Create .env.local
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Start frontend
pnpm dev
```

4. Open your browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
temp-mail/
├── backend/
│   ├── prisma/
│   │   ├── migrations/         # Database migrations
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── api/
│   │   │   ├── server.ts       # API routes
│   │   │   └── middleware/     # Rate limiting, CORS
│   │   ├── smtp/
│   │   │   └── server.ts       # SMTP server
│   │   ├── services/
│   │   │   ├── cleanup.ts      # Email cleanup
│   │   │   └── scheduler.ts    # Cron jobs
│   │   ├── lib/
│   │   │   ├── email.ts        # Email utilities
│   │   │   ├── prisma.ts       # Database client
│   │   │   └── posthog.ts      # Analytics
│   │   └── index.ts            # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── layout.tsx          # Root layout
    │   ├── page.tsx            # Homepage
    │   └── mailbox/            # Mailbox pages
    ├── components/
    │   ├── FloatingCard.tsx    # GSAP animated card
    │   ├── SmoothScrollProvider.tsx
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   └── BorderDecoration.tsx
    │   └── ui/                 # Radix UI components
    ├── lib/
    │   ├── api.ts              # API client
    │   └── utils.ts            # Utilities
    ├── styles/
    │   └── globals.css         # Global styles
    ├── package.json
    └── tsconfig.json
```

---

## API Endpoints

### Health Check
```http
GET /api/health
```

### Create Mailbox
```http
POST /api/mailboxes/custom
Content-Type: application/json

{
  "username": "john"
}
```

### Get Messages
```http
POST /api/mailboxes/:address/messages
```

### Get Message
```http
GET /api/messages/:id
```

---

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tempmail

# Domain Configuration
SMTP_DOMAIN=temp.willx.tech
MAIL_DOMAIN=temp.willx.tech

# Server Ports
API_PORT=3001
SMTP_PORT=25

# Cleanup Service
CLEANUP_ENABLED=true
CLEANUP_LEADER=true

# CORS
FRONTEND_URL=https://temp.willx.tech

# Analytics (Optional)
POSTHOG_API_KEY=your_key
```

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Animation Features

### Floating Card Animation
- Entrance Animation: Smooth fade-in with scale and translation
- Floating Loop: Continuous y-axis oscillation (sine wave)
- Mouse Parallax: 3D rotation following mouse position
- Auto-Return: Smoothly returns to neutral position on mouse leave

### Smooth Scrolling
- Lenis Integration: Hardware-accelerated smooth scrolling
- Custom Configuration: `lerp: 0.08` for natural feel
- Wheel Multiplier: Optimized for different devices

---

## Security Features

### Rate Limiting
- Mailbox Creation: 5 requests / 15 minutes
- Message Access: 50 requests / 15 minutes
- General API: 100 requests / 15 minutes

### Privacy
- 24-Hour Expiration: All emails auto-delete
- No Registration: Complete anonymity
- No Tracking: Privacy-first approach

---

## Performance

- 60 FPS Animations: Hardware-accelerated GSAP
- Optimized Rendering: React 19 with automatic batching
- Smart Caching: Request deduplication
- Lazy Loading: On-demand component loading
- Database Indexing: Optimized queries with Prisma

---

## Responsive Design

| Breakpoint | Device | Layout |
|------------|--------|--------|
| < 768px | Mobile | Stacked, touch-optimized |
| 768px - 1024px | Tablet | Hybrid layout |
| > 1024px | Desktop | Full-featured with Screen component |

---

## Deployment

### Backend (Node.js Server)

```bash
# Build
cd backend
pnpm build

# Start production server
pnpm start
```

Recommended Platforms:
- AWS EC2
- DigitalOcean Droplet
- Heroku
- Railway

### Frontend (Vercel)

```bash
# Build
cd frontend
pnpm build

# Deploy to Vercel
vercel --prod
```

Recommended Platforms:
- Vercel (Recommended)
- Netlify
- AWS Amplify

### DNS Configuration

```
# A Record
temp.willx.tech → Your Server IP

# MX Record
temp.willx.tech → Mail Server
Priority: 10
```

### SSL Certificate

```bash
# Using certbot
certbot --nginx -d temp.willx.tech
```

---

## Testing

```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
cd frontend
pnpm test
```

---

## Contributing

Contributions are welcome. Please feel free to submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

WilliamBenLaw

- GitHub: [@SheerWill007](https://github.com/SheerWill007)
- Website: [willx.tech](https://willx.tech)

---

## Acknowledgments

- [GSAP](https://greensock.com/gsap/) - Animation library
- [Lenis](https://github.com/studio-freight/lenis) - Smooth scrolling
- [Next.js](https://nextjs.org/) - React framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

[Back to top](#temp-mail---modern-temporary-email-service)