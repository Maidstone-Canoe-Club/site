<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import type { EventWizardItem } from "~/components/newevents/wizard/NewEventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  rrule: { validRule: helpers.withMessage("A valid input is required", required) }
};

const validator = useVuelidate(rules, event);

</script>

<template>
  <div>
    <strong>Recurring date picker</strong>

    <rule-parser
      id="event-rule"
      v-model="event.rrule"
      :start="event.startDate"
      label="How often should the event occur?"
      :v="validator.rrule" />

    <div class="footer">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>
