<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import type { EventItem } from "~/types";

const props = defineProps<{
  event: EventItem,
  instance?: string
}>();

const user = useDirectusUser();
const directus = useDirectus();

const canCancelEvent = computed(() => {
  const eventFinished = !props.event.is_recurring && new Date(props.event.start_date) < new Date();
  return !eventFinished && hasRole(user.value, "committee");
});

const cancelAll = ref(false);
const showConfirmModal = ref(false);

function tryCancel (shouldCancelAll = false) {
  cancelAll.value = shouldCancelAll;
  showConfirmModal.value = true;
}

function onCloseModal () {
  cancelAll.value = false;
  showConfirmModal.value = false;
}

async function onCancel () {
  let url = "/events/cancel?eventId=" + props.event.id;

  if (props.instance) {
    url += `&instance=${props.instance}`;
  }

  if (cancelAll.value) {
    url += "&cancelAll=true";
  }

  await directus(url, {
    method: "POST"
  });

  await navigateTo("/calendar");
}
</script>

<template>
  <div
    v-if="canCancelEvent"
    class="rounded-md bg-red-50 p-4 border border-red-200">
    <div class="flex">
      <div class="flex-shrink-0">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">
          Danger zone
        </h3>
        <div class="mt-2 text-sm text-red-700 flex flex-col gap-2">
          <p>
            Cancelling an event will also cancel any existing bookings. Paid bookings will not be automatically
            refunded and will have to be arranged through the club treasurer.
          </p>

          <p>
            Any users booked onto the event will receive an email notifying them the event has been cancelled.
          </p>

          <template v-if="instance">
            <p>This is a recurring event, so you can either:</p>
            <a-button
              variant="danger"
              :action="tryCancel">
              Cancel just this event
            </a-button>
            <a-button
              variant="danger"
              :action="() => tryCancel(true)">
              Cancel all recurring events
            </a-button>
          </template>
          <template v-else>
            <a-button
              variant="danger"
              :action="tryCancel">
              Cancel event
            </a-button>
          </template>
        </div>
      </div>
    </div>

    <dismiss-modal
      :action="onCancel"
      action-button-label="Yes, cancel"
      cancel-button="Back"
      variant="danger"
      :open="showConfirmModal"
      title="Cancel event"
      @dismiss="onCloseModal">
      <template v-if="instance">
        <template v-if="cancelAll">
          Are you sure you want to <strong>cancel every instance</strong> of this recurring event?
        </template>
        <template v-else>
          Are you sure you want to <strong>cancel just one instance</strong> of this recurring event?
        </template>
      </template>
      <template v-else>
        Are you sure you want to cancel this event?
      </template>
    </dismiss-modal>
  </div>
</template>

<style scoped lang="scss">

</style>
