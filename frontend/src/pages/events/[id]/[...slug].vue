<template>
  <div class="mt-10">
    <div class="lg:flex lg:items-center lg:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {{ event.title }}
        </h2>
        <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            {{ event.location }}
          </div>
          <div
            v-if="event.max_spaces"
            class="mt-2 flex items-center text-sm text-gray-500">
            <UsersIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            {{ event.max_spaces }} max spaces
          </div>
          <div
            v-if="event.price || event.junior_price"
            class="mt-2 flex items-center text-sm text-gray-500">
            <CurrencyPoundIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <template v-if="event.price">
              {{ formatPrice(event.price) }} per adult
            </template>
            <template v-if="event.price && event.junior_price">
              &ndash;
            </template>
            <template v-if="event.junior_price">
              {{ formatPrice(event.junior_price) }} per junior
            </template>
          </div>
        </div>
      </div>
      <div
        v-if="canEdit"
        class="mt-5 flex lg:ml-4 lg:mt-0">
        <span class="sm:ml-3">
          <a
            :href="editLink"
            target="_blank"
            type="button"
            class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <PencilIcon class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Edit
          </a>
        </span>
      </div>
    </div>

    <div class="mt-5">
      <div class="grid md:grid-cols-12 gap-10">
        <div class="md:col-span-8 mt-5">
          <div
            v-if="event.description"
            v-html="event.description" />
        </div>
        <div class="md:col-span-4">
          <div>
            <strong>Dates</strong>

            <div
              v-for="(date, index) in sessionDates"
              :key="index">
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                {{ renderSessionDate(date) }}
              </div>
            </div>
          </div>

          <div class="mb-5 mt-5">
            <event-booker
              v-if="canBook"
              :event="event"
              :juniors-can-book="false"
              :price="event.price"
              :user-id="user?.id"
              :junior-price="event.junior_price"
              :instance="instance"
              :pattern-type="eventInfo.patternType"
              :already-booked="alreadyBooked"
              :start-date="event.start_date"
              @refresh="onRefresh" />
            <div
              v-else
              class="rounded-md bg-blue-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <InformationCircleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div class="ml-3 flex-1 md:flex md:justify-between">
                  <p class="text-sm text-blue-700">
                    Bookings are now closed for this event
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="spacesLeftLabel && canBook"
            class="flex items-center justify-center">
            {{ spacesLeftLabel }}
          </div>
          <ul
            v-if="bookings"
            role="list"
            class="divide-y divide-gray-100">
            <li v-for="booking in bookings" :key="booking.email" class="flex items-center justify-between gap-x-6 py-5">
              <div class="flex min-w-0 gap-x-4 items-center">
                <img
                  v-if="booking.user.avatar"
                  class="h-12 w-12 flex-none rounded-full bg-gray-50"
                  :src="getAvatarUrl(booking.user)"
                  alt="">
                <UserCircleIcon
                  v-else
                  class="h-12 w-12 text-gray-300"
                  aria-hidden="true" />
                <div class="min-w-0 flex-auto">
                  <span class="flex gap-3 items-center">
                    <p class="text-sm font-semibold leading-6 text-gray-900">
                      {{ booking.user.first_name }} {{ booking.user.last_name }}
                    </p>
                    <role-badge :user="booking.user" />
                  </span>
                  <p
                    v-if="booking.user.email"
                    class="mt-1 truncate text-xs leading-5 text-gray-500">
                    {{ booking.user.email }}
                  </p>
                </div>
              </div>
              <!--              <a href="#" class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">View</a>-->
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CalendarIcon,
  CurrencyPoundIcon,
  MapPinIcon,
  PencilIcon,
  UsersIcon,
  InformationCircleIcon
} from "@heroicons/vue/20/solid";
import { UserCircleIcon } from "@heroicons/vue/24/outline";
// @ts-ignore
import Dinero from "dinero.js";
import { format, isSameDay } from "date-fns";
import { getDateFromInstance } from "~/utils/events";

