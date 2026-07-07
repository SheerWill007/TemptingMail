# Backend Services - Temporary Email Service

Enterprise-grade backend infrastructure providing SMTP server, RESTful API, and automated data lifecycle management for temporary email service.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [SMTP Server](#smtp-server)
- [Database Schema](#database-schema)
- [Security](#security)
- [Performance](#performance)
- [Monitoring](#monitoring)
- [Deployment](#deployment)
- [Maintenance](#maintenance)

---

## Overview

The backend services provide complete mail transfer agent functionality with SMTP protocol implementation, RESTful API for message retrieval, and automated cleanup scheduling. Built with Node.js and TypeScript for type safety and maintainability.

### Core Components

- **SMTP Server**: RFC 5321-compliant mail server for receiving emails
- **API Server**: Express-based REST API for mailbox and message operations
- **Database Layer**: PostgreSQL with Prisma ORM for data persistence
- **Cleanup Service**: Scheduled job for automatic data expiration
- **Middleware Layer**: Rate limiting, CORS, and request validation

### Service Capabilities

- Receive and process SMTP email traffic
- Parse multipart MIME messages with attachments
- Store raw email data with metadata
- Provide API access to mailbox contents
- Enforce rate limits per IP address
- Automatically expire and delete old data
- Support distributed deployments with leader election

---

## Architecture

### System Design

```
                    ┌─────────────────┐
                    │   API Clients   │
                    │   (Frontend)    │
                    └────────┬────────┘
                             │ HTTPS
                    ┌────────▼────────┐
                    │  Express API    │
                    │  (Port 3001)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌───────▼────────┐   ┌──────▼────────┐
│ Rate Limiting │   │   CORS Filter  │   │  Input Valid  │
│   Middleware  │   │   Middleware   │   │   Middleware  │
└───────┬───────┘   └───────┬────────┘   └──────┬────────┘
        └────────────────────┼────────────────────┘
                    ┌────────▼────────┐
                    │  Prisma Client  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │    Database     │
                    └────────▲────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────┴────────┐                       ┌───────┴────────┐
│  SMTP Server   │                       │ Cleanup Service│
│   (Port 25)    │                       │  (Hourly Cron) │
└───────▲────────┘                       └────────────────┘
        │ SMTP
┌───────┴────────┐
│  Mail Clients  │
│  (External)    │
└────────────────┘
```


### Request Flow

**API Request Flow**:
1. Client request received by Express server
2. General rate limiter validates request frequency
3. CORS middleware validates origin
4. Route-specific rate limiter applies endpoint limits
5. Controller processes request
6. Prisma client executes database query
7. Response formatted and returned to client

**SMTP Message Flow**:
1. External mail client initiates SMTP connection
2. Server responds with capability announcement
3. Client sends RCPT TO command with recipient
4. Server validates domain ownership
5. Server creates or updates mailbox record
6. Client sends message data
7. Server parses MIME structure
8. Raw bytes stored in database with metadata
9. Expiration timestamp set (24 hours)
10. Connection closed with success code

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+ with ECMAScript modules
- **Language**: TypeScript 5.7.3 (strict mode)
- **Framework**: Express 4.21.2
- **Database ORM**: Prisma 6.12.0
- **Database**: PostgreSQL 14+

### SMTP Processing
- **Server**: smtp-server 3.14.0
- **Parser**: mailparser 3.7.4
- **Protocol**: RFC 5321 SMTP, RFC 2045-2049 MIME

### Security and Middleware
- **Rate Limiting**: express-rate-limit 7.5.0
- **CORS**: cors 2.8.5
- **Input Validation**: Custom sanitization logic

### Scheduling and Utilities
- **Cron**: node-cron 3.0.3
- **ID Generation**: nanoid 5.1.5

### Development Tools
- **TypeScript Execution**: tsx 4.19.2
- **Type Definitions**: @types/* packages
- **Testing**: jest 29.7.0, supertest 7.0.0

### Optional Integrations
- **Analytics**: posthog-node 4.4.0

---

## Project Structure

```
backend/
├── dist/                           # Compiled JavaScript (generated)
│   └── index.js
│
├── prisma/                         # Database management
│   ├── migrations/                 # Migration history
│   │   ├── 20250720161723_init/
│   │   ├── 20250727163709_add_browser_id_to_mailbox/
│   │   ├── 20250728204649_store_raw_email_as_bytes/
│   │   ├── 20250729224524_raw_bytes/
│   │   └── migration_lock.toml
│   └── schema.prisma               # Database schema definition
│
├── src/                            # Source code
│   ├── api/                        # API server
│   │   ├── server.ts              # Express application and routes
│   │   ├── middleware/            # Request middleware
│   │   │   └── rateLimit.ts      # Rate limiting configuration
│   │   └── test/                  # API tests
│   │       └── rateLimit.test.ts
│   │
│   ├── smtp/                      # SMTP server
│   │   └── server.ts              # SMTP protocol implementation
│   │
│   ├── services/                  # Background services
│   │   ├── cleanup.ts             # Expiration cleanup logic
│   │   └── scheduler.ts           # Cron job scheduler
│   │
│   ├── lib/                       # Shared libraries
│   │   ├── prisma.ts              # Database client singleton
│   │   ├── email.ts               # Email utility functions
│   │   └── posthog.ts             # Analytics client
│   │
│   └── index.ts                   # Application entry point
│
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies and scripts
├── pnpm-lock.yaml                  # Dependency lock file
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

---

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- pnpm 8.0.0+ (recommended) or npm 9.0.0+

### Installation Steps

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Initialize database:
```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma migrate deploy
```

5. Verify installation:
```bash
pnpm build
```

---

## Configuration

### Environment Variables

All configuration is managed through environment variables defined in `.env` file.


**Required Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/tempmail` |
| `SMTP_DOMAIN` | Domain for email addresses | `temp.example.com` |
| `API_PORT` | Port for Express API server | `3001` |

**Optional Variables**:

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_PORT` | Port for SMTP server | `25` |
| `MAIL_DOMAIN` | Alternative domain specification | Value of `SMTP_DOMAIN` |
| `FRONTEND_URL` | Allowed CORS origin | None |
| `CORS_ORIGIN` | Comma-separated CORS origins | None |
| `CLEANUP_ENABLED` | Enable cleanup service | `true` |
| `CLEANUP_LEADER` | Designate cleanup leader | `true` |
| `NODE_ENV` | Environment mode | `development` |
| `POSTHOG_API_KEY` | Analytics API key | None |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

### Configuration Examples

**Development Configuration**:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/tempmail_dev
SMTP_DOMAIN=localhost
MAIL_DOMAIN=localhost
API_PORT=3001
SMTP_PORT=2525
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
CLEANUP_ENABLED=true
CLEANUP_LEADER=true
NODE_ENV=development
```

**Production Configuration**:
```bash
DATABASE_URL=postgresql://prod_user:secure_password@db.example.com:5432/tempmail
SMTP_DOMAIN=temp.example.com
MAIL_DOMAIN=temp.example.com
API_PORT=3001
SMTP_PORT=25
FRONTEND_URL=https://temp.example.com
CORS_ORIGIN=https://temp.example.com,https://www.temp.example.com
CLEANUP_ENABLED=true
CLEANUP_LEADER=true
NODE_ENV=production
POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxx
```

---

## API Documentation

### Endpoint Specifications

#### GET /api/health

Health check endpoint for monitoring service availability.

**Request**:
```http
GET /api/health HTTP/1.1
Host: api.example.com
```

**Response** (200 OK):
```json
{
  "ok": true
}
```

**Use Case**: Load balancer health checks, monitoring systems

---

#### POST /api/mailboxes/custom

Create a custom mailbox with specified username.

**Request**:
```http
POST /api/mailboxes/custom HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "username": "john"
}
```

**Response** (200 OK):
```json
{
  "address": "john@temp.example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-01-16T10:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid username format or length
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Database or server error

**Rate Limit**: 10 requests per 60 minutes per IP

**Validation Rules**:
- Username must be 1-64 characters
- Only alphanumeric, hyphen, underscore, dot allowed
- Case-insensitive (converted to lowercase)

---

#### POST /api/mailboxes/:address/messages

Retrieve all messages for a specific mailbox.

**Request**:
```http
POST /api/mailboxes/john@temp.example.com/messages HTTP/1.1
Host: api.example.com
```

**Response** (200 OK):
```json
{
  "address": "john@temp.example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-01-16T10:30:00.000Z",
  "messageCount": 3,
  "messages": [
    {
      "id": "clxxx1234567890",
      "from": "sender@example.com",
      "subject": "Welcome Email",
      "preview": "Thank you for signing up...",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

**Rate Limit**: 100 requests per 60 seconds per IP

**Notes**:
- Returns maximum 50 most recent messages
- Creates mailbox automatically if not exists
- Messages sorted by creation time (newest first)
- Preview truncated to 150 characters

---

#### GET /api/messages/:id

Retrieve complete message with parsed content.

**Request**:
```http
GET /api/messages/clxxx1234567890 HTTP/1.1
Host: api.example.com
```

**Response** (200 OK):
```json
{
  "id": "clxxx1234567890",
  "from": "sender@example.com",
  "subject": "Welcome Email",
  "createdAt": "2024-01-15T11:00:00.000Z",
  "mailbox": "john@temp.example.com",
  "parsedData": {
    "subject": "Welcome Email",
    "from": "sender@example.com",
    "text": "Plain text version of email...",
    "html": "<html><body>...</body></html>",
    "textAsHtml": "<p>Plain text version...</p>",
    "attachments": [
      {
        "filename": "document.pdf",
        "contentType": "application/pdf",
        "size": 12345,
        "contentId": null,
        "index": 0
      }
    ],
    "date": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses**:
- `404 Not Found`: Message ID does not exist
- `500 Internal Server Error`: Parsing or database error

**Rate Limit**: 100 requests per 60 seconds per IP

---

#### GET /api/messages/:id/attachments/:index

Download message attachment by index.

**Request**:
```http
GET /api/messages/clxxx1234567890/attachments/0 HTTP/1.1
Host: api.example.com
```

**Response** (200 OK):
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 12345

[Binary data]
```

**Error Responses**:
- `404 Not Found`: Message or attachment not found
- `500 Internal Server Error`: Retrieval error

**Rate Limit**: 100 requests per 60 seconds per IP

---

## SMTP Server

### Protocol Implementation

The SMTP server implements Simple Mail Transfer Protocol (RFC 5321) for receiving incoming email.


### Server Configuration

**Port**: Configurable via `SMTP_PORT` environment variable
- Production: 25 (standard SMTP port)
- Development: 2525 (non-privileged port)

**Authentication**: Disabled (open relay for configured domain only)

**Size Limits**: Configured via smtp-server defaults

### SMTP Transaction Flow

1. **Connection Established**
```
Client: [Connects to port 25]
Server: 220 temp.example.com SMTP Server
Client: EHLO client.example.com
Server: 250-temp.example.com
        250 SIZE 52428800
```

2. **Envelope Specification**
```
Client: MAIL FROM:<sender@example.com>
Server: 250 Accepted
Client: RCPT TO:<john@temp.example.com>
Server: [Domain validation occurs]
Server: 250 Accepted
```

3. **Message Transmission**
```
Client: DATA
Server: 354 End data with <CR><LF>.<CR><LF>
Client: [Message content]
Client: .
Server: 250 Message accepted
```

4. **Connection Termination**
```
Client: QUIT
Server: 221 Bye
```

### Domain Validation

The server validates recipient domain against configured `SMTP_DOMAIN`:

**Accepted**:
```
RCPT TO:<user@temp.example.com>  → 250 Accepted
```

**Rejected**:
```
RCPT TO:<user@other-domain.com>  → 550 Relay denied for domain other-domain.com
```

### Email Processing Pipeline

1. **Reception**: Receive raw SMTP stream
2. **Buffering**: Collect email data into memory buffer
3. **Parsing**: Parse MIME structure with mailparser
4. **Validation**: Verify recipient domain ownership
5. **Storage**: Store raw bytes in database with metadata
6. **Mailbox Creation**: Auto-create mailbox if not exists
7. **Expiration**: Set 24-hour TTL on message
8. **Acknowledgment**: Return success code to sender

### Supported Features

- Single and multiple recipients
- MIME multipart messages
- HTML and plain text content
- File attachments
- Inline images (Content-ID)
- International characters (UTF-8)
- Large messages (up to configured size limit)

### Unsupported Features

- SMTP Authentication (AUTH command disabled)
- TLS/STARTTLS (configure with reverse proxy)
- Multiple domain handling (single domain only)
- Delivery Status Notifications (DSN)
- Extended SMTP features beyond basic RFC 5321

---

## Database Schema

### Prisma Schema Definition

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Mailbox {
  id        String    @id @default(cuid())
  address   String    @unique
  createdAt DateTime  @default(now())
  expiresAt DateTime?
  messages  Message[]

  @@index([expiresAt])
}

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

### Schema Design Decisions

**Mailbox Model**:
- `id`: CUID for globally unique identifiers
- `address`: Email address (unique constraint)
- `createdAt`: Automatic timestamp on creation
- `expiresAt`: Nullable for flexible expiration policy
- `messages`: One-to-many relationship with Message

**Message Model**:
- `id`: CUID for message identification
- `mailboxId`: Foreign key to Mailbox (cascade delete)
- `from`: Sender email address (string)
- `subject`: Email subject (nullable)
- `raw`: Complete email as bytes (BYTEA in PostgreSQL)
- `createdAt`: Message receipt timestamp
- `expiresAt`: Message expiration timestamp

**Indexing Strategy**:
- Index on `expiresAt` for efficient cleanup queries
- Unique index on `address` for mailbox lookups
- Foreign key index automatic via Prisma

### Data Lifecycle

**Creation**:
1. Mailbox created on first RCPT TO or via API
2. Message created on DATA command completion
3. Both assigned 24-hour expiration timestamp

**Access**:
- Mailbox queried by address
- Messages queried by mailbox relationship
- Individual messages queried by ID

**Expiration**:
- Cleanup service runs hourly
- Deletes records where `expiresAt < NOW()`
- Cascade delete removes orphaned messages

---

## Security

### Security Controls

#### Input Validation

**Username Sanitization**:
```typescript
const sanitizedUsername = username
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9.\-_]/g, '');

if (!sanitizedUsername || sanitizedUsername.length < 1 || sanitizedUsername.length > 64) {
  throw new Error('Invalid username');
}
```

**Domain Validation**:
```typescript
function isOurDomain(addr: string): boolean {
  const domain = extractDomain(addr);
  return domain === allowedDomain.toLowerCase();
}
```

#### Rate Limiting Configuration

**Mailbox Creation**:
- Window: 60 minutes
- Maximum: 10 requests per IP
- Headers: Standard rate limit headers enabled

**Message Access**:
- Window: 60 seconds  
- Maximum: 100 requests per IP
- Headers: Standard rate limit headers enabled

**General API**:
- Window: 60 seconds
- Maximum: 200 requests per IP
- Headers: Standard rate limit headers enabled

#### CORS Security

**Origin Validation**:
- Whitelist-based approach
- Environment variable configuration
- Default local development origins
- Reject all other origins with error

**Headers**:
- Credentials: Disabled
- Methods: GET, POST only
- Exposed Headers: Standard set

#### SQL Injection Prevention

**Mitigation Strategy**:
- Prisma ORM with parameterized queries
- No raw SQL queries in application code
- Type-safe database operations
- Automatic query escaping

#### SMTP Relay Prevention

**Protection Mechanism**:
- Domain whitelist enforcement
- RCPT TO validation before DATA
- Rejection of external domains
- Error code 550 for denied relays

### Security Best Practices

1. **Never log sensitive data**: Email content logged only at metadata level
2. **Use environment variables**: All secrets in environment, not code
3. **Enable HTTPS**: Always use TLS for API connections
4. **Regular updates**: Keep dependencies current with security patches
5. **Principle of least privilege**: Database user has minimal required permissions

### Security Audit Findings

**Strengths**:
- Comprehensive input validation
- Effective rate limiting
- SQL injection protection via ORM
- SMTP relay prevention
- Automatic data expiration

**Recommendations**:
1. Implement request logging for audit trails
2. Add database encryption at rest
3. Consider implementing DKIM signing
4. Add monitoring for suspicious patterns
5. Implement API key authentication for administrative endpoints

---

## Performance

### Optimization Techniques

**Database Performance**:
- Connection pooling via Prisma
- Strategic indexes on query columns
- Batch operations for cleanup
- Prepared statement caching

**SMTP Performance**:
- Asynchronous stream processing
- Non-blocking I/O operations
- Memory-efficient buffer handling
- Concurrent connection support

**API Performance**:
- JSON parsing middleware
- Response compression (via reverse proxy)
- Efficient error handling
- Minimal middleware stack

### Performance Metrics

**Target Metrics**:
- API Health Check: < 50ms
- Mailbox Creation: < 200ms
- Message List: < 300ms
- Message Retrieval: < 400ms
- SMTP Processing: < 2s per message

**Scalability**:
- Horizontal scaling via load balancer
- Leader election for cleanup service
- Stateless API design
- Database connection pooling


---

## Monitoring

### Logging Strategy

**Log Levels**:
- INFO: Normal operations (mailbox creation, message receipt)
- WARN: Rate limit violations, suspicious patterns
- ERROR: System errors, database failures

**Log Format**:
```
[COMPONENT] Description: {context}
```

**Examples**:
```
[SMTP] Email received: user@temp.example.com
[API] Mailbox created: user@temp.example.com
[CLEANUP] Removed 42 expired messages
[RATE LIMIT EXCEEDED] IP: 192.168.1.1, Endpoint: /api/mailboxes/custom
[ERROR] Database error: connection timeout
```

### Health Monitoring

**Health Check Endpoint**:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"ok": true}
```

**Database Health**:
```bash
pnpm prisma db execute --sql "SELECT 1"
```

**Process Monitoring**:
```bash
pm2 status
pm2 monit
pm2 logs backend
```

### Metrics Collection

**System Metrics**:
- CPU usage
- Memory consumption
- Disk I/O
- Network throughput

**Application Metrics**:
- Request rate per endpoint
- Response times (p50, p95, p99)
- Error rate
- Rate limit hits

**Business Metrics**:
- Mailboxes created per hour
- Messages received per hour
- Average message size
- Cleanup efficiency

### Alert Configuration

**Critical Alerts**:
- Database connection failure
- SMTP server not responding
- Disk space below 10%
- Memory usage above 90%

**Warning Alerts**:
- High error rate (> 5%)
- Slow response times (> 2s p95)
- High rate limit hits
- Cleanup backlog growing

---

## Deployment

### Production Deployment

#### Prerequisites
- VPS with Ubuntu 22.04 LTS or similar
- Root or sudo access
- Public IP address
- Port 25 access enabled (contact hosting provider)

#### Deployment Steps

1. **Server Setup**:
```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs postgresql postgresql-contrib
npm install -g pm2 pnpm
```

2. **Database Configuration**:
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE tempmail;
CREATE USER tempmail_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE tempmail TO tempmail_user;
\q
```

3. **Application Deployment**:
```bash
mkdir -p /var/www/temp-mail
cd /var/www/temp-mail
git clone <repository-url> .
cd backend
pnpm install --prod
cp .env.example .env
# Edit .env with production values
pnpm prisma:generate
pnpm prisma migrate deploy
pnpm build
```

4. **Process Manager Configuration**:
```bash
pm2 start dist/index.js --name temp-mail-backend
pm2 save
pm2 startup
```

5. **Firewall Configuration**:
```bash
ufw allow 22/tcp
ufw allow 25/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma:generate && pnpm build

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001 25
CMD ["node", "dist/index.js"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3001:3001"
      - "25:25"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/tempmail
      SMTP_DOMAIN: temp.example.com
      API_PORT: 3001
      NODE_ENV: production
    depends_on:
      - db
  
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: tempmail
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Deploy with:
```bash
docker-compose up -d
```

### Kubernetes Deployment

**Deployment Manifest**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: temp-mail-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: temp-mail-backend
  template:
    metadata:
      labels:
        app: temp-mail-backend
    spec:
      containers:
      - name: backend
        image: temp-mail-backend:latest
        ports:
        - containerPort: 3001
        - containerPort: 25
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: temp-mail-secrets
              key: database-url
        - name: NODE_ENV
          value: "production"
```

---

## Maintenance

### Routine Maintenance Tasks

**Daily**:
- Monitor log files for errors
- Check disk space usage
- Verify cleanup service execution

**Weekly**:
- Review rate limit violations
- Analyze performance metrics
- Check for security updates

**Monthly**:
- Update dependencies
- Review and archive logs
- Database vacuum and analyze

### Database Maintenance

**Vacuum Operation**:
```sql
VACUUM ANALYZE "Mailbox";
VACUUM ANALYZE "Message";
```

**Index Rebuilding**:
```sql
REINDEX TABLE "Mailbox";
REINDEX TABLE "Message";
```

**Size Monitoring**:
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup and Recovery

**Database Backup**:
```bash
pg_dump -U tempmail_user -d tempmail -F c -f backup_$(date +%Y%m%d).dump
```

**Database Restore**:
```bash
pg_restore -U tempmail_user -d tempmail -c backup_20240115.dump
```

**Application Backup**:
```bash
tar -czf backend_backup_$(date +%Y%m%d).tar.gz /var/www/temp-mail/backend
```

### Troubleshooting

**SMTP Server Not Receiving**:
1. Verify port 25 is open: `netstat -tlnp | grep 25`
2. Check firewall rules: `ufw status`
3. Test with telnet: `telnet localhost 25`
4. Review SMTP logs: `pm2 logs | grep SMTP`

**API Server Not Responding**:
1. Check process status: `pm2 status`
2. Review error logs: `pm2 logs temp-mail-backend --err`
3. Verify port binding: `netstat -tlnp | grep 3001`
4. Check database connection: `pnpm prisma db execute --sql "SELECT 1"`

**Database Connection Issues**:
1. Verify PostgreSQL is running: `systemctl status postgresql`
2. Check connection string in .env
3. Test database connectivity: `psql -U tempmail_user -d tempmail -c "SELECT 1"`
4. Review PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-14-main.log`

**Performance Degradation**:
1. Check system resources: `htop`
2. Review database performance: `pg_stat_activity`
3. Analyze slow queries: `pg_stat_statements`
4. Check disk I/O: `iostat -x 1`

### Upgrade Procedures

**Dependency Updates**:
```bash
cd backend
pnpm update
pnpm audit
pnpm test
```

**Database Migrations**:
```bash
# Create migration
pnpm prisma migrate dev --name description

# Apply in production
pnpm prisma migrate deploy
```

**Zero-Downtime Deployment**:
1. Start new instance on different port
2. Run health checks on new instance
3. Update load balancer to route to new instance
4. Monitor for errors
5. Stop old instance after validation

---

## Development

### Development Environment

**Setup**:
```bash
cd backend
pnpm install
cp .env.example .env
# Configure for local development
pnpm prisma:generate
pnpm prisma migrate dev
```

**Running**:
```bash
# Development mode with hot reload
pnpm dev

# Production build
pnpm build

# Start production build
pnpm start
```

### Available Scripts

```bash
# Development
pnpm dev                    # Start with hot reload

# Build
pnpm build                  # Compile TypeScript

# Production
pnpm start                  # Run compiled code

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate         # Create and apply migration
pnpm prisma migrate deploy  # Apply migrations (production)
pnpm prisma studio          # Open Prisma Studio GUI

# Testing
pnpm test                   # Run tests
pnpm test:watch             # Run tests in watch mode
pnpm test:coverage          # Generate coverage report
```

### Code Quality

**TypeScript Configuration**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Testing Strategy**:
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for SMTP flow
- Coverage target: 80%

---

## Additional Resources

### Documentation
- Express.js: https://expressjs.com
- Prisma: https://www.prisma.io/docs
- smtp-server: https://nodemailer.com/extras/smtp-server/
- RFC 5321 (SMTP): https://tools.ietf.org/html/rfc5321

### Support
- GitHub Issues: https://github.com/SheerWill007/temp-mail/issues
- Project Repository: https://github.com/SheerWill007/temp-mail

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: WilliamBenLaw
