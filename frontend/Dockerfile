FROM node:22-bookworm-slim AS prebase

RUN apt-get update && apt-get install -y --no-install-recommends netcat-openbsd wget ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /mcc

RUN npm i -g --force corepack && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

FROM prebase AS base

RUN pnpm i --frozen-lockfile

ENV PORT=3000
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

FROM base AS build

WORKDIR /mcc
COPY --from=base --chown=node:node /mcc .

COPY ./app ./app
COPY ./public ./public
COPY ./server ./server
COPY ./nuxt.config.ts ./
COPY ./tailwind.config.ts ./
COPY ./tsconfig.json ./

# Only values the build itself needs. Secrets (Stripe, Turnstile secret, OpenAI) are read
# by the server at runtime, so set them as runtime environment variables instead.
# Build args live only in this stage and never reach the final image.
ARG NUXT_PUBLIC_DIRECTUS_URL
ARG NUXT_PUBLIC_UMAMI_HOST
ARG NUXT_PUBLIC_UMAMI_ID
ARG NUXT_PUBLIC_TURNSTILE_SITE_KEY
ARG BASE_URL
ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT
ARG SENTRY_RELEASE
# Used to upload source maps to Sentry during the build
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT

RUN pnpm build

RUN rm -rf node_modules && rm -rf .nuxt

FROM prebase

USER node

WORKDIR /mcc
COPY --from=build --chown=node:node /mcc/.output ./.output

# Public values the server also reads at runtime. Nothing secret belongs here.
ARG BASE_URL
ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT
ARG SENTRY_RELEASE
ENV BASE_URL=${BASE_URL}
ENV SENTRY_DSN=${SENTRY_DSN}
ENV SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}
ENV SENTRY_RELEASE=${SENTRY_RELEASE}

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
