# Contributing

Thanks for helping improve Temp Mail!

## Setup

Follow **Quick start** in the [README](./README.md). In short, start Postgres with `docker compose -f docker-compose.dev.yml up -d`, then run `npm install && npm run dev` in both `backend/` and `frontend/`. Use `npm run send-test-email -- <name>` in `backend/` to deliver test mail.

## Before opening a pull request

CI runs these checks, so run them locally first:

```bash
cd backend && npm run typecheck && npm test && npm run build
cd frontend && npm run lint && npm run typecheck && npm run build
```

- **Schema changes**: edit `backend/prisma/schema.prisma`, then run `npm run prisma:migrate -- --name <description>` and commit the generated migration. CI fails if the migrations and the schema drift apart.
- **New configuration**: add it to `backend/src/config.ts` (validated with Zod), the relevant `.env.example`, `docker-compose.yml` if needed, and the README tables.
- **Tests**: add tests in `backend/test/` for backend behaviour changes.

## Conventions

- TypeScript strict mode everywhere; avoid `any`.
- Branches: `feature/…`, `fix/…`, `docs/…`, `chore/…`.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/), e.g. `fix(smtp): reject oversized messages`.
- Never log or send message content or full addresses to analytics.

By contributing, you agree that your contributions are licensed under the [GNU Affero General Public License v3.0](./LICENSE).
