<template>
  <Disclosure
    v-if="item.childItems && item.childItems.length"
    :open="isOpen"
    as="div"
    class="block text-sm font-semibold leading-6 text-gray-900">
    <DisclosureButton
      class="flex w-full rounded-lg justify-between items-center hover:bg-gray-50">
      {{ item.name }}
      <ChevronDownIcon :class="[isOpen ? 'rotate-180' : '', 'h-5 w-5 flex-none']" aria-hidden="true" />
    </DisclosureButton>
    <DisclosurePanel>
      <DisclosureButton
        v-for="child in item.childItems"
        :key="child.name"
        as="a"
        :href="child.href"
        class="block rounded-lg pl-6 px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
        {{ child.name }}
      </DisclosureButton>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { NavItem } from "~/components/layout/menu/MegaMenu.vue";

defineProps<{
  item: NavItem
}>();

const isOpen = ref(false);

</script>

<style scoped lang="scss">

</style>
