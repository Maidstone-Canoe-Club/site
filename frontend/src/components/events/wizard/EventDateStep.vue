<script setup lang="ts">
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

</script>

<template>
  <div>
    <strong>Event date</strong>

    <SingleDatePicker v-model="event" />

    <input-date
      id="last-booking-date"
      v-model="event.last_booking_date"
      enable-time-picker
      label="Last booking date" />
  </div>
</template>

<style scoped>

</style>
