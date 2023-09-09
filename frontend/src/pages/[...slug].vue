<template>
  <section
    v-if="item"
    class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <page-breadcrumb class="mb-8" />
    <h1
      v-if="item.title"
      class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      {{ item.title }}
    </h1>
    <rich-text :content="item.content" />
  </section>
</template>

<script setup lang="ts">
import { useRoute, useAsyncData, createError } from "#imports";

const { getItems } = useDirectusItems();
const route = useRoute();
const slugs = route.params.slug;
const path = route.path;

const slug = slugs.length ? slugs[slugs.length - 1] : null;

export type ContentItem = {
  id: string,
  title?: string,
  content?: string
}

if (!slug) {
  throw createError({
    statusCode: 404,
    statusMessage: `Page not found: ${path}`,
    fatal: true
  });
}

const { data: item } = await useAsyncData(`content-${slug}`, async () => {
  return await loadContent();
});

async function loadContent () {
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
        fields: ["id", "title", "slug", "content", "child_pages.slug", "child_pages.title", "related_page_id"]
      }
    });

    if (!items || !items.length) {
      return null;
    }

    const item = items[0];

    const validPaths = await getItems({
      collection: "content_paths",
      params: {
        filter: {
          content: {
            _eq: item.id
          }
        }
      }
    });

    if (validPaths && validPaths.length) {
      const validPath = validPaths[0]!;
      if (validPath.path === path) {
        return item;
      }
    }

    return null;
  } catch (e) {
    console.log("error loading content", e);
  }
}

if (!item.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Content not found",
    fatal: true
  });
}

async function selectPage (event: any) {
  await navigateTo(`${path}/${event.target.value}`);
}

</script>

<style scoped lang="scss">

</style>
