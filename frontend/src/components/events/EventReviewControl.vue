<script setup lang="ts">
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import type { EventItem } from "~/types";

const props = defineProps<{
  event: EventItem,
  reviewedBy?: string,
  reviewNotes?: string
}>();

const directus = useDirectus();

const notes = ref<string | null>();

const errorMessage = ref<string | null>(null);
const modalOpen = ref(false);

function onOpenReviewModal () {
  modalOpen.value = true;
}

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

    modalOpen.value = false;
  } catch (err: any) {
    console.error("error reviewing event", err);
    errorMessage.value = "Something went wrong reviewing this event";
  }
}

const variant = computed(() => {
  if (props.event.status === "published") {
    return "success";
  }

  if (props.event.status === "cancelled") {
    return "error";
  }

  return "warning";
});

const heading = computed(() => {
  if (props.event.status === "published") {
    return "Event published";
  }

  if (props.event.status === "cancelled") {
    return "Event cancelled";
  }

  return "Review required";
});

</script>

<template>
  <alert-box
    :variant="variant"
    :heading="heading">
    <template v-if="event.status === 'published'">
      <div class="flex w-full justify-between items-center flex-wrap gap-2">
        <span>
          This event has been published and is visible on the calendar. You can still review this event if needed.
        </span>
        <a-button
          variant="outline"
          @click="onOpenReviewModal">
          Submit review
        </a-button>
      </div>
    </template>
    <template v-else-if="event.status === 'cancelled'">
      This event has been cancelled.
    </template>
    <template v-else>
      <div class="flex w-full justify-between items-center flex-wrap gap-2">
        <span>
          This event requires approval before it is visible on the calendar.
        </span>
        <a-button
          variant="outline"
          @click="onOpenReviewModal">
          Submit review
        </a-button>
      </div>
    </template>

    <div>
      <p v-if="reviewedBy">
        Last reviewer: <strong>{{ reviewedBy }}</strong>
      </p>
      <p v-if="reviewNotes">
        Last review notes: <strong>{{ reviewNotes }}</strong>
      </p>
    </div>

    <TransitionRoot as="template" :show="modalOpen">
      <Dialog as="div" class="relative z-10">
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
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <MagnifyingGlassIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div class="mt-3 sm:mt-5">
                    <DialogTitle as="h3" class="text-center font-semibold leading-6 text-gray-900">
                      Review event
                    </DialogTitle>
                    <div class="mt-2 text-gray-700 space-y-2">
                      <p v-if="event.status ==='published'">
                        This event has already been approved, but you might have noticed something else wrong
                        after publishing. You can still reject an event after it's been approved.
                      </p>
                      <p>
                        If something isn't correct with this event, please add some helpful notes for the
                        event creator so they can fix any issues.
                      </p>
                      <input-text-area
                        id="notes"
                        v-model="notes"
                        placeholder="Additional notes to send to the user"
                        name="notes" />
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <a-button
                    variant="primary"
                    :disabled="event.status === 'published'"
                    class="inline-flex w-full sm:col-start-2"
                    :action="() => onReviewed('approve')">
                    <CheckIcon class="size-5" />
                    Approve event
                  </a-button>
                  <a-button
                    ref="cancelButtonRef"
                    variant="danger"
                    class="mt-3 sm:mt-0 inline-flex w-full"
                    :action="() => onReviewed('reject')">
                    <XMarkIcon class="size-5" />
                    Reject event
                  </a-button>

                  <a-button
                    class="col-span-2 w-full mt-3"
                    variant="outline"
                    @click="modalOpen = false">
                    Cancel
                  </a-button>
                </div>

                <alert-box
                  v-if="errorMessage"
                  class="mt-5"
                  variant="error"
                  heading="An error occured">
                  {{ errorMessage }}
                </alert-box>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </alert-box>
</template>

<style scoped lang="scss">

</style>
