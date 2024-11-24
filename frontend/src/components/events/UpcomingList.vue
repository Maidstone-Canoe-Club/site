<script setup lang="ts">
import { addYears } from "date-fns";
import {utcToZonedTime, format} from "date-fns-tz";
import { ExclamationTriangleIcon } from "@heroicons/vue/16/solid";
import type { EventItem } from "~/types";

const props = defineProps<{
  types?: string[],
  noItemsFoundMessage?: string,
  start?: Date,
  end?: Date,
  count?: number,
  dateFormatter?:(event: EventItem) => string,
  lazy?: boolean
  hideBadges?: boolean,
  displayCount?: number,
  eventFullLabel: string
}>();

const route = useRoute();
const directus = useDirectus();

const startDate = computed(() => props.start ?? new Date());
const endDate = computed(() => props.end ?? addYears(new Date(), 10));

const showAll = ref(false);

const {
  data: events,
  pending
} = await useAsyncData<EventItem[]>(`upcoming-events-${props.types?.join("-")}`, async () => {
  return await directus<EventItem[]>("/events", {
    method: "GET",
    query: {
      start: encodeURIComponent(startDate.value.toISOString()),
      end: encodeURIComponent(endDate.value.toISOString()),
      types: props.types,
      count: props.count
    }
  });
}, {
  server: !props.lazy,
  lazy: props.lazy || false
});

interface CourseEventItem extends EventItem {
  spacesLeft?: number
}

const filteredEvents = computed<CourseEventItem[]>(() => {
  if (events.value?.length) {
    let result = events.value
      .filter(e => !e.parent_event)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .map(e => ({
        ...e,
        spacesLeft: e.max_spaces ? e.max_spaces! - e.bookings! : undefined
      }));

    if (props.displayCount && !showAll.value) {
      result = result.slice(0, props.displayCount);
    }

    return result;
  }

  return [];
});

function formatDate (event: EventItem) {
  if (props.dateFormatter) {
    return props.dateFormatter(event);
  } else {
    const timeZone = "Europe/London";
    const dateStart = new Date(event.start_date);
    const dateEnd = new Date(event.end_date);
    const localStartTime = utcToZonedTime(dateStart, timeZone);
    const localEndTime = utcToZonedTime(dateEnd, timeZone);
    let result = format(localStartTime, "do MMMM yyyy, ", { timeZone });
    result += `${formatShortTime(localStartTime)} - ${formatShortTime(localEndTime)}`;
    return result;
  }
}

function getSessionCount (event: CourseEventItem) {
  return events.value?.filter(e => !e.is_recurring && (e.id === event.id || (e.parent_event && e.parent_event.id === event.id))).length ?? 0;
}

function getSessionCountLabel (event: CourseEventItem) {
  const count = getSessionCount(event);

  if (count <= 1) {
    return null;
  }

  return `${count} sessions`;
}

