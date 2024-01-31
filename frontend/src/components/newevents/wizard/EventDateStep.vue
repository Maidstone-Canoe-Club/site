<script setup lang="ts">
import type { EventWizardItem } from "~/components/newevents/wizard/NewEventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

</script>

<template>
  <div>
    <strong>Event date</strong>

    <SingleDatePicker v-model="event" />
  </div>
</template>

<style scoped>

</style>
