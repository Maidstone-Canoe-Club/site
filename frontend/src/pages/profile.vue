<template>
  <div class="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16">
    <TabGroup>
      <aside
        class="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20">
        <nav class="flex-none px-2 sm:px-6 lg:px-0">
          <TabList>
            <ul role="list" class="flex gap-x-3 px-2 gap-y-1 whitespace-nowrap lg:flex-col">
              <li v-for="item in navigation" :key="item.name">
                <Tab
                  v-slot="{selected}"
                  as="a"
                  :href="item.href"
                  :class="['ui-selected:bg-gray-50 ui-selected:text-indigo-600', 'ui-not-selected:text-gray-700 ui-not-selected:hover:text-indigo-600 ui-not-selected:hover:bg-gray-50', 'group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm leading-6 font-semibold']">
                  <component
                    :is="item.icon"
                    :class="[selected ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600', 'h-6 w-6 shrink-0']"
                    aria-hidden="true" />
                  {{ item.name }}
                </Tab>
              </li>
            </ul>
          </TabList>
        </nav>
      </aside>

      <main
        v-if="user"
        class="px-1 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
        <TabPanels>
          <TabPanel>
            <user-details v-model="user" />
          </TabPanel>
          <TabPanel>
            <payment-history />
          </TabPanel>
          <TabPanel>
            <user-notification />
          </TabPanel>
        </TabPanels>
      </main>
    </TabGroup>
  </div>
</template>

<script setup lang="ts">
import { TabGroup, TabList, TabPanels, TabPanel, Tab } from "@headlessui/vue";
import { UserCircleIcon, CreditCardIcon, EnvelopeIcon } from "@heroicons/vue/24/outline";
import { useDirectusUser, definePageMeta } from "#imports";

definePageMeta({
  middleware: ["auth"]
});

const user = useDirectusUser();

/**
 * User needs to be able to view and edit user info
 * Can change email (requires email confirmation)
 * Can change password (send email saying password has changed?)
 * Can view and set emergency contact info
 * Can view and set medical information
 * Can view past payments
 * Can change email notification preferences
 */

const navigation = [
  { name: "General", href: "#", icon: UserCircleIcon, current: true },
  { name: "Payment history", href: "#", icon: CreditCardIcon, current: false },
  { name: "Notifications", href: "#", icon: EnvelopeIcon, current: false }
];

</script>

<style scoped lang="scss">

</style>
