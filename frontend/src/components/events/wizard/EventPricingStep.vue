<script setup lang="ts">
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const props = withDefaults(defineProps<{
  editMode: boolean,
  bookingsCount?: number
}>(), {
  bookingsCount: 0
});

const hasBookings = computed(() => props.bookingsCount > 0);

const existingPaymentWarning = computed(() => {
  if (hasBookings.value) {
    const single = props.bookingsCount === 1;
    return `There ${single ? "is" : "are"} ${props.bookingsCount} ${single ? "booking" : "bookings"} listed for this event.`;
  }

  return null;
});

</script>

<template>
  <div class="space-y-6">
    <alert-box
      v-if="editMode && hasBookings"
      variant="error"
      heading="Changing the price?">
      <p>If you are changing the pricing of this of this event, please read.</p>
      <p><strong>{{ existingPaymentWarning }}</strong></p>
      <p>
        <strong>
          If you change the price, users who book onto this event will pay the new price. Nothing will
          change for users who have already booked.
        </strong>
      </p>
      <p>If you are not changing the pricing, you may proceed as normal and ignore this warning.</p>
    </alert-box>
    <event-pricing v-model="event" />
    <div class="footer">
      <hr class="mb-6">
      <slot v-bind="{isValid: true}" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
