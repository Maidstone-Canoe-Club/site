FROM node:18-bullseye-slim AS prebase

RUN apt-get update && apt-get install -y --no-install-recommends netcat wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/node_app/app

COPY ./package*.json ./

FROM prebase AS base

RUN npm install && npm cache clean --force

ARG NUXT_DIRECTUS_URL
ENV NUXT_DIRECTUS_URL ${NUXT_DIRECTUS_URL}

ENV PORT 3000
ENV NITRO_PORT 3000
ENV HOST 0.0.0.0
EXPOSE 3000

FROM base AS build

WORKDIR /opt/node_app/app
COPY --from=base --chown=node:node /opt/node_app/app .

COPY ./src ./src
COPY ./nuxt.config.ts ./
COPY ./tsconfig.json ./

RUN npm run build

RUN rm -rf node_modules && rm -rf .nuxt && npm cache clean --force

FROM prebase

USER node

WORKDIR /opt/
COPY --from=build --chown=node:node /opt/node_app/app/.output node_app/app/.output
WORKDIR /opt/node_app/app

ARG BASE_URL
ENV BASE_URL ${BASE_URL}

ENV NODE_ENV production
ENV HOST 0.0.0.0

CMD ["node", ".output/server/index.mjs"]
