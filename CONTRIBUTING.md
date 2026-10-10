# Contributing

Thanks for helping improve Temp Mail! Please read the [Code of Conduct](CODE_OF_CONDUCT.md) first. Report security issues privately as described in [SECURITY.md](SECURITY.md), never in public issues.

## Setup

```bash
npm run setup     # root tooling + backend + frontend dependencies; installs the pre-commit hook
npm run dev:db    # Postgres in Docker
```

Then follow **Quick start** in the [README](README.md). Use `npm run send-test-email --prefix backend -- <name>` to deliver test mail.

## Workflow

1. Create a branch: `feature/…`, `fix/…`, `docs/…` or `chore/…`.
2. Make your change with tests. Backend tests live in `backend/test/` (integration tests in `backend/test/integration/`); frontend tests in `frontend/tests/`.
3. Run `npm run check` from the repository root. It runs formatting, lint, type checks and unit tests, like CI.
4. Add an entry under **Unreleased** in [CHANGELOG.md](CHANGELOG.md).
5. Open a pull request and fill in the template.

A pre-commit hook formats staged files with Prettier. CI additionally runs integration tests against Postgres, enforces coverage thresholds, builds the Docker images and runs CodeQL.

## Guidelines

- **Database changes**: edit `backend/prisma/schema.prisma`, run `npm run prisma:migrate --prefix backend -- --name <description>`, and commit the migration. CI fails if migrations and the schema drift apart.
- **API changes**: update `backend/openapi.yaml` and the README API table. Use the stable `code` values in `backend/src/api/errors.ts` for new errors.
- **Configuration**: add it to `backend/src/config.ts` (validated with Zod), the relevant `.env.example`, `docker-compose.yml` if needed, and the README.
- **Metrics**: label HTTP metrics by route template only; never put addresses or other unbounded values in labels.
- **Privacy**: never log or send message content or full addresses to analytics.
- **Style**: TypeScript strict mode, no `any`. Prettier decides formatting.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/), e.g. `fix(smtp): reject oversized messages`.

## Releasing (maintainers)

1. Move the **Unreleased** changelog entries under a new version heading and bump `version` in the three `package.json` files.
2. Tag and push: `git tag v2.2.0 && git push origin v2.2.0`. The release workflow publishes the Docker images and the GitHub release.

By contributing, you agree that your contributions are licensed under the [GNU Affero General Public License v3.0](./LICENSE).
