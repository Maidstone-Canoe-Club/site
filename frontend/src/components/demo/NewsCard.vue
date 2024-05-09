<script setup lang="ts">
const user = useDirectusUser();
</script>

<template>
  <article
    class="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80">
    <NuxtImg
      src="https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=3603&amp;q=80"
      alt=""
      loading="lazy"
      class="absolute inset-0 -z-10 h-full w-full object-cover" />
    <div class="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
    <div class="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

    <div class="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
      <time datetime="2020-03-16" class="mr-8">Mar 16, 2020</time>
      <div class="-ml-4 flex items-center gap-x-4">
        <svg viewBox="0 0 2 2" class="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50">
          <circle cx="1" cy="1" r="1" />
        </svg>

        <div class="flex gap-x-2.5">
          <UserAvatar
            size-class="w-6 h-6"
            :image-size="25"
            :user="user" />
          Michael Foster
        </div>
      </div>
    </div>
    <h3 class="mt-3 text-lg font-semibold leading-6 text-white">
      <a href="#">
        <span class="absolute inset-0" />
        Vel expedita assumenda placeat aut nisi optio voluptates quas
      </a>
    </h3>
  </article>
</template>

<style scoped lang="scss">

</style>
