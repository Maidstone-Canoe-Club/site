<template>
  <div class="mx-auto max-w-7xl pt-16 lg:flex lg:gap-x-16">
    <TabGroup :selected-index="selectedTab" @change="changeTab">
      <aside
        class="flex overflow-x-auto border-b border-gray-900/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20">
        <nav class="flex-none px-2 sm:px-6 lg:px-0">
          <TabList>
            <ul role="list" class="flex gap-x-3 px-2 gap-y-1 whitespace-nowrap lg:flex-col">
              <li v-for="item in navigation" :key="item.name">
                <Tab
                  v-slot="{selected}"
                  :as="NuxtLink"
                  :to="item.href"
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
            <event-bookings />
          </TabPanel>
          <TabPanel>
            <payment-history />
          </TabPanel>
          <TabPanel>
            <email-preferences />
          </TabPanel>
          <TabPanel>
            <junior-members />
          </TabPanel>
          <TabPanel>
            <admin-tools />
          </TabPanel>
        </TabPanels>
      </main>
    </TabGroup>
  </div>
</template>

<script setup lang="ts">
import { TabGroup, TabList, TabPanels, TabPanel, Tab } from "@headlessui/vue";
import { CalendarDaysIcon, UserCircleIcon, UsersIcon, CreditCardIcon, EnvelopeIcon, Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { useDirectusUser, definePageMeta } from "#imports";
import { NuxtLink } from "#components";

definePageMeta({
  middleware: ["auth"]
});

useHead({ title: "Profile" });

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

const route = useRoute();
const hash = ref(route.params.slug);

const navigation = computed(() => {
  const items = [
    { name: "General", href: "/profile", icon: UserCircleIcon, current: true },
    { name: "Event bookings", href: "/profile/events", icon: CalendarDaysIcon, current: hash.value === "events" },
    { name: "Payment history", href: "/profile/payments", icon: CreditCardIcon, current: hash.value === "payments" },
    { name: "Email preferences", href: "/profile/mail", icon: EnvelopeIcon, current: hash.value === "mail" },
    { name: "Junior accounts", href: "/profile/juniors", icon: UsersIcon, current: hash.value === "juniors" }
  ];

  if (hasRole(user.value, "committee")) {
    items.push({ name: "Admin tools", href: "/profile/admin", icon: Cog6ToothIcon, current: hash.value === "admin" });
  }

  return items;
});

const selectedTab = ref(navigation.value.findIndex(x => x.href === `/profile/${hash.value}`));

function changeTab (index) {
  selectedTab.value = index;
}

</script>

<style scoped lang="scss">

</style>
