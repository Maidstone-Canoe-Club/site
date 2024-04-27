<script setup lang="ts">
import { format } from "date-fns";
import { LinkIcon } from "@heroicons/vue/20/solid";
import type { EventItem } from "~/types";

const events = ref<EventItem[]>([]);
const bookingCounts = ref<Record<string, string>>({});

const user = useDirectusUser();
const { getItems } = useDirectusItems();

const itemsPerPage = 10;
const totalCount = ref(0);
const totalPages = computed(() => totalCount.value / itemsPerPage);
const page = ref(1);

const loading = ref(false);

async function loadData () {
  loading.value = true;
  try {
    const result = await getItems<EventItem>({
      collection: "events",
      params: {
        sort: ["-start_date"],
        limit: itemsPerPage,
        page: page.value,
        meta: "filter_count",
        filter: {
          _and: [
            {
              parent_event: {
                _null: true
              }
            },
            {
              _or: [
                {
                  user_created: {
                    _eq: user.value!.id
                  }
                },
                {
                  leaders: {
                    directus_users_id: {
                      _eq: user.value!.id
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    });

    totalCount.value = result.meta?.filter_count;
    events.value = result.data;

    const counts = await getItems<{
    event: string,
    count: string
  }>({
    collection: "event_bookings",
    params: {
      filter: {
        _and: [
          {
            status: {
              _neq: "cancelled"
            }
          },
          {
            event: {
              _in: events.value.filter(e => !e.is_recurring).map(e => e.id)
            }
          }
        ]
      },
      "aggregate[count]": "*",
      groupBy: "event"
    }
  });

    if (counts && counts.length) {
      bookingCounts.value = Object.fromEntries(counts.map(b => [b.event, b.count]));
    }
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadData();
});

function eventStatus (event: EventItem) {
  if (event.status === "published") {
    return "Published";
  }

  if (event.status === "draft") {
    if (event.reviewed_by) {
      return "Rejected";
    } else {
      return "Awaiting Review";
    }
  }

  return "Draft";
}

function formatDate (date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy @ h:mmaa");
}

function clampAndTrim (input: string) {
  const maxLength = 30;
  let result = input;
  if (input.length > maxLength) {
    result = `${result.substring(0, maxLength)}...`;
  }

  return result;
}

function spacesTally (event: EventItem) {
  const count = bookingCounts.value[event.id!];
  if (event.max_spaces) {
    return `${count || 0}/${event.max_spaces}`;
  }

  return count || 0 + "/∞";
}

async function onNext () {
  if (page.value < totalPages.value) {
    page.value = page.value + 1;
    await loadData();
  }
}

async function onPrev () {
  if (page.value > 1) {
    page.value = page.value - 1;
    await loadData();
  }
}

</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-gray-900">
          My events
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          This is a list of events you've either created or are listed as an organiser/leader.
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <nuxt-link
          to="/events/new"
          type="button"
          class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Create event
        </nuxt-link>
      </div>
    </div>
    <div
      v-if="loading"
      class="w-full py-20 flex justify-center items-center">
      <loading-spinner
        color="#aaa"
        size="50px" />
    </div>
    <div
      v-else-if="events.length === 0"
      class="p-8 flex justify-center items-center">
      <p>No events found</p>
    </div>
    <template v-else>
      <div class="-mx-4 mt-8 sm:-mx-0">
        <table class="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                Title
              </th>
              <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">
                Start date
              </th>
              <th scope="col" class="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">
                Bookings
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="event in events"
              :key="event.id"
              :class="{'bg-red-50': eventStatus(event) === 'Rejected'}">
              <td class="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                <nuxt-link
                  :to="getEventUrl(event)"
                  class="flex items-center gap-1"
                  :class="[eventStatus(event) === 'Rejected' ? 'text-red-600 hover:text-red-900' : 'text-indigo-600 hover:text-indigo-900']">
                  <LinkIcon class="w-4 h-4" />
                  <span
                    v-tooltip="event.title">
                    {{ clampAndTrim(event.title) }}
                  </span>
                </nuxt-link>
                <dl class="font-normal sm:hidden">
                  <dt class="sr-only">
                    Bookings
                  </dt>
                  <dd class="mt-1 truncate text-gray-700">
                    <span class="mr-1">
                      Bookings
                    </span>
                    <span
                      class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset break-keep bg-blue-50 text-blue-700 ring-blue-600/20"
                      :class="{
                        'bg-gray-50 text-gray-700 ring-gray-600/20': !bookingCounts[event.id!] || bookingCounts[event.id!] === '0',
                        'bg-red-50 text-red-700 ring-red-600/10': bookingCounts[event.id!] === '' + event.max_spaces
                      }">
                      {{ spacesTally(event) }}
                    </span>
                  </dd>
                  <dt class="sr-only sm:hidden">
                    Start date
                  </dt>
                  <dd class="mt-1 truncate text-gray-500 sm:hidden">
                    {{ formatDate(event.start_date) }}
                  </dd>
                </dl>
              </td>
              <td class="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                {{ formatDate(event.start_date) }}
              </td>
              <td class="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                <template v-if="!event.is_recurring">
                  <span
                    class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset break-keep bg-blue-50 text-blue-700 ring-blue-600/20"
                    :class="{
                      'bg-gray-50 text-gray-700 ring-gray-600/20': !bookingCounts[event.id!] || bookingCounts[event.id!] === '0',
                      'bg-red-50 text-red-700 ring-red-600/10': bookingCounts[event.id!] === '' + event.max_spaces
                    }">
                    {{ spacesTally(event) }}
                  </span>
                </template>
                <template v-else />
              </td>
              <td class="px-3 py-4 text-sm text-gray-500">
                <span
                  class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset break-keep"
                  :class="{
                    'bg-green-50 text-green-700 ring-green-600/20': eventStatus(event) === 'Published',
                    'bg-blue-50 text-blue-700 ring-blue-700/20': eventStatus(event) === 'Draft',
                    'bg-red-50 text-red-700 ring-red-600/10': eventStatus(event) === 'Rejected',
                    'bg-orange-50 text-orange-700 ring-orange-600/10': eventStatus(event) === 'Awaiting Review'
                  }">
                  {{ eventStatus(event) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <simple-pagination
        v-if="totalCount > itemsPerPage"
        clas="mt-4"
        :items-per-page="itemsPerPage"
        :total-items="totalCount"
        :page="page"
        @next="onNext"
        @prev="onPrev" />
    </template>
  </div>
</template>

<style scoped lang="scss">

</style>
