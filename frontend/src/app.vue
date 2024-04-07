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
@tailwind components;

html {
  font-family: 'Karla', Arial, sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Space Grotesk", Arial, sans-serif;
}

html, body, #__nuxt {
  margin: 0;
  height: 100%;
}

.required:after {
  content: " *";
  color: red;
}

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
