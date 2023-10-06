<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center space-x-4">
      <li>
        <div>
          <nuxt-link to="/" class="text-gray-400 hover:text-gray-500">
            <HomeIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span class="sr-only">Home</span>
          </nuxt-link>
        </div>
      </li>
      <li v-for="page in pages" :key="page.name">
        <div class="flex items-center">
          <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
          </svg>
          <span
            v-if="page.current"
            class="ml-4 text-sm font-medium text-gray-500 cursor-default"
            aria-current="page">
            {{ page.name }}
          </span>
          <nuxt-link
            v-else
            :to="page.href"
            class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            :aria-current="page.current ? 'page' : undefined">
            {{ page.name }}
          </nuxt-link>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { HomeIcon } from "@heroicons/vue/20/solid";

const route = useRoute();

const pages = computed(() => {
  const result = [];

  for (let i = 0; i < route.params.slug.length; i++) {
    const slug = route.params.slug[i];
    result.push({
      name: reverseSlug(slug),
      href: `/${slug}`,
      current: i === route.params.slug.length - 1
    });
  }

  return result;
});

function reverseSlug (slug: string) {
  const words = slug.split("-");
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ");
}

</script>

<style scoped lang="scss">

</style>
