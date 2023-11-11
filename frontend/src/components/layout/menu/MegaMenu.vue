<template>
  <nav class="bg-white">
    <div class="mx-auto flex max-w-7xl items-center justify-between py-4 px-6" aria-label="Global">
      <div class="flex lg:flex-1">
        <nuxt-link to="/" class="-m-1.5 p-1.5">
          <span class="sr-only">Maidstone Canoe Club</span>
          <img
            class="h-14 w-auto"
            src="/images/logo-no-text.svg"
            alt="MCC logo">
        </nuxt-link>
      </div>
      <div class="flex lg:hidden">
        <button
          type="button"
          class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          @click="mobileMenuOpen = true">
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <PopoverGroup class="hidden lg:flex lg:gap-x-12">
        <template
          v-for="navItem in navItems"
          :key="navItem.name">
          <Popover
            v-if="navItem.childItems && navItem.childItems.length"
            class="relative">
            <PopoverButton class="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
              {{ navItem.name }}
              <ChevronDownIcon class="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
            </PopoverButton>

            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1">
              <PopoverPanel
                class="absolute -left-8 top-full z-10 mt-3 w-56 rounded-xl bg-white p-2 shadow-lg ring-1 ring-gray-900/5">
                <template
                  v-for="item in navItem.childItems"
                  :key="item.name">
                  <Disclosure
                    v-if="item.childItems && item.childItems.length"
                    v-slot="{ open }"
                    as="div"
                    class="block text-sm font-semibold leading-6 text-gray-900">
                    <DisclosureButton
                      class="flex w-full px-3 py-2 rounded-lg justify-between items-center hover:bg-gray-50">
                      {{ item.name }}
                      <ChevronDownIcon :class="[open ? 'rotate-180' : '', 'h-5 w-5 flex-none']" aria-hidden="true" />
                    </DisclosureButton>
                    <DisclosurePanel>
                      <DisclosureButton
                        v-for="child in item.childItems"
                        :key="child.name"
                        :as="NuxtLink"
                        :to="child.href"
                        class="block rounded-lg pl-6 px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
                        {{ child.name }}
                      </DisclosureButton>
                    </DisclosurePanel>
                  </Disclosure>

                  <nuxt-link
                    v-else
                    :to="item.href"
                    class="block rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
                    {{
                      item.name
                    }}
                  </nuxt-link>
                </template>
              </PopoverPanel>
            </transition>
          </Popover>
          <nuxt-link
            v-else
            :to="navItem.href"
            class="text-sm font-semibold leading-6 text-gray-900">
            {{ navItem.name }}
          </nuxt-link>
        </template>
      </PopoverGroup>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end">
        <Menu
          v-if="user"
          as="div"
          class="relative ml-3">
          <div>
            <MenuButton class="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span class="sr-only">Open user menu</span>
              <user-avatar
                :user="user"
                size-class="w-10 h-10" />
            </MenuButton>
          </div>
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="scale-95 transform opacity-0"
            enter-to-class="scale-100 transform opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="scale-100 transform opacity-100"
            leave-to-class="scale-95 transform opacity-0">
            <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <MenuItem
                v-for="item in userNavItems"
                :key="item.name"
                v-slot="{ active, close }">
                <button
                  v-if="item.action"
                  type="button"
                  :class="[active ? 'bg-gray-100' : '', 'rounded-lg w-full text-left block px-4 py-2 text-sm font-semibold leading-6 text-gray-900']"
                  @click="item.action">
                  {{ item.name }}
                </button>
                <nuxt-link
                  v-else
                  :to="item.href"
                  :target="item.target"
                  :class="[active ? 'bg-gray-100' : '', 'rounded-lg block px-4 py-2 text-sm font-semibold leading-6 text-gray-900']"
                  @mouseup="close"
                  @touchend="close">
                  {{ item.name }}
                </nuxt-link>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
        <nuxt-link
          v-else
          :to="loginUrl"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Log in
        </nuxt-link>
      </div>
    </div>
  </nav>
  <lazy-mobile-menu
    v-model:open="mobileMenuOpen"
    :nav-items="navItems"
    :user-nav-items="userNavItems" />
</template>

<script setup lang="ts">
import {
  Disclosure, DisclosureButton, DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Menu, MenuButton, MenuItems, MenuItem
} from "@headlessui/vue";
import {
  Bars3Icon
} from "@heroicons/vue/24/outline";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { ref } from "vue";
import { NuxtLink } from "#components";

export type NavItem = {
  name: string,
  href?: string,
  target?: string,
  current?: boolean,
  childItems?: NavItem[],
  action?: () => Promise<void>
}

defineProps<{
  navItems: NavItem[]
}>();

const user = useDirectusUser();
const { logout } = useDirectusAuth();

const route = useRoute();
const loginUrl = computed(() => `/login?redirect=${route.fullPath}`);

const mobileMenuOpen = ref(false);

const userNavItems: NavItem[] = [
  {
    name: "Profile",
    href: "/profile"
  },
  {
    name: "Sign out",
    action: onSignOut
  }
];

async function onSignOut () {
  await logout();
  mobileMenuOpen.value = false;
  await navigateTo("/");
}

</script>

<style scoped lang="scss">

</style>
