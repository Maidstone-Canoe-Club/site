<template>
  <div>
    <h1>Placeholder calendar</h1>
    <desktop-calendar :events="events" />
  </div>
</template>

<script setup lang="ts">
import { useCalendarStore } from "~/store/calendarStore";

const calendarStore = useCalendarStore();

const events = ref([]);

const { getItems } = useDirectusItems();

const start = computed(() => new Date(calendarStore.year, calendarStore.month, 1));
const end = computed(() => new Date(calendarStore.year, calendarStore.getMonth + 1, 0));

watch(() => calendarStore.month, async () => {
  await fetchEvents();
});

await fetchEvents();

async function fetchEvents () {
  try {
    events.value = await getItems({
      collection: "events",
      params: {
        filter: {
          _and: [
            {
              start_date: { _lte: end.value }
            },
            {
              _or: [
                {
                  end_date: { _gt: start.value }
                },
                {
                  end_date: { _null: true }
                }
              ]
            }
          ]
        }
      }
    });
  } catch (e) {
    console.error("unable to fetch events", e);
  }
}

</script>

<style scoped lang="scss">

</style>
