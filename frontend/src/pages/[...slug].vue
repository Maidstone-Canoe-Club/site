<template>
  <!--  <section-->
  <!--    v-if="item"-->
  <!--    class="w-full mx-auto max-w-5xl mt-8">-->
  <!--    <page-breadcrumb class="mb-8" />-->
  <!--    <div class="grid md:grid-cols-12 gap-5">-->
  <!--      <template v-if="item.child_pages && item.child_pages.length">-->
  <!--        <aside-->
  <!--          class="md:col-span-3">-->
  <!--          &lt;!&ndash;        {{ item.child_pages }}&ndash;&gt;-->
  <!--          <nav class="flex flex-1 flex-col hidden md:block" aria-label="Sidebar">-->
  <!--            <ul role="list" class="-mx-2 space-y-1">-->
  <!--              <li v-for="(child, index) in item.child_pages" :key="index">-->
  <!--                <nuxt-link-->
  <!--                  :to="`${path}/${child.slug}`"-->
  <!--                  class="items-center"-->
  <!--                  :class="['text-gray-700 hover:text-indigo-600 hover:bg-white', 'group flex gap-x-3 rounded-md p-2 pl-3 text-sm leading-6 font-semibold']">-->
  <!--                  <ChevronRightIcon class="w-5 h-5" />-->
  <!--                  {{ child.title }}-->
  <!--                </nuxt-link>-->
  <!--              </li>-->
  <!--            </ul>-->
  <!--          </nav>-->
  <!--          <div class="block md:hidden">-->
  <!--            <select-->
  <!--              id="location"-->
  <!--              name="location"-->
  <!--              class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"-->
  <!--              @change="selectPage">-->
  <!--              <option :value="null" selected>-->
  <!--                Select another page-->
  <!--              </option>-->
  <!--              <option-->
  <!--                v-for="(child, index) in item.child_pages"-->
  <!--                :key="index"-->
  <!--                :value="child.slug">-->
  <!--                {{ child.title }}-->
  <!--              </option>-->
  <!--            </select>-->
  <!--          </div>-->
  <!--        </aside>-->
  <!--      </template>-->
  <!--      <main-->
  <!--        :class="item.child_pages && item.child_pages.length ? 'md:col-span-9' : 'col-span-12'">-->
  <!--        <h1-->
  <!--          v-if="item.title"-->
  <!--          class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">-->
  <!--          {{ item.title }}-->
  <!--        </h1>-->
  <!--        <rich-text :content="item.content" />-->
  <!--      </main>-->
  <!--    </div>-->
  <!--    &lt;!&ndash;    <pre>{{ item }}</pre>&ndash;&gt;-->
  <!--  </section>-->

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
<!--  <div v-if="item.child_pages">-->
<!--    <ul>-->
<!--      <li v-for="item in item.child_pages" :key="item.slug">-->
<!--        <nuxt-link :to="`/${item.slug}`">-->
<!--          {{ item.title }}-->
<!--        </nuxt-link>-->
<!--      </li>-->
<!--    </ul>-->
<!--  </div>-->
</template>

<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
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
    statusMessage: "Page not found"
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
      console.log("no items found for slug", slug);
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
      } else {
        console.log("no valid path for", slug);
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
    statusMessage: "Content not found"
  });
}

async function selectPage (event: any) {
  await navigateTo(`${path}/${event.target.value}`);
}

</script>

<style scoped lang="scss">

</style>
