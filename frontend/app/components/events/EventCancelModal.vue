<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import type { EventItem } from "~/types";

const props = defineProps<{
  event: EventItem,
  instance?: string | number
}>();

const directus = useDirectus();
const open = defineModel<boolean>({ required: true });

const cancelReason = ref<string>();
const cancelAll = ref(false);
const showConfirmState = ref(false);

const errorMessage = ref<string>();

function tryCancel (shouldCancelAll = false) {
  cancelAll.value = shouldCancelAll;
  showConfirmState.value = true;
}

watch(open, (val) => {
  if (val) {
    cancelAll.value = true;
    showConfirmState.value = false;
    errorMessage.value = undefined;
    cancelReason.value = undefined;
  }
});

async function onCancel () {
  errorMessage.value = undefined;

  try {
    let url = "/events/cancel?eventId=" + props.event.id;

    if (props.instance !== null && props.instance !== undefined) {
      url += `&instance=${props.instance}`;
    }

    if (cancelAll.value) {
      url += "&cancelAll=true";
    }

    await directus(url, {
      method: "POST",
      body: {
        reason: cancelReason.value
      }
    });

    await navigateTo("/calendar");
  } catch (err: any) {
    console.error("Error cancelling event");
    errorMessage.value = "There was an error cancelling the event";
  }
}

</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="open = false">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 space-y-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div class="mt-3 sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900 text-center">
                    Cancel event
                  </DialogTitle>

                  <alert-box
                    v-if="errorMessage"
                    class="mt-3"
                    variant="error">
                    {{ errorMessage }}
                    <span>If the error persists, please <nuxt-link
                      class="underline font-bold"
                      to="/contact-us">contact</nuxt-link> the website admin.</span>
                  </alert-box>

                  <template v-else-if="showConfirmState">
                    <input-text-area
                      id="cancel-reason"
                      v-model="cancelReason"
                      name="cancel-reason"
                      label="Cancel reason (optional)"
                      placeholder="Enter the reason why the event was cancelled. This will be sent to the users who will have their bookings cancelled." />
                    <div
                      class="mt-5 flex flex-col space-y-3 border border-red-200 rounded text-sm text-red-700 bg-red-50 p-4">
                      <p>
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
                      </p>

                      <a-button
                        :action="onCancel"
                        keep-loading
                        variant="danger">
                        Yes, cancel
                      </a-button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="mt-3 space-y-3">
                      <p class="text-sm text-gray-700">
                        Cancelling an event will also cancel any existing bookings. Paid bookings will not be
                        automatically
                        refunded and will have to be arranged through the club treasurer.
                      </p>

                      <p class="text-sm text-gray-700">
                        Any users booked onto the event will receive an email notifying them the event has been
                        cancelled.
                      </p>
                    </div>

                    <div
                      class="text-sm text-red-700 bg-red-50 p-4 mt-6 space-y-3 flex flex-col border border-red-200 rounded">
                      <strong class="text-center">Danger zone!</strong>
                      <template v-if="instance !== null && instance !== undefined">
                        <p>This is a recurring event, so you can either:</p>
                        <a-button
                          variant="danger"
                          hide-loader
                          :action="tryCancel">
                          Cancel just this event
                        </a-button>
                        <a-button
                          variant="danger"
                          hide-loader
                          :action="() => tryCancel(true)">
                          Cancel all recurring events
                        </a-button>
                      </template>
                      <template v-else>
                        <a-button
                          variant="danger"
                          hide-loader
                          :action="tryCancel">
                          Cancel event
                        </a-button>
                      </template>
                    </div>
                  </template>
                </div>
              </div>

              <div class="mt-5 sm:mt-6">
                <a-button
                  type="button"
                  variant="outline"
                  class="w-full"
                  @click="open = false">
                  Go back
                </a-button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped lang="scss">

</style>
