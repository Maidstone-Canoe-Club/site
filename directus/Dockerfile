FROM node:18-alpine AS builder

WORKDIR /builder

COPY package.json package-lock.json ./
COPY extensions/ extensions/

RUN npm i
RUN npm run build

FROM directus/directus:10.9

USER node
WORKDIR /directus

# COPY . .
COPY snapshots/ ./snapshots
COPY extensions/templates/ ./extensions/templates
COPY extensions/migrations/ ./extensions/migrations
COPY --from=builder /builder/extensions/directus-extension-slugify ./extensions/directus-extension-slugify
COPY --from=builder /builder/extensions/directus-extension-mcc ./extensions/directus-extension-mcc
COPY --from=builder /builder/extensions/directus-extension-events ./extensions/directus-extension-events

EXPOSE 8055

HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8055/server/ping || exit 1

CMD npx directus bootstrap && \
    npx directus schema apply snapshots/latest.yml --yes && \
    npx directus start
