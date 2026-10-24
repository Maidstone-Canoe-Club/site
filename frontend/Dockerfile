FROM node:22-bookworm-slim AS prebase

RUN apt-get update && apt-get install -y --no-install-recommends netcat-openbsd wget ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /mcc

RUN npm i -g --force corepack && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

FROM prebase AS base

RUN pnpm i --frozen-lockfile

ARG NUXT_PUBLIC_DIRECTUS_URL
ENV NUXT_PUBLIC_DIRECTUS_URL ${NUXT_PUBLIC_DIRECTUS_URL}

ARG NUXT_PUBLIC_UMAMI_HOST
ENV NUXT_PUBLIC_UMAMI_HOST ${NUXT_PUBLIC_UMAMI_HOST}

ARG NUXT_PUBLIC_UMAMI_ID
ENV NUXT_PUBLIC_UMAMI_ID ${NUXT_PUBLIC_UMAMI_ID}

ARG SENTRY_DSN
ENV SENTRY_DSN ${SENTRY_DSN}

ARG SENTRY_ENVIRONMENT
ENV SENTRY_ENVIRONMENT ${SENTRY_ENVIRONMENT}

ARG SENTRY_RELEASE
ENV SENTRY_RELEASE ${SENTRY_RELEASE}

ARG SENTRY_ORG
ENV SENTRY_ORG ${SENTRY_ORG}

ARG SENTRY_PROJECT
ENV SENTRY_PROJECT ${SENTRY_PROJECT}

ARG NUXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NUXT_PUBLIC_TURNSTILE_SITE_KEY ${NUXT_PUBLIC_TURNSTILE_SITE_KEY}

ARG BASE_URL
ENV BASE_URL ${BASE_URL}

ENV PORT 3000
ENV NITRO_PORT 3000
ENV HOST 0.0.0.0
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

# Only needed to upload source maps, so it stays a build arg of this stage and never reaches the final image
ARG SENTRY_AUTH_TOKEN
RUN pnpm build

RUN rm -rf node_modules && rm -rf .nuxt

FROM prebase

USER node

WORKDIR /mcc
COPY --from=build --chown=node:node /mcc/.output ./.output

ENV NODE_ENV production
ENV HOST 0.0.0.0

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
