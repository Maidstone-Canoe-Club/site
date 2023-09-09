<template>
  <div class="event-date-picker">
    <div
      v-if="eventType === 'single'"
      class="flex w-full">
      <div class="flex justify-center items-center gap-3 sm:gap-6 w-full flex-col sm:flex-row">
        <input-date
          id="start-date"
          v-model="eventItem.start_date"
          class="w-full sm:w-auto"
          label="Start date"
          enable-time-picker />
        <ArrowRightIcon class="w-6 h-6 text-gray-400 hidden sm:block" />
        <input-date
          id="end-date"
          v-model="eventItem.end_date"
          class="w-full sm:w-auto"
          enable-time-picker
          label="End date" />
      </div>
    </div>
    <div
      v-else-if="eventType === 'multi'"
      class="event-date-picker__multi">
      <div class="flex flex-col gap-3 mb-4">
        <div
          v-for="(day, index) in eventDates.multiple"
          :key="day.id"
          class="flex gap-2 items-center">
          <span>Day {{ index + 1 }}</span>
          <div class="flex gap-2 flex-grow">
            <input-date
              :id="'day-start-' + index"
              v-model="eventDates.multiple[index].start_date"
              class="flex-grow"
              placeholder="Start date"
              enable-time-picker />
            <input-date
              :id="'day-end-' + index"
              v-model="eventDates.multiple[index].end_date"
              class="flex-grow"
              placeholder="End date"
              enable-time-picker />
          </div>
          <button
            class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            @click="removeDay(index)">
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
      <button
        class="flex gap-1 justify-center items-center rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="addDay">
        <PlusIcon class="w-5 h-5" />
        Add day
      </button>
      <p>
        {{ errorMessage }}
      </p>
    </div>
    <div
      v-else-if="eventType === 'recurring'"
      class="event-date-picker__recurring">
      <div class="input-group">
        <input-date
          id="recurring-start"
          v-model="eventDates.recurring.startDate"
          enable-time-picker
          label="When does the event start?" />

        <input-dropdown
          id="recurring-type"
          v-model="eventDates.recurring.recurringType"
          label="How often does the event repeat?"
          :options="recurringTypes" />

        <div>
          <input-field
            id="recurring-occurrences"
            v-model="eventDates.recurring.maxOccurrences"
            type="number"
            label="How many times will the event repeat?" />
          <small>Leave blank to repeat indefinitely</small>
        </div>
      </div>
    </div>
    <event-wizard-footer
      :show-back-button="showBackButton"
      can-go-next
      @prev="onPrev"
      @next="onNext" />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, TrashIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";

const emits = defineEmits(["update:eventDates", "update:eventItem", "prev", "next"]);

const props = defineProps<{
  eventType: string,
  eventItem: any,
  eventDates: any,
  showBackButton: boolean
}>();

const recurringTypes = [
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "yearly", name: "Yearly" }
];

const eventItem = ref(props.eventItem);
const eventDates = ref(props.eventDates);

const errorMessage = ref(null);

watch(() => props.eventItem, (val) => {
  eventItem.value = val;
}, { deep: true });

watch(() => props.eventDates, (val) => {
  eventDates.value = val;
}, { deep: true });

watch(eventItem, (val) => {
  emits("update:eventItem", val);
}, { deep: true, immediate: true });

watch(eventDates, (val) => {
  emits("update:eventDates", val);
}, { deep: true, immediate: true });

function addDay () {
  eventDates.value.multiple.push(newDay());
}

function removeDay (index: number) {
  nextTick(() => {
    eventDates.value.multiple.splice(index, 1);
  });
}

function newDay () {
  return {
    id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    start_date: null,
    end_date: null
  };
}

function isValid () {
  errorMessage.value = null;
  if (props.eventType === "multi") {
    for (let i = 0; i < eventDates.value.multiple.length; i++) {
      const day = eventDates.value.multiple[i];
      console.log("checking ", day, !day.start_date, !day.end_date);
      if (!day.start_date || !day.end_date) {
        errorMessage.value = `Day ${i + 1} is missing a start or end date`;
        return false;
      }
    }
  }

  return true;
}

function onPrev () {
  emits("prev");
}

function onNext () {
  emits("next");
}

</script>

<style scoped lang="scss">

</style>
