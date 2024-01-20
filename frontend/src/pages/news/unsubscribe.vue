<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

const route = useRoute();

const rawId = route.query.i as string;
const rawToken = route.query.t as string;

if (!rawId) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid unsubscribe url",
    fatal: true
  });
}

if (!rawToken) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid unsubscribe url",
    fatal: true
  });
}

const id = decodeURIComponent(atob(rawId));
const token = decodeURIComponent(atob(rawToken));

const loading = ref(true);
const result = ref(false);
const error = ref(false);

const directus = useDirectus();

const headingText = computed(() => {
  if (result.value) {
    return "Unsubscribed";
  }

  return "Unable to unsubscribe";
});

const message = computed(() => {
  if (result.value) {
    return "You have successfully unsubscribed from news post notifications.";
  }

  return "Something went wrong trying to unsubscribe you from news post notifications.";
});

onMounted(async () => {
  try {
    await directus("/news-posts/unsubscribe", {
      method: "post",
      body: {
        id,
        token
      }
    });
    result.value = true;
  } catch (e) {
    console.error("An error occured trying to unsubscribe");
    error.value = true;
  } finally {
    loading.value = false;
  }
});

</script>

<template>
  <div class="flex text-center items-center justify-center py-6 sm:py-12 flex-col gap-2">
    <template v-if="loading">
      <div class="p-8">
        <loading-spinner color="#aaa" />
      </div>
    </template>
    <template v-else>
      <CheckCircleIcon
        v-if="result"
        class="w-12 h-12 mb-4 text-lime-600" />
      <ExclamationTriangleIcon
        v-else
        class="w-12 h-12 mb-6 text-orange-500" />
      <h2 class="font-bold text-4xl">
        {{ headingText }}
      </h2>
      <p>{{ message }}</p>

      <nuxt-link
        to="/"
        class="mt-4 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Click here to go home
      </nuxt-link>
    </template>
  </div>
</template>

<style scoped lang="scss">

</style>
