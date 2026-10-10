# Temp Mail

A self-hosted disposable email service. Pick a name (or get a random one), share the address, and watch mail arrive in the browser instantly. Mailboxes and messages delete themselves after 24 hours.

![Temp Mail](./docs/screenshot.png)

**Product**

- **Instant delivery**: new mail is pushed to the open inbox over Server-Sent Events, with a polling fallback.
- **Safe email rendering**: HTML is sanitized and shown in a sandboxed, script-free iframe. Remote images and trackers are blocked until you allow them.
- **Attachments, inline images and `.eml` download.** Mailboxes and messages can be deleted.
- **Random or custom addresses.** Recently used mailboxes are remembered on the device.

**Platform**

- **Receive-only SMTP server**: no open relay, and reserved role addresses (`admin@`, `postmaster@`, ...) can never be claimed.
- **Observability**: request IDs end to end, structured JSON logs, Prometheus metrics, and liveness/readiness probes.
- **Documented API**: an OpenAPI 3.1 spec served at `/api/openapi.yaml`, with stable error codes.
- **Horizontally scalable**: stateless backend, with live events shared across instances through Postgres LISTEN/NOTIFY.
- **Production packaging**: Docker images, a Compose stack with automatic HTTPS (Caddy), CI with integration tests against real Postgres, CodeQL, Dependabot, and signed-provenance image releases.
- **Privacy**: no accounts. Optional analytics never receive addresses or message content.

## Contents

