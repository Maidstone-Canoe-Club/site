<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/24/outline";
import { nanoid } from "nanoid";
import { addHours, formatISO } from "date-fns";

export type EventMultiDate = {
  id?: string,
  startDate?: Date,
  endDate?: Date,
}

const eventDates = defineModel<EventMultiDate[]>("eventDates", { required: true });
const errorMessages = reactive<(string | null)[]>([]);

function addDate () {
  eventDates.value.push({
    id: nanoid(),
    startDate: undefined,
    endDate: undefined
  });
}

function removeDate (index: number) {
  eventDates.value.splice(index, 1);
}

function onStartChange (value: Date | null, index: number) {
  if (!value) {
    return;
  }

  const endDate = eventDates.value[index].endDate;
  if (!endDate || endDate < value) {
    eventDates.value[index].endDate = addHours(new Date(value), 1);
  }
}

const isValid = computed(() => {
  for (let i = 0; i < eventDates.value.length; i++) {
    errorMessages[i] = null;
    const day = eventDates.value[i];
    if (!day.startDate) {
      errorMessages[i] = "Missing a start date";
      return false;
    }

    if (!day.endDate) {
      errorMessages[i] = "Missing a end date";
      return false;
    }

    if (day.startDate > day.endDate) {
      errorMessages[i] = "The start date cannot be after the end date";
      return false;
    }
  }

  return true;
});

</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-5">
      <div
        v-for="(date, index) in eventDates"
        :key="date.id"
        class="flex flex-wrap flex-grow">
        <span class="w-full text-gray-700">Date {{ index + 1 }}</span>
        <div class="flex flex-grow w-full">
          <div class="flex gap-3 flex-grow flex-col sm:flex-row">
            <input-date
              id="start-date"
              v-model="date.startDate"
              class="flex-grow"
              label="Start date"
              enable-time-picker
              :is-valid="!errorMessages[index]"
              @change="(val) => onStartChange(val, index)" />
            <input-date
              id="start-date"
              v-model="date.endDate"
              class="flex-grow"
              label="End date"
              enable-time-picker
              :is-valid="!errorMessages[index]" />
          </div>
          <div class="flex justify-end flex-col ml-3">
            <a-button
              v-tooltip="'Remove date'"
              variant="danger"
              class="mb-[1px]"
              @click="removeDate(index)">
              <span class="sr-only">Remove day</span>
              <TrashIcon class="w-5 h-5" />
            </a-button>
          </div>
        </div>
        <p
          v-if="errorMessages[index]"
          class="text-sm text-red-600 mt-2">
          {{ errorMessages[index] }}
        </p>
        <div
          v-if="index < eventDates.length - 1"
          class="relative w-full mt-7">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-300" />
          </div>
        </div>
      </div>
      <a-button
        class="mt-3"
        variant="outline"
        @click="addDate">
        Add date
      </a-button>
    </div>
    <div class="footer">
      <slot :is-valid="isValid" />
    </div>
  </div>
</template>

<style scoped>

</style>
