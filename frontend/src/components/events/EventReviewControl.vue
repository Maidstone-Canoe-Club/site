<script setup lang="ts">
import { CheckIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import type { EventItem } from "~/types";

const props = defineProps<{
  event: EventItem
}>();

const directus = useDirectus();

const notes = ref<string | null>();

async function onReviewed (result: "approve" | "reject") {
  try {
    const res = await directus("/events/review", {
      method: "post",
      body: {
        event: props.event.id,
        result,
        notes: notes.value
      }
    });
  } catch (err: any) {
    console.error("error reviewing event", err);
  }
}

</script>

<template>
  <alert-box
    variant="info"
    heading="Review event">
    <div class="w-full space-y-4">
      <div class="space-y-1">
        <p>
          This event requires approval to be made visible on the calendar. The creator of this event will receive an
          email when you click approve or reject.
        </p>
        <p>If this is a lead paddle, please ensure the leaders are within their remit.</p>
        <p>If this event has a cost, please ensure it has a reasonable price for the event.</p>
      </div>
      <input-text-area
        id="notes"
        v-model="notes"
        placeholder="Additional notes to send to the user"
        class="max-w-[400px]"
        name="notes" />
      <div class="flex gap-2">
        <a-button
          variant="primary"
          :action="() => onReviewed('approve')">
          <CheckIcon class="size-5" />
          Approve
        </a-button>
        <a-button
          variant="danger"
          :action="() => onReviewed('reject')">
          <XMarkIcon class="size-5" />
          Reject
        </a-button>
      </div>
    </div>
  </alert-box>
</template>

<style scoped lang="scss">

</style>
