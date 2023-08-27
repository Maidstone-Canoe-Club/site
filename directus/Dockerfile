FROM node:18-alpine AS builder

WORKDIR /builder

COPY package.json ./
COPY extensions/ extensions/

RUN npm i && npm run build

FROM directus/directus:10.5

USER node
WORKDIR /directus

# COPY . .
COPY snapshots/ ./snapshots
COPY extensions/templates/ ./extensions/templates
COPY --from=builder /builder/extensions/directus-extension-slugify ./extensions/directus-extension-slugify
COPY --from=builder /builder/extensions/directus-extension-invites ./extensions/directus-extension-invites

ARG DB_CLIENT
ARG DB_HOST
ARG DB_PORT
ARG DB_DATABASE
ARG DB_USER
ARG DB_PASSWORD
ARG ADMIN_EMAIL
ARG ADMIN_PASSWORD
ARG KEY
ARG SECRET
ARG PUBLIC_URL
ARG CACHE_ENABLED
ARG CACHE_AUTO_PURGE

ENV DB_CLIENT ${DB_CLIENT}
ENV DB_HOST ${DB_HOST}
ENV DB_PORT ${DB_PORT}
ENV DB_DATABASE ${DB_DATABASE}
ENV DB_USER ${DB_USER}
ENV DB_PASSWORD ${DB_PASSWORD}
ENV ADMIN_EMAIL ${ADMIN_EMAIL}
ENV ADMIN_PASSWORD ${ADMIN_PASSWORD}
ENV KEY ${KEY}
ENV SECRET ${SECRET}
ENV PUBLIC_URL ${PUBLIC_URL}
ENV CACHE_ENABLED ${CACHE_ENABLED}
ENV CACHE_AUTO_PURGE ${CACHE_AUTO_PURGE}

ARG PORT
ENV PORT ${PORT}
EXPOSE ${PORT}

CMD npx directus bootstrap && \
    npx directus schema apply snapshots/latest.yml --yes && \
    npx directus start
