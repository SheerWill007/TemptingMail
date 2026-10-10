# syntax=docker/dockerfile:1

FROM node:24-slim AS base
# OpenSSL is needed by the Prisma schema engine (used for `migrate deploy`).
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- build ---------------------------------------------------------------------
FROM base AS build
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# --- runtime -------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# `prisma version` makes sure the schema engine is downloaded at build time, not on first start.
RUN npm ci --omit=dev \
  && npx prisma version > /dev/null \
  && npm cache clean --force
COPY --from=build /app/dist ./dist

USER node
EXPOSE 3001 2525
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Apply pending migrations, then replace the shell so node receives SIGTERM directly.
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/index.js"]
