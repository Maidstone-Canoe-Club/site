<script setup lang="ts">

import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

</script>

<template>
  <div class="space-y-6">
    <event-pricing v-model="event" />
    <div class="footer">
      <hr class="mb-6">
      <slot v-bind="{isValid: true}" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
