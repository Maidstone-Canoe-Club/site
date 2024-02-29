<script setup lang="ts">
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/vue/20/solid";
import { format } from "date-fns";
import type { EventItem } from "~/types";

const props = defineProps<{
  events: EventItem[]
}>();

const {
  month,
  year,
  generateDays,
  incrementMonth,
  decrementMonth
} = useCalendar();

const days = ref(processDays());

watch([month, () => props.events], () => {
  days.value = processDays();
});

const monthLabel = computed(() => {
  return format(new Date(year.value, month.value, 1), "MMMM yyyy");
});

function processDays () {
  return generateDays(props.events)
    .map(d => ({
      ...d,
      isSelected: d.events.length
    }));
}

</script>

<template>
  <div class="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
    <div class="flex items-center text-gray-900">
      <button
        type="button"
        class="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        @click="() => decrementMonth(1)">
        <span class="sr-only">Previous month</span>
        <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
      </button>
      <div class="flex-auto text-sm font-semibold">
        {{ monthLabel }}
      </div>
      <button
        type="button"
        class="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        @click="() => incrementMonth(1)">
        <span class="sr-only">Next month</span>
        <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    <div class="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
      <div>M</div>
      <div>T</div>
      <div>W</div>
      <div>T</div>
      <div>F</div>
      <div>S</div>
      <div>S</div>
    </div>
    <div class="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
      <button
        v-for="(day, dayIdx) in days"
        :key="day.date"
        type="button"
        :class="['py-1.5 hover:bg-gray-100 focus:z-10', day.isCurrentMonth ? 'bg-white' : 'bg-gray-50', (day.isSelected || day.isToday) && 'font-semibold', day.isSelected && 'text-white', !day.isSelected && day.isCurrentMonth && !day.isToday && 'text-gray-900', !day.isSelected && !day.isCurrentMonth && !day.isToday && 'text-gray-400', day.isToday && !day.isSelected && 'text-indigo-600', dayIdx === 0 && 'rounded-tl-lg', dayIdx === 6 && 'rounded-tr-lg', dayIdx === days.length - 7 && 'rounded-bl-lg', dayIdx === days.length - 1 && 'rounded-br-lg']">
        <time
          :datetime="day.date"
          :class="['mx-auto flex h-7 w-7 items-center justify-center rounded-full', day.isSelected && day.isToday && 'bg-indigo-600', day.isSelected && !day.isToday && 'bg-gray-900']">
          {{ day.date.split('-').pop()!.replace(/^0/, '') }}
        </time>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
