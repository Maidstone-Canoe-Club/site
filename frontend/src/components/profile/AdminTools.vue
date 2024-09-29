<template>
  <div>
    <strong class="mb-5 block">Admin tools</strong>
    <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
      <div v-for="(action, actionIdx) in actions" :key="action.title" :class="[actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '', actionIdx === 1 ? 'sm:rounded-tr-lg' : '', actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '', actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '', 'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500']">
        <div>
          <span :class="[action.iconBackground, action.iconForeground, 'inline-flex rounded-lg p-3 ring-4 ring-white']">
            <component :is="action.icon" class="h-6 w-6" aria-hidden="true" />
          </span>
        </div>
        <div class="mt-8">
          <h3 class="text-base font-semibold leading-6 text-gray-900">
            <component
              :is="action.href ? NuxtLink : 'div'"
              :target="action.target"
              :to="action.href"
              class="focus:outline-none">
              <span
                class="absolute inset-0"
                aria-hidden="true" />
              {{ action.title }}
            </component>
          </h3>
          <p class="mt-2 text-sm text-gray-500">
            {{ action.description }}
          </p>
        </div>
        <span
          v-if="action.href"
          class="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
          aria-hidden="true">
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NewspaperIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ChartBarSquareIcon
} from "@heroicons/vue/24/outline";
import { NuxtLink } from "#components";

const config = useRuntimeConfig();

const actions = [
  {
    title: "Directus",
    href: config.public.directus.url,
    target: "_blank",
    description: "Manage website content and users",
    icon: NewspaperIcon,
    iconForeground: "text-purple-700",
    iconBackground: "bg-purple-50"
  },
  {
    title: "Newsletters",
    href: "/newsletters",
    target: null,
    description: "Send newsletters to subscribers",
    icon: EnvelopeIcon,
    iconForeground: "text-teal-700",
    iconBackground: "bg-teal-50"
  },
  {
    title: "Analytics",
    href: "https://analytics.mccdev.co.uk/share/eE4bQ5sH4aZVaUiU/mcc%20dev",
    target: "_blank",
    description: "See site analytics",
    icon: ChartBarSquareIcon,
    iconForeground: "text-sky-700",
    iconBackground: "bg-sky-50"
  },
  {
    title: "User admin",
    href: "/admin/users",
    description: "Manage users",
    icon: UserGroupIcon,
    iconForeground: "text-rose-700",
    iconBackground: "bg-rose-50"
  }
];
</script>

<style scoped lang="scss">

</style>
