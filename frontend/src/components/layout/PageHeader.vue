<template>
  <Disclosure v-slot="{ open }" as="nav" class="border-b border-gray-200 bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <nuxt-link to="/">
              <img class="block h-8 w-auto lg:hidden" src="/images/logo-no-text.svg" alt="Maidstone Canoe Club logo">
              <img class="hidden h-8 w-auto lg:block" src="/images/logo-no-text.svg" alt="Maidstone Canoe Club logo">
            </nuxt-link>
          </div>
          <div class="hidden sm:space-x-8 sm:-my-px sm:ml-6 sm:flex">
            <nuxt-link v-for="item in navigation" :key="item.name" :to="item.href" :class="[item.current ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium']" :aria-current="item.current ? 'page' : undefined">
              {{ item.name }}
            </nuxt-link>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- Profile dropdown -->
          <template v-if="user">
            <Menu as="div" class="relative ml-3">
              <div>
                <MenuButton class="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span class="sr-only">Open user menu</span>
                  <user-avatar :user="user" />
                </MenuButton>
              </div>
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="scale-95 transform opacity-0"
                enter-to-class="scale-100 transform opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="scale-100 transform opacity-100"
                leave-to-class="scale-95 transform opacity-0">
                <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active, close }">
                    <button
                      v-if="item.onClick"
                      type="button"
                      :class="[active ? 'bg-gray-100' : '', 'w-full text-left block px-4 py-2 text-sm text-gray-700']"
                      @click="item.onClick">
                      {{ item.name }}
                    </button>
                    <nuxt-link
                      v-else
                      :to="item.href"
                      :target="item.target"
                      :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      @mouseup="close">
                      {{ item.name }}
                    </nuxt-link>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </template>
          <template v-else>
            <nuxt-link :to="loginUrl" class="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" data-umami-event="Login button">
              Login
            </nuxt-link>
          </template>
        </div>
        <div class="-mr-2 flex items-center sm:hidden">
          <!-- Mobile menu button -->
          <DisclosureButton class="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
            <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <DisclosureButton
          v-for="item in navigation"
          :key="item.name"
          as="a"
          :href="item.href"
          :class="[item.current ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800', 'block border-l-4 py-2 pl-3 pr-4 text-base font-medium']"
          :aria-current="item.current ? 'page' : undefined">
          {{ item.name }}
        </DisclosureButton>
      </div>
      <div
        v-if="user"
        class="border-t border-gray-200 pt-4 pb-3">
        <div class="flex items-center px-4">
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
        <div class="mt-3 space-y-1">
          <DisclosureButton
            v-for="item in userNavigation"
            :key="item.name"
            as="a"
            :href="item.href"
            class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            @click="item.onClick">
            {{ item.name }}
          </DisclosureButton>
        </div>
      </div>
      <div v-else>
        <div class="mt-3 space-y-1">
          <DisclosureButton
            as="a"
            href="javascript:;"
            class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            data-umami-event="Login button"
            @click="navigateTo(loginUrl)">
            Login
          </DisclosureButton>
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Bars3Icon, UserCircleIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { Disclosure, DisclosurePanel, DisclosureButton, Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import { useDirectusUser, navigateTo, useDirectusAuth, useRoute, getAvatarUrl } from "#imports";

const route = useRoute();
const user = useDirectusUser();
const { logout } = useDirectusAuth();

const loginUrl = computed(() => `/login?redirect=${route.fullPath}`);
const directusUrl = useDirectusUrl();

const navigation = computed(() => {
  return [
    { name: "Home", href: "/", current: route.path === "/" },
    { name: "About us", href: "/about-us", current: route.path === "/about-us" }
    // { name: "Calendar", href: "/calendar", current: route.path === "/calendar" },
    // { name: "Coaching", href: "/content/1/coaching", current: route.path === "/content/1/coaching" }
  ];
});

const userNavigation = ref([
  { name: "Profile", href: "/profile" },
  {
    name: "Sign out",
    href: "#",
    onClick: async () => {
      await logout();
      await navigateTo("/");
    }
  }
]);

// temp check to see if user is admin
if (user.value && user.value.role === "b4a0ccc9-6378-4b29-a3d5-dfb065b2ff42") {
  userNavigation.value.push({
    name: "Directus",
    href: directusUrl,
    target: "_blank"
  },
  {
    name: "Analytics",
    href: "https://analytics.mccdev.co.uk",
    target: "_blank"
  });
}

const hasAvatar = computed(() => !!user.value?.avatar);
const avatarUrl = getAvatarUrl(user);

</script>

<style scoped lang="scss">

</style>
