<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { addHours, formatISO } from "date-fns";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

defineProps<{
  hideLastOccurrence?: boolean
}>();

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

</script>

<template>
  <div class="space-y-6">
    <input-date
      id="start-date"
      v-model="event.startDate"
      label="When does the event start?"
      required
      enable-time-picker
      :max-date="event.endDate"
      :v="validator.startDate" />

    <input-date
      id="start-date"
      v-model="event.endDate"
      label="When does the event end?"
      required
      enable-time-picker
      :min-date="event.startDate"
      :v="validator.endDate" />

    <div v-if="!hideLastOccurrence">
      <hr>

      <p class="text-gray-700 mb-3 mt-5">
        Optional settings
      </p>
      <input-date
        id="last-booking-date"
        v-model="event.lastBookingDate"
        enable-time-picker
        label="Last booking date" />
      <small>The last date users will be allowed to book onto this event</small>
    </div>

    <div class="footer">
      <hr class="mb-6">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>
