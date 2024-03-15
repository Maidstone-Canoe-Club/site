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
      label="What time will recurring events start?"
      required
      enable-time-picker
      :v="validator.startDate" />

    <input-date
      id="start-date"
      v-model="event.endDate"
      label="What time will recurring events end?"
      required
      enable-time-picker
      :v="validator.endDate" />

    <div class="footer">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>
