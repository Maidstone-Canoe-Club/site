<template>
  <div
    v-if="home.show_holding_page"
    class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <div class="flex justify-center items-center mb-12 mt-12">
      <nuxt-img
        src="/images/logo.svg"
        width="200px"
        height="200px" />
    </div>
    <rich-text :content="holdingPage" />
  </div>
  <div
    v-else
    class="flex min-h-full flex-col bg-gray-50 relative">
    <nuxt-loading-indicator />
    <page-header
      class="z-10" />
    <email-verification-banner
      v-if="showVerificationBanner"
      class="z-[9]" />

    <div class="absolute z-0 h-[75vh] top-16 w-full object-cover overflow-hidden ">
      <div class="bg-gradient-to-t from-gray-50 to-30% to-black/[.35] inset-0 absolute" />
      <nuxt-img
        src="/images/hero_small.webp"
        height="1100"
        :width="width"
        :placeholder="15"
        class="h-full object-cover w-full z-5" />
    </div>

    <div class="w-full absolute h-[460px] sm:h-[460px] top-16 flex justify-center items-center">
      <div class="mx-auto w-full max-w-7xl flex flex-grow px-4 sm:px-6 lg-px-8 flex-col sm:flex-row gap-4 sm:gap-8 justify-center">
        <img
          src="/images/logo-white.svg"
          alt="logo"
          class="w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] drop-shadow-[0_2px_2px_black]">
        <div class="flex flex-col flex-shrink justify-center max-w-[666px]">
          <h1 class="text-4xl font-bold text-white drop-shadow-[0_1px_1px_black]">
            {{ home?.title }}
          </h1>
          <p
            v-if="home?.tagline"
            class="sm:w-full mt-3 text-white drop-shadow-[0_1px_2px_black]">
            {{ home?.tagline }}
          </p>
        </div>
      </div>
    </div>

    <div>
      <slot />
    </div>
    <page-footer class="mt-8" />
  </div>
</template>

<script setup lang="ts">
import { Home } from "~/types";

useHead({
  titleTemplate: title => title ? `${title} | MCC` : "Maidstone Canoe Club"
});

const route = useRoute();
const showVerificationBanner = computed(() => !route.path.startsWith("/confirm-email"));

const { getSingletonItem } = useDirectusItems();

const { data: home } = await useAsyncData("home", async () => {
  return await getSingletonItem<Home>({
    collection: "home"
  });
});

const width = process.client ? window.innerWidth : 1920;
const height = 1100;

const holdingPage = computed(() => home.value?.holding_page_content);

</script>

<style scoped lang="postcss">

</style>
