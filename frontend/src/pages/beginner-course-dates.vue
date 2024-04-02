<script setup lang="ts">
import { addYears, format } from "date-fns";
import type { EventItem } from "~/types";

const directus = useDirectus();

const start = new Date();
const end = addYears(start, 10);

const { data: events } = await useAsyncData<EventItem[]>("beginners-courses", async () => {
  return await directus("/events", {
    method: "GET",
    query: {
      start: encodeURIComponent(start.toISOString()),
      end: encodeURIComponent(end.toISOString()),
      types: ["beginners_course"]
    }
  });
});

interface CourseEventItem extends EventItem {
  spacesLeft: number
}

const filteredEvents = computed<CourseEventItem[]>(() => {
  if (events.value?.length) {
    return events.value
      .filter(e => !e.parent_event)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .map(e => ({
        ...e,
        spacesLeft: e.max_spaces! - e.bookings!
      }));
  }

  return [];
});

function formatDate (event: EventItem) {
  let result = format(new Date(event.start_date), "do MMMM yyyy, h:mmaa");
  result += ` - ${format(new Date(event.end_date), "h:mmaa")}`;
  return result;
}

function getSessionCount (event: CourseEventItem) {
  return events.value?.filter(e => e.id === event.id || e.parent_event === event.id).length ?? 0;
}

function getAgeLabel (event: CourseEventItem) {
  const adultsAllowed = event.allowed_roles?.includes("non-members");
  const juniorsAllowed = event.allowed_roles?.includes("juniors");

  if (adultsAllowed && !juniorsAllowed) {
    return "Ages 18+";
  }

  if (juniorsAllowed && !adultsAllowed) {
    if (event.min_age) {
      return "Ages " + event.min_age + " - 17";
    }
    return "Under 18 only";
  }

  if (adultsAllowed && juniorsAllowed) {
    let result = "Adults and juniors";

    if (event.min_age) {
      result += ` (${event.min_age}+)`;
    }

    return result;
  }
}

function getEventSessions (event: CourseEventItem) {
  return [
    event,
    ...events.value!.filter(e => e.parent_event === event.id)
  ];
}

</script>

<template>
  <section class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Beginners Course dates
    </h1>
    <div class="space-y-4">
      <p>
        Online booking for our current courses can be
        <NuxtLink
          to="/calendar"
          class="underline text-indigo-500">
          found on our calendar
        </NuxtLink>
        .
        Courses run from April to September. We add new dates throughout the summer - to be notified when
        new dates are released, please follow us on
        <NuxtLink
          to="https://www.facebook.com/MaidstoneCanoeClub/"
          class="underline text-indigo-500">
          Facebook.
        </NuxtLink>
      </p>
      <p>
        If you're already a competent paddler and would like to join the Club, please
        <NuxtLink
          to="/come-paddle/memberships"
          class="underline text-indigo-500">
          see our membership options.
        </NuxtLink>
      </p>
    </div>

    <ul
      v-if="filteredEvents.length"
      role="list"
      class="divide-y divide-gray-200">
      <li v-for="event in filteredEvents" :key="event.id" class="flex items-start justify-between gap-x-6 py-5">
        <div class="min-w-0 space-y-1">
          <div class="mt-1 flex items-center gap-x-2 text-sm leading-5 text-gray-500">
            <span
              class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {{ getSessionCount(event) }} sessions
            </span>
            <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
              <circle cx="1" cy="1" r="1" />
            </svg>
            <span
              class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {{ getAgeLabel(event) }}
            </span>
            <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
              <circle cx="1" cy="1" r="1" />
            </svg>
            <span
              :class="[
                event.spacesLeft === 0 ? 'bg-red-50 text-red-700 ring-red-700/10' : '',
                event.spacesLeft >= 1 && event.spacesLeft < 3 ? 'bg-yellow-50 text-yellow-700 ring-yellow-700/10' : '',
                event.spacesLeft >= 3 ? 'bg-blue-50 text-blue-700 ring-blue-700/10' : ''
              ]"
              class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">
              <template v-if="event.spacesLeft === 0">
                Course full
              </template>
              <template v-else>
                {{ event.spacesLeft }} {{ event.spacesLeft === 1 ? "space" : "spaces" }} left
              </template>
            </span>
          </div>

          <div class="flex flex-col items-start">
            <p
              v-for="(session, index) in getEventSessions(event)"
              :key="index"
              class="font-semibold leading-6 text-gray-900">
              {{ formatDate(session) }}
            </p>
          </div>
        </div>
        <div class="flex flex-none items-center gap-x-4">
          <a-button
            variant="primary"
            :disabled="event.spacesLeft === 0"
            :to="event.spacesLeft > 0 ? getEventUrl(event) : undefined">
            {{ event.spacesLeft === 0 ? "Course full" : "Book now" }}
          </a-button>
        </div>
      </li>
    </ul>
    <alert-box
      v-else
      variant="info"
      class="mt-6">
      There are no beginners courses available yet.
    </alert-box>
  </section>
</template>

<style scoped lang="scss">

</style>