function getAgeLabel (event: CourseEventItem) {
  const adultsAllowed = event.allowed_roles?.includes("non-members") ||
    event.allowed_roles?.includes("members");
  const juniorsAllowed = event.allowed_roles?.includes("juniors");

  if (adultsAllowed && !juniorsAllowed) {
    return `Ages ${event.min_age || "18"}+`;
  }

  if (juniorsAllowed && !adultsAllowed) {
    if (event.min_age) {
      return `Ages ${event.min_age} - 17`;
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

  if (event.min_age) {
    return `Ages ${event.min_age}+`;
  }

  return "Adults only";
}

function getEventSessions (event: CourseEventItem) {
  return [
    event,
    ...events.value!.filter(e => e.parent_event && e.parent_event.id === event.id)
  ];
}

function getEventBorderColor (event: CourseEventItem) {
  switch (event.type) {
  case "club_paddle":
    return "border-blue-500";
  case "pool_session":
    return "border-cyan-500";
  case "paddles_trips_tours":
    return "border-orange-500";
  case "fun_session":
    return "border-violet-500";
  case "social_events":
    return "border-rose-500";
  case "beginners_course":
    return "border-green-500";
  case "race_training":
    return "border-yellow-500";
  case "race":
    return "border-lime-500";
  case "coaching":
    return "border-pink-500";
  case "meetings":
    return "border-red-500";
  default:
    return "border-gray-300";
  }
}

const showMoreLabel = computed(() => {
  if (!events.value || !props.displayCount) {
    return null;
  }

  if (events.value.length <= props.displayCount) {
    return null;
  }

  const count = events.value.length - props.displayCount;
  return `Show ${count} more`;
});

function onShowMore () {
  try {
    umTrackEvent("event-list-show-more", { page: route.fullPath });
  } catch {
    console.error("Error tracking show more click");
  }

  showAll.value = true;
}

function onViewClick (event: CourseEventItem) {
  try {
    umTrackEvent("view-event-from-list", { page: route.fullPath, event: event.id! });
  } catch {
    console.error("Error tracking view click");
  }
}

</script>

<template>
  <div>
    <div v-if="pending" class="flex py-12 justify-center items-center">
      <loading-spinner color="#6366F1" />
    </div>

    <template v-else-if="filteredEvents.length">
      <ol class="text-sm divide-y divide-gray-100">
        <li
          v-for="event in filteredEvents"
          :key="event.id"
          class="flex p-4 pr-6 group focus-within:bg-gray-50 hover:bg-gray-50">
          <div class="flex-auto">
            <div class="flex flex-row gap-2 items-center">
              <p
                class="font-semibold text-gray-900 border-l-4 pl-2"
                :class="getEventBorderColor(event)">
                {{ event.title }}
              </p>
            </div>

            <div
              v-if="!hideBadges"
              class="mt-2 flex items-center gap-2 flex-wrap text-sm leading-5 text-gray-500">
              <template v-if="getSessionCountLabel(event)">
                <span
                  class="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {{ getSessionCountLabel(event) }}
                </span>
                <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
                  <circle cx="1" cy="1" r="1" />
                </svg>
              </template>
              <span
                class="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {{ getAgeLabel(event) }}
              </span>
              <template v-if="event.spacesLeft !== undefined">
                <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
                  <circle cx="1" cy="1" r="1" />
                </svg>
                <span
                  :class="[
                    event.spacesLeft === 0 ? 'bg-red-50 text-red-700 ring-red-700/10' : '',
                    event.spacesLeft >= 1 && event.spacesLeft < 3 ? 'bg-yellow-50 text-yellow-700 ring-yellow-700/10' : '',
                    event.spacesLeft >= 3 ? 'bg-blue-50 text-blue-700 ring-blue-700/10' : ''
                  ]"
                  class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset">
                  <template v-if="event.spacesLeft === 0">
                    <ExclamationTriangleIcon class="size-3.5 mr-0.5" />
                    {{ eventFullLabel }}
                  </template>
                  <template v-else>
                    {{ event.spacesLeft }} {{ event.spacesLeft === 1 ? "space" : "spaces" }} left
                  </template>
                </span>
              </template>
            </div>

            <div class="flex flex-col items-start mt-1">
              <p
                v-for="(session, index) in getEventSessions(event)"
                :key="index"
                class="leading-6 text-gray-900">
                {{ formatDate(session) }}
              </p>
            </div>
          </div>
          <nuxt-link
            :to="getEventUrl(event)"
            class="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 group-hover:opacity-100 hover:ring-gray-400 focus:opacity-100"
            @click="() => onViewClick(event)">
            View<span class="sr-only">, {{ event.title }}</span>
          </nuxt-link>
        </li>
      </ol>

      <div
        v-if="displayCount && showMoreLabel && !showAll"
        class="flex justify-center mt-4">
        <a-button
          variant="outline"
          size="sm"
          @click="onShowMore">
          {{ showMoreLabel }}
        </a-button>
      </div>
    </template>

    <!--    <ul-->
    <!--      v-else-if="filteredEvents.length"-->
    <!--      role="list"-->
    <!--      class="divide-y divide-gray-200">-->
    <!--      <li v-for="event in filteredEvents" :key="event.id" class="flex items-start justify-between gap-x-6 py-5">-->
    <!--        <div class="min-w-0 space-y-1">-->
    <!--          <nuxt-link-->
    <!--            v-if="eventTitleLinks"-->
    <!--            :to="getEventUrl(event, event.start_date)"-->
    <!--            class="text-indigo-600 font-semibold hover:text-indigo-900 flex gap-1">-->
    <!--            <LinkIcon class="w-4 h-4 mt-1" />-->
    <!--            <span class="truncate">-->
    <!--              {{ event.title }}-->
    <!--            </span>-->
    <!--          </nuxt-link>-->
    <!--          <strong v-else>{{ event.title }}</strong>-->
    <!--          <div-->
    <!--            v-if="!hideBadges"-->
    <!--            class="mt-1 flex items-center gap-2 flex-wrap text-sm leading-5 text-gray-500">-->
    <!--            <template v-if="getSessionCountLabel(event)">-->
    <!--              <span-->
    <!--                class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">-->
    <!--                {{ getSessionCountLabel(event) }}-->
    <!--              </span>-->
    <!--              <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">-->
    <!--                <circle cx="1" cy="1" r="1" />-->
    <!--              </svg>-->
    <!--            </template>-->
    <!--            <span-->
    <!--              class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">-->
    <!--              {{ getAgeLabel(event) }}-->
    <!--            </span>-->
    <!--            <template v-if="event.spacesLeft">-->
    <!--              <svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">-->
    <!--                <circle cx="1" cy="1" r="1" />-->
    <!--              </svg>-->
    <!--              <span-->
    <!--                :class="[-->
    <!--                  event.spacesLeft === 0 ? 'bg-red-50 text-red-700 ring-red-700/10' : '',-->
    <!--                  event.spacesLeft >= 1 && event.spacesLeft < 3 ? 'bg-yellow-50 text-yellow-700 ring-yellow-700/10' : '',-->
    <!--                  event.spacesLeft >= 3 ? 'bg-blue-50 text-blue-700 ring-blue-700/10' : ''-->
    <!--                ]"-->
    <!--                class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset">-->
    <!--                <template v-if="event.spacesLeft === 0">-->
    <!--                  Course full-->
    <!--                </template>-->
    <!--                <template v-else>-->
    <!--                  {{ event.spacesLeft }} {{ event.spacesLeft === 1 ? "space" : "spaces" }} left-->
    <!--                </template>-->
    <!--              </span>-->
    <!--            </template>-->
    <!--          </div>-->

    <!--          <div class="flex flex-col items-start">-->
    <!--            <p-->
    <!--              v-if="!hideTitles"-->
    <!--              class="text-lg font-semibold">-->
    <!--              {{ event.title }}-->
    <!--            </p>-->
    <!--            <p-->
    <!--              v-for="(session, index) in getEventSessions(event)"-->
    <!--              :key="index"-->
    <!--              class="leading-6 text-gray-900">-->
    <!--              {{ formatDate(session) }}-->
    <!--            </p>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--        <div v-if="!eventTitleLinks" class="flex flex-none items-center gap-x-4">-->
    <!--          <a-button-->
    <!--            variant="primary"-->
    <!--            :to="getEventUrl(event)">-->
    <!--            View course-->
    <!--          </a-button>-->
    <!--        </div>-->
    <!--      </li>-->
    <!--    </ul>-->
    <alert-box
      v-else
      variant="info"
      class="mt-6 mx-4">
      <p>
        {{ noItemsFoundMessage ?? "There are no beginners courses available yet." }}
      </p>
      <p>
        Why not checkout the
        <nuxt-link
          to="/calendar"
          class="underline text-indigo-500">
          calendar
        </nuxt-link>
        to see what else is on?
      </p>
    </alert-box>
  </div>
</template>

<style scoped lang="scss">

</style>
