<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import type { EventWizardItem } from "~/components/newevents/wizard/NewEventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  name: { required }
};

const validator = useVuelidate(rules, event);

</script>

<template>
  <div>
    <strong>Event basics</strong>

    <input-field
      id="name"
      v-model="event.name"
      label="Event name"
      :v="validator.name" />

    <div class="footer">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>