- [Architecture](#architecture)
- [Quick start](#quick-start-local-development)
- [Deploying](#deploying)
- [Configuration](#configuration)
- [API](#api)
- [Project docs](#project-docs)
- [License](#license)

## Architecture

```
 Browser ──HTTPS──► Caddy ──/api/*──► backend: HTTP API (:3001) + live events ──┐
                      └────other────► frontend: Next.js (:3000)                  ├──► PostgreSQL
 Mail servers ──SMTP :25──────────► backend: SMTP server (:2525) ───────────────┘
```

| Part        | Stack                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `frontend/` | Next.js 16 (App Router), React 19, Tailwind CSS 4, DOMPurify                                    |
| `backend/`  | Node 24, Express 5, `smtp-server` + `mailparser`, Prisma 7 (PostgreSQL), Zod, Pino, prom-client |
| `deploy/`   | Caddyfile (automatic HTTPS)                                                                     |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for request flows, the data model and design decisions.

## Quick start (local development)

Requirements: Node.js 22.12+ (24 recommended, see `.nvmrc`) and Docker (for Postgres).

```bash
npm run setup     # installs root tooling, backend and frontend dependencies
npm run dev:db    # starts Postgres in Docker
```

```bash
cd backend
cp .env.example .env
npx prisma migrate deploy
npm run dev
```

```bash
cd frontend
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. To deliver a test email (HTML, inline image and attachment) to the local SMTP server:

```bash
npm run send-test-email --prefix backend -- yourname
```

### Quality checks

| Command (repository root) | What it does                                                                   |
| ------------------------- | ------------------------------------------------------------------------------ |
| `npm run check`           | Formatting, lint, type check and tests for everything; the same checks CI runs |
| `npm run format`          | Format all files with Prettier (a pre-commit hook does this for staged files)  |
| `npm test`                | Backend and frontend unit tests                                                |
| `npm run build`           | Production builds                                                              |

Backend integration tests need a migrated database:

```bash
TEST_DATABASE_URL=postgresql://tempmail:tempmail@localhost:5432/tempmail npm run test:coverage --prefix backend
```

## Deploying

### Option A: one server with Docker Compose (recommended)

1. **Server**: a Linux VPS with a public IPv4 address and **inbound port 25 open**. Some providers block port 25 by default, so check before you choose one.
2. **DNS** at your `willx.tech` DNS provider (the site and mail both use `temp.willx.tech`):
   ```
   temp.willx.tech.   A     <server-ip>
   temp.willx.tech.   MX 10 temp.willx.tech.
   ```
   Don't add an MX record to `willx.tech` itself. That would route all `@willx.tech` email to this server, and your existing records for `willx.tech` stay untouched. Set reverse DNS (PTR) for the server IP to `temp.willx.tech` if your provider supports it.
3. **Configure and start**:
   ```bash
   git clone <your-repo-url> temp-mail && cd temp-mail
   cp .env.example .env        # domains are preset to temp.willx.tech; set POSTGRES_PASSWORD
   docker compose up -d --build
   ```
4. **Firewall**: allow 22, 25, 80 and 443.
5. **Verify**: `curl https://temp.willx.tech/api/health/ready`, then send an email to `anything@temp.willx.tech`.

Backups, monitoring, alerting, upgrades and troubleshooting are covered in [docs/OPERATIONS.md](docs/OPERATIONS.md).

### Option B: frontend on Vercel, backend on a VPS

- **Backend**: run `backend/Dockerfile` on a host with port 25 open, with `MAIL_DOMAIN=temp.willx.tech`. Put it behind a TLS reverse proxy such as `api.temp.willx.tech`, and set `TRUST_PROXY=1`.
- **Frontend**: import the repository into Vercel with **Root Directory = `frontend`** and set `API_URL=https://api.temp.willx.tech`. The site URL, mail domain and source link already default to `temp.willx.tech` through `frontend/.env.production`.

### Pre-built images

Pushing a tag such as `v2.1.0` runs `.github/workflows/release.yml`. It publishes `ghcr.io/<owner>/<repo>-backend` and `-frontend` images with SBOM and provenance attestations, and creates a GitHub release.

## Configuration

### Backend (`backend/.env`)

| Variable                                       | Default            | Description                                                                                     |
| ---------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                 | **required**       | PostgreSQL connection string                                                                    |
| `MAIL_DOMAIN`                                  | **required**       | Domain that receives mail (`SMTP_DOMAIN` also accepted)                                         |
| `API_PORT` / `API_HOST`                        | `3001` / `0.0.0.0` | HTTP API listener                                                                               |
| `SMTP_PORT` / `SMTP_HOST`                      | `2525` / `0.0.0.0` | SMTP listener (map public port 25 to it)                                                        |
| `SMTP_HOSTNAME`                                | `MAIL_DOMAIN`      | Name in the SMTP greeting                                                                       |
| `SMTP_MAX_MESSAGE_BYTES`                       | `10485760`         | Larger messages are rejected with 552                                                           |
| `SMTP_MAX_RECIPIENTS`                          | `50`               | Recipients per message                                                                          |
| `SMTP_MAX_CONNECTIONS_PER_MINUTE`              | `60`               | Per-IP SMTP connections (421 when exceeded)                                                     |
| `SMTP_TLS_KEY_PATH` / `SMTP_TLS_CERT_PATH`     | –                  | Enable STARTTLS with these PEM files                                                            |
| `RESERVED_NAMES`                               | –                  | Extra names nobody may claim (role names are always reserved)                                   |
| `MAILBOX_TTL_HOURS`                            | `24`               | Lifetime of mailboxes and messages. New mail extends the mailbox.                               |
| `TRUST_PROXY`                                  | `loopback`         | Express `trust proxy` (hop count, `true`, or subnets). Needed for per-IP limits behind a proxy. |
| `CORS_ORIGINS`                                 | –                  | Only needed if browsers call the API from another origin                                        |
| `MAILBOX_CREATE_LIMIT_PER_HOUR`                | `20`               | New mailboxes per IP per hour (re-opening is free)                                              |
| `API_RATE_LIMIT_PER_MINUTE`                    | `120`              | Requests per IP per minute                                                                      |
| `REALTIME_PG_NOTIFY`                           | `true`             | Share live events across instances via Postgres                                                 |
| `SSE_MAX_CLIENTS` / `SSE_MAX_CLIENTS_PER_IP`   | `5000` / `10`      | Live-connection limits                                                                          |
| `METRICS_PORT` / `METRICS_HOST`                | – / `127.0.0.1`    | Prometheus `/metrics` listener (disabled when the port is unset)                                |
| `CLEANUP_ENABLED` / `CLEANUP_INTERVAL_MINUTES` | `true` / `15`      | Expired-data cleanup                                                                            |
| `LOG_LEVEL`                                    | `info`             | Pino log level (JSON logs outside development)                                                  |
| `POSTHOG_KEY` / `POSTHOG_HOST`                 | –                  | Optional server analytics                                                                       |

Invalid configuration stops the server at startup with a clear message.

### Frontend (`frontend/.env.local`)

| Variable                                               | Description                                                                                                                                  |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_URL`                                              | Backend URL used by the `/api` proxy (runtime, server-side). Default `http://localhost:3001`.                                                |
| `NEXT_PUBLIC_SITE_URL`                                 | Public site URL for metadata, robots.txt, the sitemap and CSP (build time)                                                                   |
| `NEXT_PUBLIC_SOURCE_URL`                               | Source-code link in the footer (build time). Point it at your fork if you modify the app (AGPL). `SOURCE_URL` in the root `.env` for Docker. |
| `NEXT_PUBLIC_MAIL_DOMAIN`                              | Optional placeholder shown until `/api/config` loads                                                                                         |
| `NEXT_PUBLIC_API_URL`                                  | Optional: browsers call the API directly (needs backend `CORS_ORIGINS`)                                                                      |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Optional analytics                                                                                                                           |

## API

All routes are under `/api`. `:name` is the part of the address before the `@`. The full specification is at [`backend/openapi.yaml`](backend/openapi.yaml), and a running server serves it at `/api/openapi.yaml`.

| Method           | Route                                              | Description                                                                                                     |
| ---------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `GET`            | `/health/live`, `/health/ready`, `/health`         | Liveness; readiness (database); alias of readiness                                                              |
| `GET`            | `/config`                                          | `{ domain, ttlHours, maxMessageBytes }`                                                                         |
| `POST`           | `/mailboxes`                                       | `{ "username"?: string }`. Returns `201` when created, `200` if it existed. Omit the username for a random one. |
| `GET`            | `/mailboxes/:name`                                 | Mailbox info and message summaries                                                                              |
| `GET`            | `/mailboxes/:name/events`                          | Server-Sent Events: `message` events with `{ id }` as mail arrives                                              |
| `DELETE`         | `/mailboxes/:name`                                 | Delete the mailbox and all of its messages                                                                      |
| `GET` / `DELETE` | `/mailboxes/:name/messages/:id`                    | Full message (marks it read) / delete it                                                                        |
| `GET`            | `/mailboxes/:name/messages/:id/raw`                | Original message as `.eml`                                                                                      |
| `GET`            | `/mailboxes/:name/messages/:id/attachments/:index` | Attachment (`?download` forces a download)                                                                      |

Errors return `{ "error": "…", "code": "RESERVED_USERNAME", "requestId": "…" }`. Every response includes an `X-Request-Id` header. Rate limits are reported in `RateLimit` / `RateLimit-Policy` headers.

## Project docs

| Document                                     | Contents                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Components, flows, data model, design decisions, scaling                          |
| [docs/OPERATIONS.md](docs/OPERATIONS.md)     | Deploy/upgrade, health checks, metrics and alerts, logs, backups, troubleshooting |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Development workflow and conventions                                              |

Security vulnerabilities should be reported privately through GitHub (**Security → Report a vulnerability**), not in public issues.

## License

[GNU Affero General Public License v3.0](./LICENSE) (AGPL-3.0). Originally created by [WilliamBenLaw](https://github.com/SheerWill007/TemptingMail).

The AGPL applies to network use. If you run a modified version of this service for other people, you must offer those users the source code of your version. The footer links to it: set `NEXT_PUBLIC_SOURCE_URL` (or `SOURCE_URL` for Docker) to your repository.
