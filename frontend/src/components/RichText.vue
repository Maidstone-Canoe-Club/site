<template>
  <div
    v-if="content"
    v-html="content" />
</template>

<script setup lang="ts">
defineProps<{
  content?: string
}>();
</script>

<style scoped lang="postcss">
::v-deep(p) {
  @apply leading-6;
}
::v-deep(p:not(:last-child)) {
  @apply mb-6 leading-6;
}

::v-deep(img){
  @apply rounded-lg;
}

::v-deep(ul){
  @apply list-disc mx-8 py-4;
}

::v-deep(p + ul){
  @apply pt-0;
}

::v-deep(a) {
  @apply text-[#6475f0] underline;
}

::v-deep(h3) {
  @apply text-2xl font-bold mb-2;
}
</style>
