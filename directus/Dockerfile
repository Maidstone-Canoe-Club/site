FROM directus/directus:10.5

USER node
WORKDIR /directus

COPY . .

CMD npx directus bootstrap && \
    npx directus start
