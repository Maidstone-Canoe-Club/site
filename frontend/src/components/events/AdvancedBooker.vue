<script setup lang="ts">
import { InformationCircleIcon } from "@heroicons/vue/20/solid";
import type { EventItem } from "~/types";

const props = defineProps<{
  event: EventItem,
  instance?: string,
  paymentUrl?: string,
  alreadyBooked: boolean,
  spacesLeft?: number
}>();

</script>

<template>
  <div>
    <template v-if="spacesLeft === 0">
      <div class="rounded-md bg-blue-50 p-4 border border-blue-400">
        <div class="flex">
          <div class="flex-shrink-0">
            <InformationCircleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div class="ml-3 flex-1 md:flex md:justify-between">
            <p class="text-sm text-blue-700">
              This event is now full
            </p>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="!alreadyBooked" />
  </div>
</template>

<style scoped lang="scss">

</style>
