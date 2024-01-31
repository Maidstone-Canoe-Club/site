<script setup lang="ts">
import type { EventWizardItem } from "~/components/newevents/wizard/NewEventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

</script>

<template>
  <div>
    <strong>Multi date picker</strong>
  </div>
</template>

<style scoped>

</style>
