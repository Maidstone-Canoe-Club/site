<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-12 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      News posts
    </h1>

    <div class="space-y-6 mb-8">
      <article
        v-for="(news, index) in items.data"
        :key="index"
        class="relative flex flex-col items-start">
        <h2 class="text-base font-semibold tracking-tight">
          <nuxt-link :to="news.href">
            <span class="absolute inset-0 z-20" />
            <span class="relative">{{ news.title }}</span>
          </nuxt-link>
        </h2>
        <time class="relative text-sm text-gray-500 mb-2">{{ formatDate(news.date_created) }}</time>
        <div
          class="relative mt-1 text-sm line-clamp-4 overflow-hidden overflow-ellipsis"
          v-html="news.content" />
        <div class="mt-2 font-medium text-sm text-indigo-500 flex flex-row gap-2 items-center">
          Continue reading
          <ChevronRightIcon class="w-5 h-5" />
        </div>
      </article>
    </div>

    <simple-pagination
      :items-per-page="itemsPerPage"
      :total-items="items.meta.total_count"
      :page="page"
      @next="onNext"
      @prev="onPrev" />
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { ChevronRightIcon } from "@heroicons/vue/24/solid";

const { getItems } = useDirectusItems();
const route = useRoute();
const router = useRouter();

const routePageAsNumber = 0;

const itemsPerPage = 8;
const page = ref(route.query.page && !isNaN(route.query.page) ? parseInt(route.query.page, 10) : 1);

const { data: items } = await useAsyncData("news-items-", async () => {
  return await loadData();
});

async function loadData () {
  const result = await getItems({
    collection: "news",
    params: {
      sort: ["-date_created"],
      limit: itemsPerPage,
      page: page.value,
      meta: "total_count"
    }
  });

  result.data = result.data.map(x => ({
    ...x,
    href: `/news/${x.id}/${x.slug}`
  }));

  return result;
}

watch(page, (val) => {
  router.push({
    query: {
      page: val
    }
  });
});

const totalPages = computed(() => {
  return Math.ceil(items.value.meta.total_count / itemsPerPage);
});

async function onNext () {
  if (page.value < totalPages.value) {
    page.value = page.value + 1;
    items.value = await loadData();
  }
}

async function onPrev () {
  if (page.value > 1) {
    page.value = page.value - 1;
    items.value = await loadData();
  }
}

async function onClick (p: number) {
  page.value = p;
  items.value = await loadData();
}

function formatDate (input: string) {
  return format(new Date(input), "MMMM dd, yyyy");
}

</script>

<style scoped lang="scss">

</style>
