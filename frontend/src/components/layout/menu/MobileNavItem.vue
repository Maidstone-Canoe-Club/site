<template>
  <div class="space-y-2">
    <template
      v-if="!item.childItems?.length">
      <nuxt-link
        v-if="item.href"
        class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
        :class="[item.current ? 'bg-indigo-50' : null]"
        :to="item.href"
        @mouseup="onLinkClick(item.href)"
        @touchend="onLinkClick(item.href)">
        {{ item.name }}
      </nuxt-link>
      <button
        v-else
        class="-mx-3 w-full text-left block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
        @click="item.action">
        {{ item.name }}
      </button>
    </template>
    <Disclosure
      v-else
      v-slot="{open}"
      as="div"
      class="-mx-3">
      <DisclosureButton class="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
        {{ item.name }}
        <ChevronDownIcon :class="[open ? 'rotate-180' : '', 'h-5 w-5 flex-none']" aria-hidden="true" />
      </DisclosureButton>
      <DisclosurePanel class="space-y-2">
        <div class="block rounded-lg pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900">
          <mobile-nav-item
            v-for="child in item.childItems"
            :key="child.name"
            :item="child"
            @close="emits('close')" />
        </div>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { NavItem } from "~/components/layout/menu/MegaMenu.vue";

const emits = defineEmits(["close"]);

defineProps<{
  item: NavItem
}>();

async function onLinkClick (href: string) {
  emits("close");
  await navigateTo(href);
}

</script>

<style scoped lang="scss">

</style>
