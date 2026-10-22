FROM node:22-alpine AS builder

WORKDIR /builder

COPY package.json package-lock.json ./
COPY extensions/ extensions/

RUN npm i
RUN npm run build

FROM directus/directus:10.9

USER node
WORKDIR /directus

COPY snapshots/ ./snapshots
COPY extensions/templates/ ./extensions/templates
COPY extensions/migrations/ ./extensions/migrations
COPY --from=builder /builder/extensions/directus-extension-slugify ./extensions/directus-extension-slugify
COPY --from=builder /builder/extensions/directus-extension-mcc ./extensions/directus-extension-mcc
COPY --from=builder /builder/extensions/directus-extension-events ./extensions/directus-extension-events

# All configuration (database, KEY/SECRET, email, Stripe, ...) is read from runtime environment
# variables. Nothing is baked into the image, so secrets don't end up in its layers.

EXPOSE 8055

HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8055/server/ping || exit 1

# The schema snapshot is only applied when APPLY_SCHEMA_ON_START=true, so a stale snapshot
# can't silently drop columns on a routine restart. Turn it on for deploys that change the schema.
CMD npx directus bootstrap && \
    if [ "$APPLY_SCHEMA_ON_START" = "true" ]; then npx directus schema apply snapshots/latest.yml --yes; else echo "Skipping schema apply (APPLY_SCHEMA_ON_START is not true)"; fi && \
    npx directus start
