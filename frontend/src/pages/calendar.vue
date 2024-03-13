<template>
  <div>
    <event-filter
      :events="events"
      @change="onFilterChange" />
    <calendar-controls />
    <month-calendar
      class="mt-5"
      :events="filteredEvents"
      :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { useCalendarStore } from "~/store/calendarStore";
import type { EventItem } from "~/types";

const calendarStore = useCalendarStore();

const filters = ref<string[]>([]);
const events = ref<EventItem[]>([]);
const loading = ref(false);

const filteredEvents = computed(() => events.value.filter(e => filters.value.length === 0 ? true : filters.value.includes(e.type)));

const directus = useDirectus();

const start = computed(() => new Date(calendarStore.year, calendarStore.month, 1));
const end = computed(() => new Date(calendarStore.year, calendarStore.getMonth + 1, 0, 23, 59, 59));

watch(() => calendarStore.month, async () => {
  await fetchEvents();
});

await fetchEvents();

async function fetchEvents () {
  loading.value = true;
  try {
    events.value = await directus<EventItem[]>("/events", {
      method: "get",
      query: {
        start: encodeURIComponent(start.value.toISOString()),
        end: encodeURIComponent(end.value.toISOString())
      }
    });
  } catch (e) {
    console.error("unable to fetch events", e);
  } finally {
    loading.value = false;
  }
}

function onFilterChange (val: Record<string, boolean>) {
  filters.value = Object.keys(val).filter(key => val[key]);
}

</script>

<style scoped lang="scss">

</style>
