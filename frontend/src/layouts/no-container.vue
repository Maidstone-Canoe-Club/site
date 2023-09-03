<template>
  <div class="flex min-h-full flex-col bg-gray-50">
    <page-header />
    <email-verification-banner
      v-if="showVerificationBanner" />
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

</script>

<style scoped lang="scss">

</style>
