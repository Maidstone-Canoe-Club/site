<script setup lang="ts">
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

</script>

<template>
  <div class="space-y-6">
    <strong>Notification settings</strong>

    <div class="space-y-2">
      <p>
        Check below if you want to notify users who have booked onto this event of the changes you've made. Useful if
        you have changed the location or description.
      </p>
      <p>
        <i>Note: Users will notified automatically if you have changed the dates.</i>
      </p>
    </div>
    <input-checkbox
      id="notify-users"
      v-model="event.notifyUsers"
      name="notify-users"
      label="Send notification email to users" />

    <div class="footer">
      <hr class="mb-6">
      <slot v-bind="{isValid: true}" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
