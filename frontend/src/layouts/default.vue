<template>
  <div>
    <div class="flex min-h-full flex-col">
      <page-header />
      <div class="mx-auto w-full max-w-7xl flex-grow px-4 sm:px-6 lg-px-8">
        <slot />
      </div>
      <page-footer />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: title => title ? `${title} | MCC` : "Maidstone Canoe Club"
});
</script>

<style scoped lang="scss">

</style>
