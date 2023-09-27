<template>
  <article
    v-if="item"
    class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <div class="mb-4">
      <h1 class="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {{ item.title }}
      </h1>
      <p class="font-semibold">
        By {{ item.user_created.first_name }} {{ item.user_created.last_name }}
      </p>
      <p class="text-base text-gray-700">
        {{ formatDate(item.date_created) }}
      </p>
    </div>
    <rich-text :content="item.content" />
  </article>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { NewsItem } from "~/types";

const { getItemById } = useDirectusItems();
const route = useRoute();

const { data: item } = await useAsyncData(`news-item-${route.params.id}`, async () => {
  return await getItemById<NewsItem>({
    collection: "news",
    id: route.params.id,
    params: {
      fields: [
        "*", "title", "content", "slug", "date_created", "user_created.id", "user_created.first_name", "user_created.last_name"
      ]
    }
  });
});

if (!item.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "News post not found"
  });
}

if (!route.params.slug && item.value.slug) {
  let redirect = route.path;
  if (!redirect.endsWith("/")) {
    redirect += "/";
  }

  redirect += item.value.slug;
  await navigateTo(redirect, {
    redirectCode: 301
  });
} else if (route.params.slug && route.params.slug[0] !== item.value.slug) {
  throw createError({
    statusCode: 404,
    statusMessage: "News post not found"
  });
}

function formatDate (input: string) {
  return format(new Date(input), "MMM do, yyyy");
}

</script>

<style scoped lang="scss">

</style>
