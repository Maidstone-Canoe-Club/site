﻿<template>
  <div>
    <div
      v-if="loading"
      class="w-full py-20 flex justify-center items-center">
      <loading-spinner
        color="#aaa"
        size="50px" />
    </div>

    <div
      v-else
      class="overflow-x-auto">
      <template v-if="bookings && bookings.length">
        <table
          class="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" class="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                Event
              </th>
              <th scope="col" class="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900">
                Date
              </th>
              <th scope="col" class="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900">
                User
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="booking in bookings" :key="booking.id">
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 sm:pl-0">
                <nuxt-link
                  :to="getEventLink(booking)"
                  class="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                  <LinkIcon class="w-4 h-4" />
                  {{ booking.event.title }}
                </nuxt-link>
              </td>
              <td class="whitespace-nowrap py-3 pl-4 text-sm text-gray-900">
                {{ formatDate(booking.date) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                {{ booking.user?.first_name }} {{ booking.user?.last_name }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                <span
                  class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="{
                    'bg-green-50 text-green-700 ring-green-600/20': booking.status === 'booked',
                    'bg-blue-50 text-blue-700 ring-blue-700/20': booking.status === 'paid',
                    'bg-red-50 text-red-700 ring-red-600/10': booking.status === 'cancelled'
                  }">
                  {{ formatStatus(booking.status) }}
                </span>
              </td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                <a-button
                  v-if="canCancelBooking(booking)"
                  size="xs"
                  variant="outline"
                  :action="() => onCancelBooking(booking)">
                  Cancel booking
                </a-button>
                <!--                <button-->
                <!--                  v-if="canCancelBooking(booking)"-->
                <!--                  class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"-->
                <!--                  @click="onCancelBooking(booking)">-->
                <!--                  Cancel booking-->
                <!--                </button>-->
              </td>
            </tr>
          </tbody>
        </table>
        <dismiss-modal
          v-model:open="showCancelModal"
          title="Cancel booking"
          action-button-label="Cancel booking"
          cancel-button="Dismiss"
          variant="warning"
          :action="cancelBooking"
          @dismiss="dismissCancelBooking">
          Are you sure you want to cancel your booking?
        </dismiss-modal>
      </template>
      <div v-else>
        You haven't booked onto any events yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LinkIcon } from "@heroicons/vue/20/solid";
import { format } from "date-fns";
import type { EventBooking } from "~/types";

const showCancelModal = ref(false);

const directus = useDirectus();
const user = useDirectusUser();
const { getItems } = useDirectusItems();

const bookings = ref<EventBooking[] | null>(null);
const loading = ref(false);

function getDateOfBooking (booking: EventBooking) {
  if (!booking.event.is_recurring) {
    return new Date(booking.event.start_date);
  }

  return getDatesOfInstance(booking.event, booking.instance).start;
}

async function loadData (): Promise<EventBooking[] | null> {
  loading.value = true;
  let result: EventBooking[] | null = null;
  try {
    const bookings = await getItems<EventBooking>({
      collection: "event_bookings",
      params: {
        fields: [
          "*",
          "user.parent.id",
          "user.id",
          "user.first_name",
          "user.last_name",
          "event.id",
          "event.rrule",
          "event.is_recurring",
          "event.title",
          "event.start_date",
          "event.end_date"],
        sort: ["-date_created"],
        filter: {
          _or: [
            {
              user: {
                _eq: user.value!.id
              }
            },
            {
              user: {
                parent: {
                  id: {
                    _eq: user.value!.id
                  }
                }
              }
            }
          ]
        }
      }
    });

    result = bookings.map(b => ({
      ...b,
      date: getDateOfBooking(b)
    }));
  } finally {
    loading.value = false;
  }

  return result;
}

function formatDate (input: string) {
  return format(new Date(input), "do MMMM yyyy, h:mmaaa");
}

function formatStatus (input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function canCancelBooking (booking: EventBooking) {
  if (booking.status === "cancelled") {
    return false;
  }
  return new Date() < new Date(booking.event.start_date);
}

function getEventLink (booking: EventBooking) {
  let result = "/events/" + booking.event.id;

  if (booking.instance) {
    result += "?instance=" + booking.instance;
  }

  return result;
}

const eventToCancel = ref<string | null>();
const instanceToCancel = ref<number | null>();
const userToCancel = ref(null);

function onCancelBooking (booking: EventBooking) {
  eventToCancel.value = booking.event.id;
  instanceToCancel.value = booking.instance;
  userToCancel.value = booking.user.id;

  showCancelModal.value = true;
}

function dismissCancelBooking () {
  eventToCancel.value = null;
  instanceToCancel.value = null;
  userToCancel.value = null;
}

async function cancelBooking () {
  let url = "/events/booking/cancel?eventId=" + eventToCancel.value + "&userId=" + userToCancel.value;

  if (instanceToCancel.value) {
    url += "&instance=" + instanceToCancel.value;
  }

  await directus(url, {
    method: "POST"
  });

  bookings.value = await loadData();

  eventToCancel.value = null;
  instanceToCancel.value = null;
  userToCancel.value = null;
}

onMounted(async () => {
  bookings.value = await loadData();
});

</script>

<style scoped lang="scss">

</style>
