<script setup lang="ts">

import type { EventItem } from "~/types";

const props = defineProps<{
  event: EventItem
}>();

type EventType = {
  value: string,
  label: string,
  class: string
}

const types = computed<EventType[]>(() =>
  [
    { value: "pool_session", label: "Pool Session", class: "bg-cyan-50 text-cyan-600 ring-cyan-500/20" },
    { value: "club_paddle", label: "Club Paddle", class: "bg-blue-50 text-blue-600 ring-cyan-500/20" },
    {
      value: "paddles_trips_tours",
      label: "Paddles Trips Tours",
      class: "bg-orange-50 text-orange-600 ring-orange-500/20"
    },
    { value: "social_events", label: "Social Events", class: "bg-rose-50 text-rose-600 ring-rose-500/20" },
    { value: "fun_session", label: "Fun Session", class: "bg-violet-50 text-violet-600 ring-violet-500/20" },
    { value: "race_training", label: "Race Training", class: "bg-yellow-50 text-yellow-600 ring-yellow-500/20" },
    { value: "race", label: "Race", class: "bg-lime-50 text-lime-600 ring-lime-500/20" },
    { value: "coaching", label: "Coaching", class: "bg-pink-50 text-pink-600 ring-pink-500/20" },
    { value: "beginners_course", label: "Beginners Course", class: "bg-green-50 text-green-600 ring-green-500/20" },
    { value: "meetings", label: "Meetings", class: "bg-red-50 text-red-600 ring-red-500/20" }
  ]);

const type = computed(() => types.value.find(t => t.value === props.event.type));

</script>

<template>
  <span
    v-if="type"
    class="inline-flex items-center rounded-full px-2 py-1 text-sm font-medium ring-1 ring-inset"
    :class="type.class">
    {{ type.label }}
  </span>
</template>

<style scoped lang="scss">

</style>
