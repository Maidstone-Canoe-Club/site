<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <div class="flex flex-wrap gap-4 items-center justify-between mb-12">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Meeting Minutes
      </h1>
      <nuxt-link
        v-if="canModifyMinutes"
        class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        to="/minutes/new">
        Upload minutes
      </nuxt-link>
    </div>

    <div v-if="meetingMinutes && meetingMinutes.length">
      <ul role="list" class="divide-y divide-gray-100">
        <li v-for="minutes in meetingMinutes" :key="minutes.id" class="flex items-center justify-between gap-x-6 py-5 relative">
          <div
            v-if="minutes.loading"
            class="absolute inset-[-5px] backdrop-blur-[2px] flex justify-center items-center z-10">
            <loading-spinner color="#aaa" />
          </div>

          <div class="min-w-0">
            <div class="flex items-start gap-x-3">
              <p class="text-sm font-semibold leading-6 text-gray-900">
                {{ formatMeetingName(minutes.meeting) }}
              </p>
            </div>
            <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
              <p class="whitespace-nowrap">
                <time :datetime="minutes.date">{{ formatDate(minutes.meeting_date) }}</time>
              </p>
            </div>
          </div>
          <div class="flex flex-none items-center gap-x-4">
            <a
              :href="minutes.href"
              target="_blank"
              class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 block">
              Download minutes
            </a>

            <Menu
              v-if="canModifyMinutes"
              as="div"
              class="relative flex-none">
              <MenuButton class="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                <span class="sr-only">Open options</span>
                <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
              </MenuButton>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95">
                <MenuItems class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                    <button
                      type="button"
                      class="w-full text-left"
                      :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                      @click="onDelete(minutes)">
                      Delete
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </li>
      </ul>
    </div>
    <div v-else>
      No minutes yet!
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";

const { getItems, deleteItems } = useDirectusItems();
const directus = useDirectus();
const user = useDirectusUser();
const config = useRuntimeConfig();

const { data: meetingMinutes } = await useAsyncData("minutes", async () => {
  return await loadData();
});

async function loadData () {
  const items = await getItems({
    collection: "minutes",
    sort: ["-meeting_date"]
  });

  return items?.map(x => ({
    ...x,
    href: `${config.public.directus.url}/assets/${x.file}?download`
  })) ?? [];
}

const canModifyMinutes = computed(() => {
  return user.value && hasRole(user.value, "coach");
});

function formatMeetingName (value: string) {
  switch (value) {
  case "committee": return "Committee meeting";
  case "cdg": return "CDG";
  default: throw new Error(`Unknown meeting type: '${value}'`);
  }
}

function formatDate (input: string) {
  return format(new Date(input), "do MMMM yyyy");
}

async function onDelete (minutes: any) {
  try {
    minutes.loading = true;

    await directus(`/files/${minutes.file}`, {
      method: "DELETE"
    });

    await deleteItems({
      collection: "minutes",
      items: [minutes.id]
    });

    meetingMinutes.value = await loadData();
  } catch (e) {
    console.error("error deleting minutes", e);
  } finally {
    minutes.loading = false;
  }
}

</script>

<style scoped lang="scss">

</style>
