FROM node:20-alpine AS base

##### DEPENDENCIES
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* ./

RUN if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### BUILDER
FROM base AS builder
WORKDIR /app

ENV STANDALONE true
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && SKIP_ENV_VALIDATION=1 pnpm build; \
  elif [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn build; \
  elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### RUNNER
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install sharp for image optimization in standalone mode
RUN npm install sharp

COPY --chown=nextjs:nodejs --from=builder /app/next.config.js ./
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME 0.0.0.0

CMD ["node", "server.js"]
