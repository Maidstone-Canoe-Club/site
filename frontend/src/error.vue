<template>
  <main class="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
    <div class="text-center">
      <p class="text-base font-semibold text-indigo-600">
        {{ statusCode }}
      </p>
      <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        {{ title }}
      </h1>
      <p class="mt-6 text-base leading-7 text-gray-600">
        {{ description }}
      </p>
      <div class="mt-5">
        <nuxt-link to="/" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Go back home
        </nuxt-link>
      </div>
      <!--      <div-->
      <!--        v-if="isDev"-->
      <!--        class="border p-5 rounded">-->
      <!--        <p>-->
      <!--          {{ error.message }}-->
      <!--        </p>-->

      <!--        <pre>{{ error.data }}</pre>-->
      <!--        <div v-html="error.stack" />-->
      <!--      </div>-->
      <!--      <div class="mt-10 flex items-center justify-center gap-x-6">-->
      <!--        <nuxt-link to="/" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">-->
      <!--          Go back home-->
      <!--        </nuxt-link>-->
      <!--        &lt;!&ndash;        <a href="#" class="text-sm font-semibold text-gray-900">Contact support <span aria-hidden="true">&rarr;</span></a>&ndash;&gt;-->
      <!--      </div>-->
      <!--    </div>-->
    </div>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError
}>();

const statusCode = computed(() => {
  return props.error.statusCode;
});

const is404 = computed(() => {
  return statusCode.value === 404;
});

const title = computed(() => {
  if (is404.value) {
    return "Page not found";
  }

  return "An error occured";
});

const description = computed(() => {
  if (is404.value) {
    return "We couldn't find that page";
  }

  return "There was a problem rendering that page";
});

const isDev = computed(() => {
  return process.env.NODE_ENV === "development";
});

</script>

<style scoped lang="scss">

</style>
