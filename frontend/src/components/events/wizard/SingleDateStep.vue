<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { addHours, formatISO } from "date-fns";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const props = withDefaults(defineProps<{
  startDateLabel?: string
  endDateLabel?: string
  hideLastOccurrence?: boolean,
  changingInstance?: boolean,
  changingAll?: boolean,
  changingSingle?: boolean,
  editMode: boolean,
  bookingsCount?: number
}>(), {
  startDateLabel: "When does the event start?",
  endDateLabel: "When does the event end?",
  bookingsCount: 0
});

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  startDate: { required },
  endDate: {
    required,
    afterStart: helpers.withMessage("End date must be after the start date", (value: Date, siblings: EventWizardItem) => {
      return new Date(value) > new Date(siblings.startDate!);
    })
  }
};

const validator = useVuelidate<EventWizardItem>(rules, event);

watch(() => event.value.startDate, (val) => {
  event.value.rrule = undefined;

  if (!val) {
    return;
  }

  if (!event.value.endDate || event.value.endDate < val) {
    event.value.endDate = formatISO(addHours(new Date(val), 1));
  }
});

watch(() => event.value.endDate, (val) => {
  event.value.rrule = undefined;

  if (!val || !event.value.startDate) {
    return;
  }

  if (val < event.value.startDate) {
    validator.value.$touch();
  }
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
    <template v-if="editMode">
      <p>
        <i>
          Note: Editing event dates is temporarily disabled.
        </i>
      </p>

      <alert-box
        v-if="changingAll"
        variant="error"
        heading="Danger zone">
        <p>You are changing the start and end date of every instance of this event!</p>
        <p>This will effect past and present instances of this event.</p>
        <p>Any users who are booked onto upcoming events will receive an email saying the date of their booking has changed.</p>
        <p>Users may need to cancel their booking if the new date or time doesn't work for them.</p>
        <p>If you are not changing the date or time, you may proceed as normal and ignore this warning.</p>
      </alert-box>

      <alert-box
        v-if="hasBookings && changingInstance"
        heading="Changing the date or time?"
        variant="error">
        <p>If you are changing the date or time of this instance of this event, please read.</p>
        <p><strong>{{ bookingCountWarning }}</strong></p>
        <p>If you are not changing the date or time, you may proceed as normal and ignore this warning.</p>
      </alert-box>

      <alert-box
        v-if="hasBookings && changingSingle"
        heading="Changing the date or time?"
        variant="error">
        <p>If you are changing the date or time of this event, please read.</p>
        <p><strong>{{ bookingCountWarning }}</strong></p>
        <p>If you are not changing the date or time, you may proceed as normal and ignore this warning.</p>
      </alert-box>
    </template>

    <input-date
      id="start-date"
      v-model="event.startDate"
      :label="startDateLabel"
      :disabled="editMode"
      required
      enable-time-picker
      :max-date="event.endDate"
      :v="validator.startDate" />

    <input-date
      id="start-date"
      v-model="event.endDate"
      :label="endDateLabel"
      :disabled="editMode"
      required
      enable-time-picker
      :min-date="event.startDate"
      :v="validator.endDate" />

    <div class="space-y-6">
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

      <div
        v-if="!hideLastOccurrence">
        <input-date
          id="last-booking-date"
          v-model="event.lastBookingDate"
          enable-time-picker
          label="Last booking date" />
        <small>The last date users will be allowed to book onto this event</small>
      </div>
    </div>

    <div class="footer">
      <hr class="mb-6">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>
