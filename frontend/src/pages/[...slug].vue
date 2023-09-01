<template>
  <div
    v-if="item"
    class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1
      v-if="item.title"
      class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      {{ item.title }}
    </h1>
    <rich-text :content="item.content" />
  </div>
  <div v-if="item.child_pages">
    <ul>
      <li v-for="item in item.child_pages" :key="item.slug">
        <nuxt-link :to="`/${item.slug}`">
          {{ item.title }}
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useAsyncData, createError } from "#imports";

const { getItems } = useDirectusItems();
const route = useRoute();

const path = route.path;
const slugs = route.params.slug;

const slug = slugs.length ? slugs[0] : null;

export type ContentItem = {
  title?: string
  content?: string
}

if (!slug) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found"
  });
}

const { data: item } = await useAsyncData(`content-${slug}`, async () => {
  try {
    const items = await getItems<ContentItem>({
      collection: "content_page",
      params: {
        limit: 1,
        filter: {
          slug: {
            _eq: slug
          }
        },
        fields: ["*", "child_pages.slug", "child_pages.title"]
      }
    });

    return items.length ? items[0] : null;
  } catch (e) {
    console.log("error loading content", e);
  }
});

if (!item.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Content not found"
  });
}

</script>

<style scoped lang="scss">

</style>
