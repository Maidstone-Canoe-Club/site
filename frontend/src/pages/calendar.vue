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
import { useCalendarStore } from "~/store/calendarStore";
import type { EventException, EventItem } from "~/types";

const calendarStore = useCalendarStore();

const selectedFilters = ref<Record<string, boolean>>({});
const filters = ref<string[]>([]);
const events = ref<EventItem[]>([]);
const exceptions = ref<EventException[]>([]);
const loading = ref(false);

const filteredEvents = computed(() => events.value.filter(e => filters.value.length === 0 ? true : filters.value.includes(e.type)));

const directus = useDirectus();
const { getItems } = useDirectusItems();

const start = computed(() => new Date(calendarStore.year, calendarStore.month, 1));
const end = computed(() => new Date(calendarStore.year, calendarStore.getMonth + 1, 0, 23, 59, 59));

watch(() => calendarStore.month, async () => {
  selectedFilters.value = {};
  await fetchEvents();
});

await fetchEvents();

async function fetchEvents () {
  loading.value = true;
  try {
    events.value = [];
    events.value = await directus<EventItem[]>("/events", {
      method: "get",
      query: {
        start: encodeURIComponent(start.value.toISOString()),
        end: encodeURIComponent(end.value.toISOString()),
        bookings: true
      }
    });
  } catch (e) {
    console.error("unable to fetch events", e);
  } finally {
    loading.value = false;
  }
}

watch(selectedFilters, (val) => {
  filters.value = Object.keys(val).filter(key => val[key]);
}, { deep: true });

</script>

<style scoped lang="scss">

</style>
