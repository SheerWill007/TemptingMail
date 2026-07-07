# 📧 Temp Mail - Modern Temporary Email Service

A sleek, modern temporary email service with smooth animations and a premium user experience. Built with Next.js 15, TypeScript, GSAP, and a custom SMTP server powered by Node.js.

![Temp Mail](./frontend/public/PBX1.png)

[Live Demo](https://temp.willx.tech) | [Report Bug](https://github.com/SheerWill007/temp-mail/issues) | [Request Feature](https://github.com/SheerWill007/temp-mail/issues)

---

## ✨ Features

- **Instant Email Creation** - Generate temporary email addresses without registration
- **Custom Usernames** - Create personalized temporary email addresses
- **Modern UI** - Glassmorphism-inspired design with floating cards and smooth animations
- **Smooth Scrolling** - Lenis-powered smooth page transitions
- **GSAP Animations** - Interactive floating cards with mouse parallax effects
- **Fully Responsive** - Optimized for mobile, tablet, and desktop
- **Real SMTP Server** - Fully functional mail server that receives actual emails
- **Real-time Updates** - Auto-refresh mailbox with smart polling
- **Privacy First** - Emails auto-delete after 24 hours, no registration required
- **HTML Email Support** - View rich HTML emails with inline images and attachments
- **Production Ready** - Robust error handling, rate limiting, and security features

---

## 🎨 Design Philosophy

Built with a glassmorphism-inspired aesthetic featuring:

- **Borderless Cards** - Clean shadows instead of borders
- **Floating Animations** - GSAP-powered 3D card effects
- **Custom Color Palette** - Carefully crafted warm desert-inspired theme
- **Smooth Interactions** - 60fps animations throughout
- **Visual Hierarchy** - Clear focus with animated UI elements

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Pixel White | `#DBDBDB` | Light backgrounds and text |
| Existential Angst | `#0A0A0A` | Dark backgrounds |
| Dark Summoning | `#373839` | Primary elements |
| Million Grey | `#999999` | Secondary elements |
| Kettleman | `#5F6062` | Muted text |
| Inkwell Inception | `#1F1F20` | Dark mode cards |
| Terracotta Sunset | `#D17850` | Accent and highlights |

---

## 🏗️ Architecture

### Frontend Stack

```
Next.js 15 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS
├── GSAP (Animations)
├── Lenis (Smooth Scroll)
├── Radix UI (Components)
└── PostHog (Analytics)
```

### Backend Stack

```
Node.js + Express
├── TypeScript
├── Prisma ORM
├── PostgreSQL
├── SMTP Server (smtp-server)
├── MailParser (Email parsing)
├── Node Cron (Cleanup scheduler)
├── Express Rate Limit
└── PostHog Analytics
```

### Infrastructure

```
Production Setup
├── VPS Server (DigitalOcean/AWS EC2)
├── PostgreSQL Database
├── Nginx (Reverse Proxy)
├── PM2 (Process Manager)
├── Let's Encrypt (SSL/TLS)
└── DNS (A & MX Records)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm
- Git

### Local Development Setup

#### 1. Clone the repository

```bash
git clone https://github.com/SheerWill007/temp-mail.git
cd temp-mail
```

#### 2. Backend Setup

```bash
cd backend
pnpm install

# Create .env file from example
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tempmail

# Domain Configuration
SMTP_DOMAIN=localhost
MAIL_DOMAIN=localhost

# Server Configuration
API_PORT=3001
SMTP_PORT=2525  # Use non-privileged port for dev

# Cleanup Service
CLEANUP_ENABLED=true
CLEANUP_LEADER=true

# CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
```

```bash
# Setup database
pnpm prisma:generate
pnpm prisma migrate dev

# Start backend
pnpm dev
```

#### 3. Frontend Setup

```bash
cd frontend
pnpm install

# Create .env.local
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MAIL_DOMAIN=localhost
```

```bash
# Start frontend
pnpm dev
```

#### 4. Open your browser

Navigate to [http://localhost:3000](http://localhost:3000)

**Note:** For local development, the SMTP server runs on port 2525. To receive test emails, you can use tools like [Mailtrap](https://mailtrap.io) or send emails directly via telnet to localhost:2525.

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

## 📡 API Endpoints

### Health Check
```http
GET /api/health

Response: 200 OK
{
  "ok": true
}
```

### Create Custom Mailbox
```http
POST /api/mailboxes/custom
Content-Type: application/json

Request:
{
  "username": "john"
}

Response: 200 OK
{
  "address": "john@temp.willx.tech",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-02T00:00:00.000Z"
}
```

### Get Mailbox Messages
```http
POST /api/mailboxes/:address/messages

Response: 200 OK
{
  "address": "john@temp.willx.tech",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-02T00:00:00.000Z",
  "messageCount": 2,
  "messages": [
    {
      "id": "msg_123",
      "from": "sender@example.com",
      "subject": "Welcome",
      "preview": "Email preview text...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Specific Message
```http
GET /api/messages/:id

Response: 200 OK
{
  "id": "msg_123",
  "from": "sender@example.com",
  "subject": "Welcome",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "mailbox": "john@temp.willx.tech",
  "parsedData": {
    "html": "<html>...</html>",
    "text": "Plain text version",
    "attachments": [
      {
        "filename": "document.pdf",
        "contentType": "application/pdf",
        "size": 12345,
        "index": 0
      }
    ]
  }
}
```

### Download Attachment
```http
GET /api/messages/:id/attachments/:index

Response: 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"

[Binary Data]
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tempmail

# Domain Configuration
SMTP_DOMAIN=temp.willx.tech
MAIL_DOMAIN=temp.willx.tech

# Server Configuration
API_PORT=3001
SMTP_PORT=25  # Port 25 for production, 2525 for development

# Cleanup Service (Automatic email deletion)
CLEANUP_ENABLED=true
CLEANUP_LEADER=true

# CORS Configuration
FRONTEND_URL=https://temp.willx.tech
CORS_ORIGIN=https://temp.willx.tech

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100

# Environment
NODE_ENV=production

# Analytics (Optional)
POSTHOG_API_KEY=your_posthog_key
```

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MAIL_DOMAIN=localhost

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 🎬 Animation Features

### Floating Card Animation
- **Entrance Animation**: Smooth fade-in with scale and translation
- **Floating Loop**: Continuous y-axis oscillation using sine wave motion
- **Mouse Parallax**: 3D rotation effect following mouse position
- **Auto-Return**: Smoothly returns to neutral position when mouse leaves
- **Performance**: Hardware-accelerated transforms for 60fps

### Smooth Scrolling
- **Lenis Integration**: Hardware-accelerated smooth scrolling
- **Custom Configuration**: `lerp: 0.08` for natural, responsive feel
- **Wheel Multiplier**: Optimized scroll sensitivity for different devices
- **Touch Support**: Smooth momentum scrolling on mobile devices

---

## 🔒 Security Features

### Rate Limiting
- **Mailbox Creation**: 5 requests per 15 minutes per IP
- **Message Access**: 50 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP
- **IP Detection**: Supports X-Forwarded-For, CF-Connecting-IP, X-Real-IP headers

### Privacy & Data Protection
- **24-Hour Auto-Delete**: All emails and mailboxes expire automatically
- **No Registration**: Zero personal information required
- **No Permanent Storage**: Raw email bytes stored temporarily only
- **CORS Protection**: Strict origin validation
- **Domain Validation**: Only accepts emails for configured domains

### Email Security
- **Relay Prevention**: Rejects emails not destined for your domain
- **Size Limits**: Prevents abuse through oversized emails
- **Sanitized HTML**: Safe rendering of email content
- **Attachment Handling**: Secure attachment downloads with proper headers

---

## ⚡ Performance

- **60 FPS Animations**: Hardware-accelerated GSAP transforms
- **Optimized Rendering**: React 19 with automatic batching
- **Smart Polling**: Intelligent mailbox refresh with exponential backoff
- **Lazy Loading**: On-demand component and route loading
- **Database Indexing**: Optimized queries with indexed timestamps
- **Connection Pooling**: Efficient PostgreSQL connection management
- **Streaming Responses**: Large emails handled via streams
- **Asset Optimization**: Next.js automatic image and font optimization

---

## Responsive Design

| Breakpoint | Device | Layout |
|------------|--------|--------|
| < 768px | Mobile | Stacked, touch-optimized |
| 768px - 1024px | Tablet | Hybrid layout |
| > 1024px | Desktop | Full-featured with Screen component |

---

## 🚀 Deployment Guide

### Backend Deployment (VPS Required)

**⚠️ Important:** The backend requires a VPS with port 25 access for SMTP functionality. PaaS platforms like Heroku, Railway, or Render block port 25 for spam prevention.

#### Recommended VPS Providers
- **DigitalOcean** ($6/month) - Port 25 open by default
- **Linode/Akamai** ($5/month) - Request port 25 access via support
- **AWS EC2** (t3.micro) - Request SMTP limit removal
- **Hetzner Cloud** (~€5/month) - Port 25 usually open
- **Vultr** ($6/month) - Port 25 available

#### VPS Setup Steps

1. **Initial Server Setup**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install process manager
npm install -g pm2 pnpm
```

2. **Database Setup**
```bash
sudo -u postgres psql
CREATE DATABASE tempmail;
CREATE USER tempmail_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tempmail TO tempmail_user;
\q
```

3. **Deploy Backend**
```bash
# Clone repository
git clone <your-repo-url> /var/www/temp-mail
cd /var/www/temp-mail/backend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Setup database
pnpm prisma:generate
pnpm prisma migrate deploy

# Build
pnpm build

# Start with PM2
pm2 start dist/index.js --name temp-mail-backend
pm2 save
pm2 startup
```

4. **Configure Firewall**
```bash
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 25/tcp   # SMTP
ufw enable
```

5. **Setup Nginx Reverse Proxy**
```bash
apt install -y nginx

# Create config
nano /etc/nginx/sites-available/temp-mail
```

```nginx
server {
    listen 80;
    server_name temp.yourdomain.com api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/temp-mail /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

6. **Setup SSL Certificate**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d temp.yourdomain.com -d api.yourdomain.com
```

### Frontend Deployment

#### Option 1: Vercel (Recommended)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_BASE`: https://api.yourdomain.com
- `NEXT_PUBLIC_SITE_URL`: https://temp.yourdomain.com
- `NEXT_PUBLIC_MAIL_DOMAIN`: temp.yourdomain.com

#### Option 2: Self-Hosted with Nginx

```bash
cd frontend
pnpm build

# Serve with nginx or PM2
pm2 start npm --name "temp-mail-frontend" -- start
```

### DNS Configuration

Configure these DNS records:

```
# A Records
temp.yourdomain.com    →  Your VPS IP
api.yourdomain.com     →  Your VPS IP

# MX Record (for email)
@  MX  10  temp.yourdomain.com

# SPF Record (recommended)
@  TXT  "v=spf1 ip4:YOUR_VPS_IP -all"

# DMARC Record (optional)
_dmarc  TXT  "v=DMARC1; p=none; rua=mailto:admin@yourdomain.com"
```

### Post-Deployment Checklist

- [ ] Backend API accessible via HTTPS
- [ ] SMTP server listening on port 25
- [ ] PostgreSQL database connected
- [ ] Frontend deployed and accessible
- [ ] DNS records configured (A, MX)
- [ ] SSL certificates active
- [ ] Firewall configured
- [ ] PM2 auto-restart enabled
- [ ] Rate limiting active
- [ ] Cleanup service running
- [ ] Test email send/receive

### Testing Your Deployment

```bash
# Test API health
curl https://api.yourdomain.com/api/health

# Test SMTP server
telnet your-vps-ip 25
# Then type:
EHLO localhost
MAIL FROM:<test@example.com>
RCPT TO:<testuser@temp.yourdomain.com>
DATA
Subject: Test Email
This is a test.
.
QUIT

# Test mailbox creation
curl -X POST https://api.yourdomain.com/api/mailboxes/custom \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}'
```

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Test rate limiting
pnpm test src/api/test/rateLimit.test.ts
```

### Frontend Testing

```bash
cd frontend

# Run tests (when configured)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Manual Testing

```bash
# Test SMTP server locally
telnet localhost 2525
EHLO localhost
MAIL FROM:<sender@example.com>
RCPT TO:<testuser@localhost>
DATA
Subject: Test Email
This is a test message.
.
QUIT

# Test API endpoints
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/mailboxes/custom \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'
```

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, feature additions, or documentation improvements, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation
4. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update README if needed

### Reporting Issues

Found a bug or have a feature request? Please open an issue with:
- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🌟 Acknowledgments & Credits

This project wouldn't be possible without these amazing open-source tools:

- **[Next.js](https://nextjs.org/)** - The React Framework for Production
- **[GSAP](https://greensock.com/gsap/)** - Professional-grade animation library
- **[Lenis](https://github.com/studio-freight/lenis)** - Smooth scroll library
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[smtp-server](https://nodemailer.com/extras/smtp-server/)** - Create custom SMTP servers
- **[mailparser](https://nodemailer.com/extras/mailparser/)** - Parse email messages
- **[Express](https://expressjs.com/)** - Fast, minimalist web framework
- **[PostHog](https://posthog.com/)** - Open-source product analytics

Special thanks to the open-source community for making tools like these freely available.



## 👤 Author

**WilliamBenLaw**

- GitHub: [@SheerWill007](https://github.com/SheerWill007)
- Website: [willx.tech](https://willx.tech)
- Project: [Temp Mail](https://temp.willx.tech)

---

## 📞 Support

If you encounter any issues or have questions:

- 🐛 [Report a Bug](https://github.com/SheerWill007/temp-mail/issues)
- 💡 [Request a Feature](https://github.com/SheerWill007/temp-mail/issues)
- 📖 [Documentation](https://github.com/SheerWill007/temp-mail)

---

## ⭐ Show Your Support

If you find this project useful, please consider giving it a star on GitHub! It helps others discover the project.

---

[Back to top](#-temp-mail---modern-temporary-email-service)