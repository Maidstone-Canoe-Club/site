<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { addHours, formatISO } from "date-fns";
import type { EventWizardItem } from "~/components/newevents/wizard/NewEventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  startDate: { required },
  endDate: {
    required,
    afterStart: helpers.withMessage("End date must be after the start date", (value: Date, siblings: EventWizardItem) => {
      return new Date(value) > new Date(siblings.startDate);
    })
  }
};

const validator = useVuelidate(rules, event);

watch(() => event.value.startDate, (val) => {
  if (!event.value.endDate && val) {
    event.value.endDate = formatISO(addHours(new Date(event.value.startDate), 1));
  }
});

</script>

<template>
  <div class="space-y-6">
    <input-date
      id="start-date"
      v-model="event.startDate"
      label="When does the event start?"
      enable-time-picker
      :v="validator.startDate" />

    <input-date
      id="start-date"
      v-model="event.endDate"
      label="When does the event end?"
      enable-time-picker
      :v="validator.endDate" />

    <hr>

    <div>
      <input-date
        id="last-booking-date"
        v-model="event.last_booking_date"
        enable-time-picker
        label="Last booking date" />
      <small>The last date users will be allowed to book onto this event</small>
    </div>

    <div class="footer">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>
