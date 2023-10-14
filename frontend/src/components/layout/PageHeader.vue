<template>
  <header>
    <mega-menu :nav-items="navItems" />
  </header>
</template>

<script setup lang="ts">
import { NavItem } from "~/components/layout/menu/MegaMenu.vue";

const directus = useDirectus();

const route = useRoute();

const { data: items } = await useAsyncData("navigation", async () => {
  return await directus<NavItem[]>("/navigation");
});

const navItems = computed(() => {
  return items.value?.map(x => ({
    ...x,
    current: route.path === x.href
  })) || [];
});

</script>

<style scoped lang="scss">

</style>
