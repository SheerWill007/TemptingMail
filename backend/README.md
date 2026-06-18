# 🔧 Temp Mail Backend

The backend component of the Temp Mail service, providing both an API server and an SMTP server for handling temporary email addresses.

## 🏗️ Architecture

```
Express.js API Server
├── REST API Endpoints
├── SMTP Email Server
├── PostgreSQL + Prisma ORM
├── Automatic Cleanup Service
└── Rate Limiting & CORS
```

## 📁 Directory Structure

```
backend/
├── dist/               # Compiled JavaScript files
├── prisma/
│   ├── migrations/     # Database migrations
│   └── schema.prisma   # Database schema
├── src/
│   ├── api/
│   │   ├── server.ts           # API routes
│   │   └── middleware/
│   │       └── rateLimit.ts    # Rate limiting
│   ├── lib/
│   │   ├── email.ts            # Email utilities
│   │   ├── prisma.ts           # Database client
│   │   └── posthog.ts          # Analytics
│   ├── services/
│   │   ├── cleanup.ts          # Email cleanup
│   │   └── scheduler.ts        # Cron jobs
│   ├── smtp/
│   │   └── server.ts           # SMTP server
│   └── index.ts                # Main entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm (recommended) or npm

### Installation

1. **Install dependencies**

```bash
pnpm install
```

2. **Set up environment variables**

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tempmail

# Domain Configuration
SMTP_DOMAIN=temp.willx.tech
MAIL_DOMAIN=temp.willx.tech

# Server Configuration
API_PORT=3001
SMTP_PORT=25

# Cleanup Service
CLEANUP_ENABLED=true
CLEANUP_LEADER=true

# CORS
FRONTEND_URL=https://temp.willx.tech
CORS_ORIGIN=https://temp.willx.tech

# Analytics (Optional)
POSTHOG_API_KEY=your_key

# Environment
NODE_ENV=development
```

3. **Set up database**

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate
```

4. **Start the server**

```bash
# Development mode with hot reload
pnpm dev

# Production mode
pnpm build
pnpm start
```

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
Response: { "ok": true }
```

### Create Custom Mailbox
```http
POST /api/mailboxes/custom
Content-Type: application/json

Request:
{
  "username": "john"
}

Response:
{
  "address": "john@temp.willx.tech",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-02T00:00:00.000Z"
}
```

### Get Messages for Mailbox
```http
POST /api/mailboxes/:address/messages

Response:
{
  "messages": [
    {
      "id": "msg_123",
      "subject": "Welcome",
      "from": "sender@example.com",
      "preview": "Email preview...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Specific Message
```http
GET /api/messages/:id

Response:
{
  "id": "msg_123",
  "subject": "Welcome",
  "from": "sender@example.com",
  "parsedData": {
    "html": "<html>...</html>",
    "text": "Plain text...",
    "attachments": []
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🛡️ Security & Rate Limiting

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| Mailbox Creation | 5 requests | 15 minutes |
| Message Access | 50 requests | 15 minutes |

### CORS Configuration

Allows requests from:
- Production domain: `https://temp.willx.tech`
- Local development: `http://localhost:3000`

### IP Detection

Supports multiple headers for accurate IP identification:
- `X-Forwarded-For` (AWS, most proxies)
- `CF-Connecting-IP` (Cloudflare)
- `X-Real-IP` (Nginx)
- Direct connection IP (fallback)

## 📧 SMTP Server

### Configuration

- **Port**: 25 (configurable)
- **Domain**: `temp.willx.tech`
- **Authentication**: Disabled (open relay for configured domain only)

### Email Processing

1. Receives email via SMTP
2. Validates recipient domain
3. Parses email content (HTML, text, attachments)
4. Stores in PostgreSQL as raw bytes
5. Auto-creates mailbox if doesn't exist
6. Sets 24-hour expiration

### Accepted Domains

Only accepts emails for: `@temp.willx.tech`

## 🗄️ Database Schema

### Mailbox Model
```prisma
model Mailbox {
  id        String    @id @default(cuid())
  address   String    @unique
  createdAt DateTime  @default(now())
  expiresAt DateTime?
  messages  Message[]

  @@index([expiresAt])
}
```

### Message Model
```prisma
model Message {
  id        String   @id @default(cuid())
  mailbox   Mailbox  @relation(fields: [mailboxId], references: [id], onDelete: Cascade)
  mailboxId String
  from      String
  subject   String?
  raw       Bytes
  createdAt DateTime @default(now())
  expiresAt DateTime?

  @@index([expiresAt])
}
```

## 🧹 Cleanup Service

### Features

- Automatic cleanup of expired emails and mailboxes
- Runs every hour via cron job
- Leader election for multi-instance deployments
- Configurable via environment variables

### Configuration

```env
CLEANUP_ENABLED=true     # Enable/disable cleanup
CLEANUP_LEADER=true      # Mark instance as leader
```

## 📊 Analytics

Optional PostHog integration for tracking:
- Email received events
- Message access events
- Mailbox creation events
- SMTP errors and issues

## 🛠️ Development

### Scripts

```bash
# Development
pnpm dev              # Start with hot reload

# Production
pnpm build            # Compile TypeScript
pnpm start            # Start production server

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio

# Testing
pnpm test             # Run tests (if configured)
```

### Hot Reload

Uses `tsx watch` for instant TypeScript reloading during development.

## 📦 Dependencies

### Core
- `express` - Web framework
- `cors` - CORS middleware
- `smtp-server` - SMTP server
- `mailparser` - Email parsing

### Database
- `@prisma/client` - Prisma ORM
- `prisma` - Prisma CLI

### Utilities
- `nanoid` - ID generation
- `node-cron` - Scheduled tasks
- `express-rate-limit` - Rate limiting
- `posthog-node` - Analytics

### Development
- `tsx` - TypeScript execution
- `typescript` - TypeScript compiler
- `@types/*` - Type definitions

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure PostgreSQL connection
- [ ] Set up DNS for SMTP domain
- [ ] Configure MX records
- [ ] Open port 25 for SMTP
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables
- [ ] Enable cleanup service
- [ ] Set up monitoring

### Recommended Platforms

- **VPS**: DigitalOcean, AWS EC2, Linode
- **Container**: Docker, Kubernetes
- **PaaS**: Railway, Render (Note: May need port 25 support)

## 🔍 Monitoring

### Health Check

```bash
curl https://api.willx.tech/api/health
```

### Logs

Structured logging with context:
```
[SMTP] Email received: user@temp.willx.tech
[API] Mailbox created: user@temp.willx.tech
[CLEANUP] Removed 42 expired messages
```

## 🤝 Contributing

See main [README.md](../README.md) for contribution guidelines.

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.

---

Made with ❤️ by [WilliamBenLaw](https://github.com/SheerWill007)