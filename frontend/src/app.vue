<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>

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
<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
</script>
