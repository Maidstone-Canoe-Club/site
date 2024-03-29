﻿<template>
  <article class="mt-10 text-pretty">
    <div class="lg:flex lg:items-center lg:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {{ event!.title }}
        </h2>

        <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6" />
      </div>
      <div
        v-if="canEdit"
        class="mt-5 flex lg:ml-4 lg:mt-0">
        <span class="sm:ml-3">
          <a-button
            variant="outline"
            :to="editLink">
            <PencilIcon class="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Edit
          </a-button>
        </span>
      </div>
    </div>

    <div class="mt-5">
      <div class="grid md:grid-cols-12 gap-10">
        <div
          ref="contentColumn"
          class="md:col-span-8 min-w-0"
          :class="{'mb-5': !!eventImage}">
          <img
            v-if="eventImage"
            alt="Event image"
            class="rounded-lg mb-5"
            :src="eventImage">

          <rich-text
            v-if="event.description"
            :content="event.description" />
        </div>
        <div class="md:col-span-4 space-y-6">
          <div
            v-if="event.status === 'draft'"
            class="rounded-md bg-yellow-50 p-4 border border-yellow-400">
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">
                  Event hidden
                </h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p class="mb-2">
                    Only you can see this event as it has been hidden automatically.
                  </p>
                  <p>Events with a price need to be approved before being made public.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <strong>Details</strong>
            <div
              v-if="event.location"
              class="mt-2 flex items-center text-sm text-gray-500">
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
              v-for="(date, index) in sessionDates"
              :key="index">
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                {{ renderSessionDate(date) }}
              </div>
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

            <div
              v-if="formattedAllowedRoles"
              class="mt-2 flex items-center text-sm text-gray-500">
              <UserGroupIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <span>
                {{ formattedAllowedRoles }}
              </span>
            </div>

            <div
              v-if="event.last_booking_date"
              class="mt-5 flex items-center text-sm text-gray-700">
              <ExclamationTriangleIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-orange-400" aria-hidden="true" />
              <span>
                <strong>Bookings cut-off: {{ formatDate(event.last_booking_date) }}</strong>
              </span>
            </div>
          </div>

          <div v-if="leaders && leaders.length">
            <strong>Leaders</strong>
            <ul
              class="mt-2 flex flex-col gap-2">
              <li
                v-for="leader in leaders"
                :key="leader.id">
                <div class="flex items-center gap-2">
                  <user-avatar
                    :user="leader.directus_users_id"
                    size-class="w-12 h-12" />
                  <span class="truncate">
                    {{ leader.directus_users_id.first_name }} {{ leader.directus_users_id.last_name }}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div
            v-if="bookings.length && userIsLeader"
            class="flex flex-col gap-2">
            <a-button
              variant="outline"
              @click="onMessageAttendees">
              <EnvelopeIcon class="size-5" />
              Message attendees
            </a-button>

            <a-button
              variant="outline"
              @click="onDownloadAttendeeDetails">
              <ArrowDownOnSquareStackIcon class="size-5" />
              Download attendee details
            </a-button>
          </div>

          <div class="mb-5">
            <event-booker
              v-if="canBook"
              :event="event"
              :price="event.price"
              :user-id="user?.id"
              :junior-price="event.junior_price"
              :instance="instance"
              :pattern-type="eventInfo.patternType"
              :already-booked="alreadyBooked"
              :has-required-booking="eventInfo.hasRequiredBooking"
              :other-booking-required="eventInfo.otherBookingRequired"
              :required-event-title="eventInfo.requiredEventTitle"
              :bookings="bookings"
              :spaces-left="eventInfo.spacesLeft"
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
          <event-attendees
            :bookings="bookings"
            :event-id="event.id"
            :instance="instance"
            :user-is-leader="userIsLeader"
            :attendees-count="eventInfo.bookingsCount"
            @refresh="onRefresh" />
        </div>
      </div>
    </div>

    <message-attendees-modal
      v-if="userIsLeader"
      :open="messageAttendeesModalOpen"
      :attendee-count="bookings.length"
      :event-id="event.id"
      :instance="instance"
      @dismiss="messageAttendeesModalOpen = false" />

    <attendee-download-modal
      :open="attendeeDownloadModalOpen"
      :event-title="event.title"
      :event-id="event.id"
      :instance="instance"
      @dismiss="attendeeDownloadModalOpen = false" />
  </article>
</template>

