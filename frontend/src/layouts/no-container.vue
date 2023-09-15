<template>
  <div class="flex min-h-full flex-col bg-gray-50 relative">
    <nuxt-loading-indicator />
    <page-header
      class="z-10" />
    <email-verification-banner
      v-if="showVerificationBanner" />

    <div class="absolute z-0 h-[1100px] top-16 w-full object-cover overflow-hidden ">
      <div class="bg-gradient-to-t from-gray-50 to-30% to-black/[.35] inset-0 absolute" />
      <img
        :src="heroImage"
        class="h-full object-cover w-full z-5"
        alt="bg">
    </div>

    <div class="w-full absolute h-[460px] sm:h-[460px] top-16 flex justify-center items-center">
      <div class="mx-auto w-full max-w-7xl flex flex-grow px-4 sm:px-6 lg-px-8 flex-col sm:flex-row gap-4 sm:gap-8 justify-center">
        <img
          src="/images/logo.svg"
          alt="logo"
          class="w-[150px] sm:w-[200px] h-[150px] sm:h-[200px]">
        <div class="flex flex-col flex-shrink justify-center max-w-[666px]">
          <h1 class="text-4xl font-bold text-white">
            Maidstone Canoe Club
          </h1>
          <p class="sm:w-full mt-3 text-white">
            Lorem ipsum dolor sit amet. Et sunt libero qui laborum impedit qui perferendis velit qui fugiat numquam. Eum
            rerum quia aut quia laudantium At beatae voluptatem et ipsum nemo non impedit quisquam. Sit cumque dolorem aut
            unde eligendi qui sunt soluta.
          </p>
        </div>
      </div>
    </div>

    <div>
      <slot />
    </div>
    <page-footer />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: title => title ? `${title} | MCC` : "Maidstone Canoe Club"
});

const route = useRoute();
const showVerificationBanner = computed(() => !route.path.startsWith("/confirm-email"));

const { getSingletonItem } = useDirectusItems();

const { data: home } = await useAsyncData("home", async () => {
  return await getSingletonItem({
    collection: "home",
    params: {
      fields: ["*", "hero_image.*"]
    }
  });
});

const width = process.client ? window.innerWidth : 1920;
const height = 1100;

const heroImage = computed(() => generateImageUrlOptions(home.value?.hero_image.id, {
  quality: 60,
  width,
  height,
  fit: "cover",
  format: "webp"
}));

</script>

<style scoped lang="postcss">

</style>
