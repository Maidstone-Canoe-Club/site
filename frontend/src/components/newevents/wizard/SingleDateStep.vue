<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import { addHours } from "date-fns";
import type { EventWizardItem } from "~/components/wizard/NewEventWizard.vue";

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
  if (!event.value.endDate) {
    event.value.endDate = addHours(event.value.startDate, 1);
  }
});

</script>

<template>
  <div>
    <strong>Single date picker</strong>

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

    <div class="footer">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>
