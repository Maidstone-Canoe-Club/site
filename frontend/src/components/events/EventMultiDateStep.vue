<template>
  <div>
    <div class="flex flex-col gap-3 mb-4">
      <div
        v-for="(day, index) in eventDates.multiple"
        :key="day.id"
        class="flex gap-2 items-center">
        <span>Day {{ index + 1 }}</span>
        <div class="flex gap-2 flex-grow">
          <input-date
            :id="'day-start-' + index"
            v-model="eventDates.multiple[index].startDate"
            class="flex-grow"
            placeholder="Start date"
            enable-time-picker />
          <input-date
            :id="'day-end-' + index"
            v-model="eventDates.multiple[index].endDate"
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
    <p v-if="errorMessage" class="mt-2 text-sm text-red-600">
      {{ errorMessage }}
    </p>
    <event-wizard-footer
      :show-back-button="showBackButton"
      can-go-next
      @prev="onPrev"
      @next="onNext" />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/outline";

const emits = defineEmits(["update:eventDates", "prev", "next"]);

const props = defineProps<{
  eventDates: any,
  showBackButton: boolean
}>();

const eventDates = ref(props.eventDates);
const errorMessage = ref(null);

watch(() => props.eventDates, (val) => {
  eventDates.value = val;
}, { deep: true });

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
    startDate: null,
    endDate: null
  };
}

function isValid () {
  errorMessage.value = null;
  for (let i = 0; i < eventDates.value.multiple.length; i++) {
    const day = eventDates.value.multiple[i];
    if (!day.startDate || !day.endDate) {
      errorMessage.value = `Day ${i + 1} is missing a start or end date`;
      return false;
    }
  }

  return true;
}

function onPrev () {
  emits("prev");
}

function onNext () {
  if (isValid()) {
    emits("next");
  }
}

</script>

<style scoped lang="scss">

</style>
