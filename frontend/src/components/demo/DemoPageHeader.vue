<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel
} from "@headlessui/vue";
import {
  AcademicCapIcon,
  ArrowPathIcon,
  Bars3Icon, CalendarDaysIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon, SparklesIcon,
  SquaresPlusIcon, SunIcon, TruckIcon, UsersIcon,
  XMarkIcon
} from "@heroicons/vue/24/outline";
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from "@heroicons/vue/20/solid";
import type { FunctionalComponent } from "vue";
import { NuxtLink } from "#components";

type NavChildItem = {
  name: string,
  to: string
  icon?: FunctionalComponent,
  description?: string,
}

type NavItem = {
  name: string,
  to?: string,
  children?: NavChildItem[]
}

const nav: NavItem[] = [
  {
    name: "About",
    children: [
      {
        name: "The club",
        to: "/demo/the-club",
        icon: AcademicCapIcon,
        description: ""
      }
    ]
  },
  {
    name: "Activities",
    children: [
      {
        name: "Courses",
        to: "/demo/courses",
        icon: SparklesIcon,
        description: "Entry level courses"
      },
      {
        name: "Recreational paddling",
        to: "/demo/recreational",
        icon: SparklesIcon,
        description: "From paddleboarding to multi-day touring"
      },
      {
        name: "Racing",
        to: "#",
        icon: SparklesIcon,
        description: "Marathon and sprint racing"
      },
      {
        name: "Whitewater",
        to: "#",
        icon: SparklesIcon,
        description: "Are you ready to get wet?"
      }
    ]
  },
  {
    name: "Whats on",
    children: [
      {
        name: "Calendar",
        to: "/calendar",
        icon: CalendarDaysIcon
      },
      {
        name: "Trips",
        to: "/trips",
        icon: TruckIcon
      }
    ]
  },
  {
    name: "Join us",
    children: [
      {
        name: "Membership",
        to: "/membership",
        icon: UsersIcon
      },
      {
        name: "FAQ",
        to: "/faq",
        icon: UsersIcon
      }
    ]
  },
  {
    name: "Resources"
  }
];

const mobileMenuOpen = ref(false);
</script>

<template>
  <header class="bg-white">
    <nav class="mx-auto flex max-w-7xl items-center justify-between py-3 px-6 lg:px-8" aria-label="Global">
      <div class="flex lg:flex-1">
        <nuxt-link to="/" class="-m-1.5 p-1.5">
          <span class="sr-only">Your Company</span>
          <img class="h-14 w-auto" src="/images/logo-no-text.svg" alt="">
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
          v-for="item in nav"
          :key="item.name">
          <Popover
            v-if="item.children?.length"
            class="relative">
            <PopoverButton class="flex items-center gap-x-1 font-semibold leading-6 text-gray-900">
              {{ item.name }}
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
                v-slot="{close}"
                class="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                <div class="p-4">
                  <div
                    v-for="child in item.children"
                    :key="child.name"
                    class="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50">
                    <div
                      class="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <component
                        :is="child.icon"
                        class="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                        aria-hidden="true" />
                    </div>
                    <div class="flex-auto">
                      <nuxt-link
                        :to="child.to"
                        class="block font-semibold text-gray-900"
                        @mouseup="() => close()">
                        {{ child.name }}
                        <span class="absolute inset-0" />
                      </nuxt-link>
                      <p class="mt-1 text-gray-600">
                        {{ child.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </PopoverPanel>
            </transition>
          </Popover>
          <nuxt-link
            v-else
            :to="item.to"
            class="font-semibold leading-6 text-gray-900">
            {{ item.name }}
          </nuxt-link>
        </template>
      </PopoverGroup>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end">
        <nuxt-link
          to="/login"
          class="text-sm font-semibold leading-6 text-gray-900">
          Log in <span aria-hidden="true">&rarr;</span>
        </nuxt-link>
      </div>
    </nav>
    <client-only>
      <Dialog as="div" class="lg:hidden" :open="mobileMenuOpen" @close="mobileMenuOpen = false">
        <div class="fixed inset-0 z-10" />
        <DialogPanel
          class="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div class="flex items-center justify-between">
            <nuxt-link to="/" class="-m-1.5 p-1.5">
              <span class="sr-only">Your Company</span>
              <img class="h-10 w-auto" src="/images/logo-no-text.svg" alt="">
            </nuxt-link>
            <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = false">
              <span class="sr-only">Close menu</span>
              <XMarkIcon class="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div class="mt-6 flow-root">
            <div class="-my-6 divide-y divide-gray-500/10">
              <div class="space-y-2 py-6">
                <template
                  v-for="item in nav"
                  :key="item.name">
                  <Disclosure
                    v-if="item.children?.length"
                    v-slot="{ open }"
                    as="div"
                    class="-mx-3">
                    <DisclosureButton
                      class="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                      {{ item.name }}
                      <ChevronDownIcon :class="[open ? 'rotate-180' : '', 'h-5 w-5 flex-none']" aria-hidden="true" />
                    </DisclosureButton>
                    <DisclosurePanel class="mt-2 space-y-2">
                      <DisclosureButton
                        v-for="child in item.children"
                        :key="child.name"
                        :as="NuxtLink"
                        :to="child.to"
                        class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                        {{ child.name }}
                      </DisclosureButton>
                    </DisclosurePanel>
                  </Disclosure>
                  <nuxt-link
                    v-else
                    :to="item.to"
                    class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    {{ item.name }}
                  </nuxt-link>
                </template>
              </div>
              <div class="py-6">
                <nuxt-link
                  to="/login"
                  class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                  Log in
                </nuxt-link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </client-only>
  </header>
</template>

<style scoped lang="scss">

</style>
