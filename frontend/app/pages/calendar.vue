<template>
  <div>
    <event-filter
      :events="events"
      :exceptions="exceptions"
      :selected="selectedFilters" />
    <calendar-controls />
    <month-calendar
      class="mt-5"
      :events="filteredEvents"
      :exceptions="exceptions"
      :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { zonedTimeToUtc } from "date-fns-tz";
import { useCalendarStore } from "~/store/calendarStore";
import type { EventException, EventItem } from "~/types";

useHead({
  title: "Calendar"
});

const calendarStore = useCalendarStore();

const selectedFilters = ref<Record<string, boolean>>({});
const filters = ref<string[]>([]);
const exceptions = ref<EventException[]>([]);

const directus = useDirectus();

// The first fetch happens during SSR, so pin the month boundaries to UK time rather than the server's time zone
const timeZone = "Europe/London";
const start = computed(() => zonedTimeToUtc(new Date(calendarStore.year, calendarStore.month, 1), timeZone));
const end = computed(() => zonedTimeToUtc(new Date(calendarStore.year, calendarStore.month + 1, 0, 23, 59, 59), timeZone));

// useAsyncData hands the server-rendered result to the client instead of fetching it again on hydration
const { data, status, error } = await useAsyncData("calendar-events", () => directus<EventItem[]>("/events", {
  method: "get",
  query: {
    start: encodeURIComponent(start.value.toISOString()),
    end: encodeURIComponent(end.value.toISOString()),
    bookings: true
  }
}), {
  watch: [start]
});

const events = computed(() => data.value ?? []);
const loading = computed(() => status.value === "pending");

const filteredEvents = computed(() => events.value.filter(e => filters.value.length === 0 ? true : filters.value.includes(e.type)));

watch(error, (e) => {
  if (e) {
    console.error("unable to fetch events", e);
  }
}, { immediate: true });

watch(() => calendarStore.month, () => {
  selectedFilters.value = {};
});

watch(selectedFilters, (val) => {
  filters.value = Object.keys(val).filter(key => val[key]);
}, { deep: true });

</script>

<style scoped lang="scss">

</style>
