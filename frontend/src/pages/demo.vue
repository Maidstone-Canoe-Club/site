<script setup lang="ts">
import type { Home } from "~/types";

definePageMeta({
  layout: "demo"
});

const { getSingletonItem } = useDirectusItems();

const { data: home } = await useAsyncData("home", async () => {
  return await getSingletonItem<Home>({
    collection: "home",
    params: {
      fields: [
        "*",
        "hero_images.*"
      ]
    }
  });
});

const heroImages = computed(() => {
  return home.value!.hero_images?.map(e => e.directus_files_id);
});

const heroImage = computed(() => {
  return home.value!.hero_image;
});

function throwError() {
  throw new Error("An example error");
}

</script>

<template>
  <div class="bg-white">
    <main>
      <div class="relative isolate">
        <div
          class="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
          aria-hidden="true">
          <div
            class="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#8587fc] to-[#7bd7fc] opacity-30"
            style="clip-path: polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)" />
        </div>
        <div class="overflow-hidden">
          <div class="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
            <div class="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div class="relative w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
                <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Maidstone Canoe Club
                </h1>
                <p class="mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
                  Discover our welcoming paddling club, embracing enthusiasts of marathon and sprint racing, river
                  touring, white water, sea touring, or a leisurely paddle.
                </p>
                <div class="mt-10 flex items-center gap-x-6">
                  <button @click="throwError">Throw error</button>
                  <a
                    href="#"
                    class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Join us</a>
                  <a href="#" class="text-sm font-semibold leading-6 text-gray-900">See whats on <span
                    aria-hidden="true">→</span></a>
                </div>
              </div>
              <div
                class="mt-14 flex justify-center md:justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <div
                  class="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
                  <div class="relative overflow-hidden rounded-xl">
                    <NuxtImg
                      provider="directus"
                      :src="heroImages[0]"
                      alt=""
                      width="176"
                      height="264"
                      quality="75"
                      loading="lazy"
                      placeholder
                      placeholder-class="blur-lg opacity-50"
                      class=" aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg">
                      <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </NuxtImg>
                  </div>
                </div>
                <div class="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                  <div class="relative overflow-hidden rounded-xl">
                    <NuxtImg
                      provider="directus"
                      :src="heroImages[1]"
                      alt=""
                      width="176"
                      height="264"
                      quality="75"
                      loading="lazy"
                      placeholder
                      placeholder-class="blur-lg opacity-50"
                      class="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg">
                      <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </NuxtImg>
                  </div>
                  <div class="relative overflow-hidden rounded-xl">
                    <NuxtImg
                      provider="directus"
                      :src="heroImages[2]"
                      alt=""
                      width="176"
                      height="264"
                      quality="75"
                      loading="lazy"
                      placeholder
                      placeholder-class="blur-lg opacity-50"
                      class="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg">
                      <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </NuxtImg>
                  </div>
                </div>
                <div class="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                  <div class="relative overflow-hidden rounded-xl">
                    <NuxtImg
                      provider="directus"
                      :src="heroImages[3]"
                      alt=""
                      width="176"
                      height="264"
                      quality="75"
                      loading="lazy"
                      placeholder
                      placeholder-class="blur-lg opacity-50"
                      class="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg">
                      <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </NuxtImg>
                  </div>
                  <div class="relative overflow-hidden rounded-xl">
                    <NuxtImg
                      provider="directus"
                      :src="heroImages[4]"
                      alt=""
                      width="176"
                      height="264"
                      quality="75"
                      loading="lazy"
                      placeholder
                      placeholder-class="blur-lg opacity-50"
                      class="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg">
                      <div class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </NuxtImg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-32 sm:mt-40 xl:mx-auto xl:max-w-7xl xl:px-8">
        <NuxtImg
          provider="directus"
          :src="heroImage"
          class="aspect-[5/2] w-full object-cover xl:rounded-3xl"
          placeholder
          loading="lazy"
          sizes="sm:650px md:950px lg:1200px"
          format="webp"
          quality="75"
          alt="" />
      </div>

      <div class="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            From the blog
          </h2>
          <p class="mt-2 text-lg leading-8 text-gray-600">
            Vel dolorem qui facilis soluta sint aspernatur totam
            cumque.
          </p>
        </div>
        <div
          class="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <news-card />
          <news-card />
          <news-card />
        </div>
      </div>
      <!--      <call-to-action />-->
      <div class="mt-40" />
    </main>
  </div>
</template>

<style scoped lang="scss">

</style>
