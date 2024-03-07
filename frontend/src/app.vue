<template>
  <nuxt-layout :key="key">
    <nuxt-page />
  </nuxt-layout>
</template>

<script setup lang="ts">
import { provideUseId } from "@headlessui/vue";

provideUseId(() => useId());

const user = useDirectusUser();
const key = computed(() => user.value?.id || "");

</script>

<style lang="postcss">
.page-enter-active,
.page-leave-active {
  transition: all .2s ease-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(.5rem);
  filter: blur(0.1rem);
  pointer-events: none;

}

.layout-content,
.layout-enter-active,
.layout-leave-active {
  transition: all .2s ease-out;
}

.layout-enter-from,
.layout-leave-to {
  .layout-content {
    opacity: 0;
    transform: translateY(.5rem);
    filter: blur(0.1rem);
    pointer-events: none;
  }
}

</style>
