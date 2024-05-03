<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/24/outline";
import { nanoid } from "nanoid";
import { addHours } from "date-fns";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

export type EventMultiDate = {
  id?: string,
  startDate?: Date,
  endDate?: Date,
  index?: number
}

const props = withDefaults(defineProps<{
  editMode: boolean,
  bookingsCount?: number
}>(), {
  bookingsCount: 0
});

const event = defineModel<EventWizardItem>({ required: true });
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

const hasBookings = computed(() => props.bookingsCount > 0);

const bookingCountWarning = computed(() => {
  if (hasBookings.value) {
    const single = props.bookingsCount === 1;
    return `There ${single ? "is" : "are"} ${props.bookingsCount} ${single ? "booking" : "bookings"} listed for this event.
    If you change the date or time, the ${single ? "user" : "users"} will receive an email notifying them the date of their booking has changed.`;
  }

  return null;
});

</script>

<template>
  <div class="space-y-6">
    <alert-box
      v-if="editMode"
      variant="error"
      heading="Changing the date or time?">
      <p>If you are changing the date or time or removing one of the session dates below, please read.</p>
      <p><strong>{{ bookingCountWarning }}</strong></p>
      <p>If you are not changing any dates or times, you may proceed as normal and ignore this warning.</p>
    </alert-box>

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
              :disabled="eventDates.length === 1"
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
        class="mt-2"
        variant="outline"
        @click="addDate">
        Add date
      </a-button>
    </div>

    <alert-box
      v-if="editMode"
      heading="Temporarily disabled changing date/time">
      <p>Editing the date and time of an event is still under development, but it's nearly finished!</p>
      <strong class="block">
        If you need to change the date or time of an event, please contact the website
        admin via the
        <nuxt-link
          class="underline"
          to="/contact-us">
          contact us form.
        </nuxt-link>
      </strong>
    </alert-box>

    <div
      class="space-y-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-gray-300" />
        </div>
        <div class="relative flex justify-start">
          <span class="bg-gray-50 pr-2 text-md text-gray-500">Optional settings</span>
        </div>
      </div>

      <input-toggle
        v-model="event.allowBookingsAfterStart"
        label="Allow bookings after event has started" />

      <input-date
        id="last-booking-date"
        v-model="event.lastBookingDate"
        enable-time-picker
        label="Last booking date" />
      <small>The last date users will be allowed to book onto this event. By default users are able to book onto
        the event up until the first session start date.</small>
    </div>

    <div class="footer">
      <hr class="mb-6">
      <slot :is-valid="isValid" />
    </div>
  </div>
</template>

<style scoped>

</style>
