<script setup lang="ts">
import { format } from "date-fns";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

useHead({
  title: "Newsletters"
});

export type NewsletterItem = {
  id: string,
  publish_date: string,
  file: string
}

const directus = useDirectus();
const { getItems, deleteItems } = useDirectusItems();
const config = useRuntimeConfig();
const user = useDirectusUser();
const { newError } = useErrors();

const page = ref(1);
const itemsPerPage = 12;

const newslettersData = await useAsyncData("newsletter-items", async () => {
  return await loadData();
});

const totalCount = computed(() => newslettersData.data.value?.meta?.total_count ?? 0);

const newsletterItems = computed<NewsletterItem[]>(() => newslettersData.data.value?.data || []);

async function loadData () {
  try {
    const items = await getItems<NewsletterItem>({
      collection: "newsletter_items",
      params: {
        limit: itemsPerPage,
        page: page.value,
        sort: ["-publish_date"],
        meta: "total_count"
      }
    });

    items.data = items?.data.map(x => ({
      ...x,
      href: `${config.public.directus.url}/assets/${x.file}?download`
    }));
    return items;
  } catch (err: any) {
    console.error("Error loading newsletters", err);
    newError({
      message: "Unable to load newsletters"
    });
  }
}

const canModifyNewsletters = computed(() => {
  return user.value && hasRole(user.value, "coach");
});

function formatDate (input: string) {
  return format(new Date(input), "do MMMM yyyy");
}

watch(page, async () => {
  await newslettersData.refresh();
});

function onNext () {
  page.value = page.value + 1;
}

function onPrev () {
  page.value = page.value - 1;
}

async function onDelete (newsletter: any) {
  try {
    newsletter.loading = true;

    await directus(`/files/${newsletter.file}`, {
      method: "DELETE"
    });

    await deleteItems({
      collection: "newsletter_items",
      items: [newsletter.id]
    });

    page.value = 1;
    await newslettersData.refresh();
  } catch (e) {
    console.error("error deleting newsletter", e);
  } finally {
    newsletter.loading = false;
  }
}

</script>

<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <div class="flex flex-wrap gap-4 items-center justify-between mb-12">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Newsletters Archive
      </h1>
      <nuxt-link
        v-if="canModifyNewsletters"
        class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        to="/newsletters/new">
        Upload newsletter
      </nuxt-link>
    </div>

    <div v-if="newsletterItems && newsletterItems.length">
      <ul role="list" class="divide-y divide-gray-100">
        <li
          v-for="newsletter in newsletterItems"
          :key="newsletter.id"
          class="flex items-center justify-between gap-x-6 py-5 relative">
          <div
            v-if="newsletter.loading"
            class="absolute inset-[-5px] backdrop-blur-[2px] flex justify-center items-center z-10">
            <loading-spinner color="#aaa" />
          </div>

          <div class="min-w-0">
            <div class="flex items-start gap-x-3">
              <p class="text-sm font-semibold leading-6 text-gray-900">
                <time :datetime="newsletter.publish_date">{{ formatDate(newsletter.publish_date) }}</time>
              </p>
            </div>
          </div>
          <div class="flex flex-none items-center gap-x-4">
            <a
              :href="newsletter.href"
              target="_blank"
              class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 block">
              Download newsletter
            </a>

            <Menu
              v-if="canModifyNewsletters"
              as="div"
              class="relative flex-none">
              <MenuButton class="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                <span class="sr-only">Open options</span>
                <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
              </MenuButton>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95">
                <MenuItems
                  class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                    <button
                      type="button"
                      class="w-full text-left"
                      :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                      @click="onDelete(newsletter)">
                      Delete
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </li>
      </ul>

      <simple-pagination
        :items-per-page="itemsPerPage"
        :total-items="totalCount"
        :page="page"
        @next="onNext"
        @prev="onPrev" />
    </div>
    <div v-else>
      No newsletters yet!
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
