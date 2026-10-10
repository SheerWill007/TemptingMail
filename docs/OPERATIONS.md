# Operations Runbook

How to run Temp Mail in production with the Docker Compose stack. Commands are run from the repository root on the server.

## Deploy and upgrade

```bash
cp .env.example .env              # first time only; set SITE_DOMAIN, MAIL_DOMAIN, POSTGRES_PASSWORD, SOURCE_URL
docker compose up -d --build      # build and start (database migrations run automatically)
```

To upgrade:

```bash
git pull
docker compose up -d --build
docker compose logs -f backend    # confirm "API listening" and "SMTP listening"
```

Migrations are forward-only. Back up the database (below) before upgrading across a minor version.

To roll back, check out the previous tag, then run `docker compose up -d --build`. If the newer version added a migration, restore the pre-upgrade backup.

## Health checks

| Endpoint                | Meaning                              | Use for                                |
| ----------------------- | ------------------------------------ | -------------------------------------- |
| `GET /api/health/live`  | Process is up (no dependency checks) | Liveness probe / restart decisions     |
| `GET /api/health/ready` | Database reachable                   | Readiness probe / load balancer health |
| `GET /api/health`       | Alias of `/ready`                    | Uptime monitors                        |

```bash
curl -fsS https://$SITE_DOMAIN/api/health/ready
```

## Monitoring

The backend exposes Prometheus metrics at `http://backend:9464/metrics` on the Compose network. Never publish this port. Example scrape config for a Prometheus container on the same network:

```yaml
scrape_configs:
  - job_name: temp-mail
    static_configs:
      - targets: ['backend:9464']
```

| Metric                                              | Type      | Notes                                                             |
| --------------------------------------------------- | --------- | ----------------------------------------------------------------- |
| `tempmail_http_requests_total{method,route,status}` | counter   | `route` is the template, e.g. `/api/mailboxes/:name`              |
| `tempmail_http_request_duration_seconds`            | histogram | Latency per route                                                 |
| `tempmail_smtp_messages_total{result}`              | counter   | `stored`, `too_large`, `failed`                                   |
| `tempmail_smtp_rejections_total{reason}`            | counter   | `relay`, `unknown_user`, `too_many_recipients`, `connection_rate` |
| `tempmail_mailboxes_created_total`                  | counter   |                                                                   |
| `tempmail_sse_clients`                              | gauge     | Open live connections                                             |
| `tempmail_cleanup_deleted_total{kind}`              | counter   | `message`, `mailbox`                                              |
| `process_*`, `nodejs_*`                             | various   | Default Node.js runtime metrics                                   |

Suggested alerts:

- `rate(tempmail_smtp_messages_total{result="failed"}[5m]) > 0`: mail is being refused with 451 (usually a database problem).
- `increase(tempmail_smtp_messages_total{result="stored"}[6h]) == 0`: no mail received recently. Check DNS/MX, the firewall and port 25.
- `sum(rate(tempmail_http_requests_total{status=~"5.."}[5m])) / sum(rate(tempmail_http_requests_total[5m])) > 0.01`
- The readiness endpoint failing for more than 2 minutes.

## Logs

All services log to stdout. The backend and Caddy log JSON. Logs rotate at 10 MB × 5 files per container.

```bash
docker compose logs -f backend
docker compose logs backend | grep '"requestId":"<id>"'   # trace one request reported by a user
```

Log level: set `LOG_LEVEL=debug` in `.env`, then run `docker compose up -d`.

## Backups

The data is short-lived by design, but back up anyway before upgrades:

```bash
docker compose exec -T db pg_dump -U tempmail -Fc tempmail > backup-$(date +%F).dump
```

To restore into a stopped stack:

```bash
docker compose up -d db
docker compose exec -T db pg_restore -U tempmail -d tempmail --clean --if-exists < backup-YYYY-MM-DD.dump
docker compose up -d
```

## Troubleshooting

**No mail arrives**

1. `dig MX $MAIL_DOMAIN` should point to your server's hostname, and that hostname's A record to the server IP.
2. Check that port 25 is reachable from outside: `nc -vz <server-ip> 25` from another network. Many cloud providers block it by default.
3. Watch the backend while sending a test: `docker compose logs -f backend`.
4. Check `tempmail_smtp_rejections_total`. A rising `relay` count means senders are using the wrong domain.

**Inbox doesn't update instantly**

The status line on the inbox page shows "Live" when the event stream is connected. If it shows polling instead, make sure any proxy in front of Caddy (for example a CDN) doesn't buffer `text/event-stream` responses.

**Users hit rate limits behind a proxy or CDN**

All clients appear to come from the proxy's IP. Set `TRUST_PROXY` to the number of proxies between the client and the backend.

## Secrets

| Secret              | Rotation                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `POSTGRES_PASSWORD` | Change it in Postgres (`ALTER USER tempmail PASSWORD '...'`), update `.env`, then run `docker compose up -d` |
| `POSTHOG_KEY`       | Update `.env` and restart the backend                                                                        |
| TLS certificates    | Managed and renewed automatically by Caddy (stored in the `caddy_data` volume)                               |
