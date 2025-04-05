<template>
  <article
    v-if="item"
    class="mx-auto max-w-3xl mt-8 px-3 sm:px-0 text-pretty">
    <div class="mb-4">
      <alert-box
        v-if="!isPublished"
        class="mb-4"
        heading="Post not visible"
        variant="warning">
        This news post has not been made public yet
      </alert-box>
      <div class="sm:flex sm:items-center sm:justify-between mb-4">
        <div class="min-w-0 flex-1">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {{ item.title }}
          </h1>
        </div>
        <div
          v-if="canEdit"
          class="mt-3 flex sm:ml-4 sm:mt-0 gap-2">
          <a-button
            variant="outline"
            :to="editUrl">
            Edit
          </a-button>
          <a-button
            v-if="!isPublished"
            variant="primary">
            Publish now
          </a-button>
        </div>
      </div>
      <p v-if="item.user_created.first_name || item.user_created.last_name" class="font-semibold">
        Posted by {{ item.user_created.first_name }} {{ item.user_created.last_name }}
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
import type { NewsItem } from "~/types";

const { getItemById } = useDirectusItems();
const route = useRoute();

const { data: item } = await useAsyncData(`news-item-${route.params.id}`, async () => {
  return await getItemById<NewsItem>({
    collection: "news",
    id: route.params.id as string,
    params: {
      fields: [
        "status",
        "title",
        "content",
        "slug",
        "date_created",
        "user_created.id",
        "user_created.first_name",
        "user_created.last_name"
      ]
    }
  });
});

if (!item.value) {
  throw showError({
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
    replace: true,
    redirectCode: 301
  });
} else if (route.params.slug && route.params.slug[0] !== item.value.slug) {
  throw showError({
    statusCode: 404,
    statusMessage: "News post not found"
  });
}

useSeoMeta({
  title: item.value.title,
  ogTitle: item.value.title,
  ogType: "article",
  articleAuthor: `${item.value.user_created.first_name} ${item.value.user_created.last_name}`,
  articlePublishedTime: item.value.date_created
});

// TODO: Look into issue with og images
// defineOgImageComponent("CustomImage", {
//   headline: "News post",
//   title: item.value.title
// });

const user = useDirectusUser();
const isPublished = computed(() => item.value?.status === "published");
const editUrl = computed(() => `/news/${route.params.id}/edit`);

const canEdit = computed(() => {
  if (user.value && user.value.id === item.value?.user_created.id) {
    return true;
  }

  return hasRole(user.value, "coach");
});

function formatDate (input: string) {
  return format(new Date(input), "MMM do, yyyy");
}

</script>

<style scoped lang="scss">

</style>
