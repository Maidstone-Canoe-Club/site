<template>
  <div>
    booking for event!
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  middleware: ["auth"]
});

/**
 * Give user two options, Booking for myself, Booking for a junior
 *
 * If booking for myself
 * EITHER make the api call to add the booking
 * OR redirect to stripe for payment
 *
 * If booking fore junior
 * Option to select an existing junior account or create a new one
 * Option to add self to booking (if there's enough room)
 * EITHER make api call to add the booking for junior + self
 * OR redirect to stripe for payment
 *
 */

</script>

<style scoped lang="scss">

</style>