<script setup lang="ts">
import {
  CalendarIcon,
  CurrencyPoundIcon,
  MapPinIcon,
  PencilIcon,
  UsersIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  ArrowDownOnSquareStackIcon
} from "@heroicons/vue/16/solid";
// @ts-ignore
import Dinero from "dinero.js";
import { format, isSameDay } from "date-fns";
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import type { Ref } from "vue";
import { getDateFromInstance } from "~/utils/events";
import type { EventItem } from "~/types";

const { getItemById, getItems } = useDirectusItems();
const directus = useDirectus();
const route = useRoute();
const user : Ref<DirectusUser> = useDirectusUser();

const instance = route.query.instance ? parseInt(route.query.instance as string, 10) : null;

const childEvents = ref();
const recurringPattern = ref();

const messageAttendeesModalOpen = ref(false);
const attendeeDownloadModalOpen = ref(false);

const { data: event } = await useAsyncData<EventItem>(`event-item-${route.params.id}`, async () => {
  return await getItemById<EventItem>({
    collection: "events",
    id: route.params.id as string
  });
});

if (!event.value) {
  throw showError({
    statusCode: 404,
    statusMessage: "Event not found"
  });
}

const slug = slugify(event.value.title);

const formattedAllowedRoles = computed(() => {
  if (!event.value) {
    return null;
  }

  const roles = event.value.allowed_roles;

  if (!roles || !roles.length) {
    return null;
  }

  if (roles.includes("none")) {
    return null;
  }

  const camelCase = (input: string) => {
    return input.charAt(0).toUpperCase() + input.substring(1);
  };

  const joinOrAnd = (input: string[]) => {
    if (input.length === 2) {
      return input[0] + " & " + input[1];
    }

    if (input.length === 1) {
      return input[0];
    }

    return input.slice(0, -1).join(", ") + " & " + input[input.length - 1];
  };

  if (roles.includes("non-members")) {
    return camelCase(joinOrAnd(roles));
  }

  return camelCase(joinOrAnd(roles) + " only");
});

if (!route.params.slug && slug) {
  let redirect = route.path;
  if (!redirect.endsWith("/")) {
    redirect += "/";
  }

  redirect += slug;

  if (instance) {
    redirect += `?instance=${instance}`;
  }
  await navigateTo(redirect, {
    replace: true,
    redirectCode: 301
  });
} else if (route.params.slug && route.params.slug[0] !== slug) {
  throw showError({
    statusCode: 404,
    statusMessage: "News post not found"
  });
}

useHead({ title: event.value.title });

const { data: eventInfo } = await useAsyncData(`event-info-${event.value.id}`, async () => {
  return await loadInfo();
});

const alreadyBooked = computed(() => eventInfo.value?.alreadyBooked ?? false);
const bookings = computed(() => eventInfo.value?.bookings ?? []);
const leaders = computed(() => eventInfo.value?.leaders ?? []);

const userIsLeader = computed(() => {
  if (leaders.value && leaders.value.length && user.value) {
    return !!leaders.value.find(x => x.directus_users_id.id === user.value.id);
  }

  return false;
});

async function loadInfo () {
  let url = `/events/info?eventId=${event.value.id}`;
  if (instance) {
    url += "&instance=" + instance;
  }
  return await directus(url, {
    headers: {
      "Cache-Control": "no-cache"
    }
  });
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
  const lastBookingDate = event.value?.last_booking_date;
  if (lastBookingDate && new Date(lastBookingDate) < new Date()) {
    return false;
  }

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
const editLink = computed(() => {
  let result = `/events/${route.params.id}/${route.params.slug}/edit`;

  if (route.query.instance) {
    result += `?instance=${route.query.instance}`;
  }

  return result;
});

const canEdit = computed(() => (user.value && event.value.user_created === user.value.id) || hasRole(user.value, "Coach"));

const contentColumn = ref(null);
const imageWidth = ref(null);

onMounted(() => {
  imageWidth.value = contentColumn.value.clientWidth;
});

const eventImage = computed(() => {
  if (event.value.image) {
    const directusUrl = useDirectusUrl();
    let url = `${directusUrl}/assets/${event.value.image}?format=webp&height=450`;

    if (imageWidth.value) {
      url += "&width=" + imageWidth.value;
    }

    return url;
  }
  return null;
});

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
  console.log("refreshing");
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

function onMessageAttendees () {
  messageAttendeesModalOpen.value = true;
}

function onDownloadAttendeeDetails () {
  attendeeDownloadModalOpen.value = true;
}

</script>

<style scoped lang="scss">

</style>
