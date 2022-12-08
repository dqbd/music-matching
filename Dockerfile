##### DEPENDENCIES

FROM node:16 AS deps
RUN apt-get update && apt-get install openssl python3 python3-pip -y
WORKDIR /app

COPY prisma package.json yarn.lock* ./
RUN yarn --frozen-lockfile

##### BUILDER

FROM node:16 AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN SKIP_ENV_VALIDATION=1 yarn build

##### RUNNER

FROM node:16 AS runner
RUN apt-get update && apt-get install openssl python3 python3-pip -y
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]