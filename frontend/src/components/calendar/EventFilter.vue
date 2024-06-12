<script setup lang="ts">
import { useCalendarStore } from "~/store/calendarStore";
import type { EventException, EventItem } from "~/types";

const calendarStore = useCalendarStore();
const start = computed(() => new Date(calendarStore.year, calendarStore.month, 1));
const end = computed(() => new Date(calendarStore.year, calendarStore.getMonth + 1, 0, 23, 59, 59));

const props = defineProps<{
  events: EventItem[],
  exceptions: EventException[]
}>();

type FilterOption = {
  value: string,
  label: string,
  class: string
}

type Filter = {
  id: string,
  name: string,
  options: FilterOption[]
}

const filters = computed<Filter[]>(() => [
  {
    id: "type",
    name: "Event type",
    options: [
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
    ]
  }
]);

const selected = defineModel<Record<string, boolean>>("selected", {
  default: {}
});

function isSelected (id: string) {
  const hasSelection = !!Object.keys(selected.value).filter(key => selected.value[key]).length;
  if (hasSelection) {
    return selected.value[id];
  }
  return true;
}

function getCount (type: string) {
  return props.events.filter((e) => {
    if (e.type === type) {
      return new Date(e.start_date) < end.value && (e.end_date === undefined || new Date(e.end_date) > start.value);
    }
    return false;
  }).length;
}

function sortFilterOptions (options: FilterOption[]) {
  return [...options].sort((a, b) => {
    const countA = getCount(a.value);
    const countB = getCount(b.value);

    // Prioritize options with a count greater than 0
    if ((countA > 0) !== (countB > 0)) {
      return countA > 0 ? -1 : 1;
    }

    // When both counts are greater than 0 or both are not,
    // sort alphabetically
    return a.label.localeCompare(b.label);
  });
}

</script>

<template>
  <div class="mt-6">
    <strong class="mb-2 block text-sm">Filter by type</strong>
    <div
      v-for="filter in filters"
      :key="filter.id"
      class="flex gap-2 flex-wrap max-w-[600px]">
      <div
        v-for="(option, optionIdx) in sortFilterOptions(filter.options)"
        :key="option.value">
        <span
          class="inline-flex items-center rounded-full px-2 py-1 text-sm font-medium ring-1 ring-inset"
          :class="[isSelected(option.value) ? option.class : 'bg-gray-50 text-gray-600 ring-gray-600/10', getCount(option.value) === 0 ? 'opacity-60': null]">
          <input
            :id="`${filter.id}-${optionIdx}`"
            v-model="selected[option.value]"
            :value="option.value"
            :disabled="getCount(option.value) === 0"
            :name="`${filter.id}[]`"
            class="hidden"
            type="checkbox">
          <label
            :for="`${filter.id}-${optionIdx}`"
            :class="{'cursor-pointer': getCount(option.value) > 0}">
            {{ option.label }} ({{ getCount(option.value) }})
          </label>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
