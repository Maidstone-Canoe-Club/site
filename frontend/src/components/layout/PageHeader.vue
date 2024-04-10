<template>
  <header>
    <mega-menu :nav-items="navItems" />
  </header>
</template>

<script setup lang="ts">
import type { NavItem } from "~/components/layout/menu/MegaMenu.vue";

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
<!--consent info on view attendee modal-->

<!--welfare = marty + vensa-->
<!--secretaty = christine dark-->
<!--john = chair-->
<!--matt-->
<!--memsec, bousin = james-->
<!--treasurer = geoff-->

<!--junior club-->
<!--have to be a member to book-->
<!--non-members can sign up but have to payu the one time fee-->

<!--add way to book some other user onto event when you are leader-->

<!--add sessions to event attendance-->
