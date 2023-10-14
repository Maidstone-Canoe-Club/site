<template>
  <client-only>
    <Dialog as="div" class="lg:hidden" :open="mobileMenuOpen" @close="mobileMenuOpen = false">
      <div class="fixed inset-0 z-10" />
      <DialogPanel
        class="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div class="flex items-center justify-between">
          <a href="#" class="-m-1.5 p-1.5">
            <span class="sr-only">Your Company</span>
            <nuxt-img class="h-8 w-auto" src="/images/logo-no-text.svg" alt="MCC logo" />
          </a>
          <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = false">
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6">
              <mobile-nav-item
                v-for="item in navItems"
                :key="item.name"
                :item="item"
                @close="onMobileClose" />
            </div>
            <div class="py-6">
              <div v-if="user">
                <div
                  class="flex items-center">
                  <div class="flex-shrink-0">
                    <user-avatar :user="user" />
                  </div>
                  <div class="ml-3">
                    <div class="text-base font-medium text-gray-800">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-sm font-medium text-gray-500">
                      {{ user.email }}
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <mobile-nav-item
                    v-for="userItem in userNavItems"
                    :key="userItem.name"
                    :item="userItem" />
                </div>
              </div>
              <nuxt-link
                v-else
                :to="loginUrl"
                class="-mx-3 flex items-center justify-center rounded-lg px-3 py-2.5 bg-indigo-600 text-base text-white font-semibold leading-7 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                @mouseup="onMobileClose(loginUrl)"
                @touchend="onMobileClose(loginUrl)">
                Login
              </nuxt-link>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  </client-only>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { watch, ref } from "vue";
import { NavItem } from "~/components/layout/menu/MegaMenu.vue";

const emits = defineEmits(["update:open"]);

const props = defineProps<{
  open: boolean,
  navItems: NavItem[],
  userNavItems: NavItem[]
}>();

const user = useDirectusUser();

const route = useRoute();
const loginUrl = computed(() => `/login?redirect=${route.fullPath}`);

const mobileMenuOpen = ref(props.open);

watch(() => props.open, (val) => {
  mobileMenuOpen.value = val;
});

watch(mobileMenuOpen, (val) => {
  emits("update:open", val);
});

async function onMobileClose (href: string) {
  await navigateTo(href);
  mobileMenuOpen.value = false;
}

</script>

<style scoped lang="scss">

</style>