const { getItemById, getItems } = useDirectusItems();
const directus = useDirectus();
const route = useRoute();
const user = useDirectusUser();

const instance = parseInt(route.query.instance, 10);

const childEvents = ref();
const recurringPattern = ref();

const { data: event } = await useAsyncData(`event-item-${route.params.id}`, async () => {
  return await getItemById({
    collection: "events",
    id: route.params.id
  });
});

if (!event.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Event not found"
  });
}

useHead({ title: event.value.title });

const { data: eventInfo } = await useAsyncData(`event-info-${event.value.id}`, async () => {
  return await loadInfo();
});

const alreadyBooked = computed(() => eventInfo.value.alreadyBooked);
const bookings = computed(() => eventInfo.value.bookings);

async function loadInfo () {
  let url = `/events/info?eventId=${event.value.id}`;
  if (instance) {
    url += "&instance=" + instance;
  }
  return await directus(url);
}

if (event.value.has_multiple) {
  const { data: events } = await useAsyncData("event-item" + event.value.id + "-children", async () => {
    return await getItems({
      collection: "events",
      params: {
        filter: {
          parent_event: {
            _eq: event.value.id
          }
        }
      }
    });
  });

  childEvents.value = events.value;
}

if (event.value?.is_recurring) {
  const { data: pattern } = await useAsyncData("recurring-pattern-" + event.value.id, async () => {
    return await getItems({
      collection: "recurring_event_patterns",
      params: {
        filter: {
          event: {
            _eq: event.value.id
          }
        }
      }
    });
  });

  recurringPattern.value = pattern.value.length ? pattern.value[0] : null;
}

const sessionDates = computed(() => {
  let result = null;

  if (!event.value.has_multiple && !event.value.is_recurring) {
    result = [];
    result.push({
      start: event.value.start_date,
      end: event.value.end_date
    });
  }

  if (event.value?.has_multiple && childEvents.value?.length) {
    result = [];
    result.push({
      start: event.value.start_date,
      end: event.value.end_date
    });

    childEvents.value.forEach((e) => {
      result.push({
        start: e.start_date,
        end: e.end_date
      });
    });
  }

  if (event.value.is_recurring) {
    result = [];
    const type = recurringPattern.value.type;

    result.push({
      start: getDateFromInstance(event.value.start_date, instance, type),
      end: getDateFromInstance(event.value.end_date, instance, type)
    });
  }

  return result;
});

const canBook = computed(() => {
  if (sessionDates.value && sessionDates.value.length) {
    const firstDate = sessionDates.value[0].start;
    return new Date() < new Date(firstDate);
  }
  return false;
});

function formatPrice (amount?: number) {
  if (!amount) {
    return null;
  }
  return `£${Dinero({ amount, currency: "GBP" }).toFormat(amount % 100 === 0 ? "0" : "0.00")}`;
}

const directusUrl = useDirectusUrl();
const editLink = computed(() => `${directusUrl}/admin/content/events/${route.params.id}`);

// const canEdit = computed(() => hasRole(user.value, "Committee"));
const canEdit = computed(() => false);

function renderSessionDate (date) {
  if (isSameDay(new Date(date.start), new Date(date.end))) {
    return formatDate(date.start) + " - " + format(new Date(date.end), "h:mmaa");
  }
  return formatDate(date.start) + " - " + formatDate(date.end);
}

function formatDate (date: string) {
  return format(new Date(date), "do MMM, h:mmaa");
}

async function onRefresh () {
  eventInfo.value = await loadInfo();
}

const spacesLeftLabel = computed(() => {
  let result = null;

  if (eventInfo.value.spacesLeft) {
    if (eventInfo.value.spacesLeft === 0) {
      result = "There are no spaces left";
    } else if (eventInfo.value.spacesLeft === 1) {
      result = "There is one space left!";
    } else {
      result = `There are ${eventInfo.value.spacesLeft} spaces left`;
    }
  }

  return result;
});

</script>

<style scoped lang="scss">

</style>
