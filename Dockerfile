##### DEPENDENCIES

FROM node:16-bullseye AS deps
RUN apt-get update && apt-get install openssl python3 python3-pip -y
WORKDIR /app

COPY prisma package.json yarn.lock* ./
RUN yarn --frozen-lockfile

##### BUILDER

FROM node:16-bullseye AS builder
ARG DATABASE_URL
ARG PYTHON3_PATH
ARG SQLITE3_PATH

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN SKIP_ENV_VALIDATION=1 yarn build

##### RUNNER

FROM node:16-bullseye AS runner
RUN apt-get update && apt-get install openssl python3 python3-pip libsndfile1-dev sqlite3 -y
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/research ./research

RUN mkdir tmp && chgrp -R nodejs tmp && chown -R nextjs tmp
RUN mkdir dataset && chgrp -R nodejs dataset && chown -R nextjs dataset

USER nextjs
VOLUME tmp
VOLUME dataset

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]