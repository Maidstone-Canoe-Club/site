<script setup lang="ts">
import { CheckBadgeIcon } from "@heroicons/vue/24/outline";
import type { EventItem } from "~/types";

const props = withDefaults(defineProps<{
  bookNowLabel?: string,
  event: EventItem,
  confirmAction?:(() => Promise<any>) | (() => void),
}>(), {
  bookNowLabel: "Book now",
  confirmAction: undefined
});

const open = defineModel<boolean>("open", { default: false });

async function onConfirm () {
  if (props.confirmAction) {
    await props.confirmAction();
  }

  open.value = false;
}

</script>

<template>
  <TransitionRoot as="template" :show="open">
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
                  <CheckBadgeIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div class="mt-3 sm:mt-5">
                  <DialogTitle as="h3" class="text-base text-center font-semibold leading-6 text-gray-900">
                    Confirm booking
                  </DialogTitle>
                  <div class="mt-2 space-y-2 text-sm text-gray-700">
                    <p>
                      By booking onto this event, you acknowledge and agree to the following:
                    </p>
                    <ol class="list-decimal space-y-2 mx-8">
                      <li>
                        <p class="py-0 leading-relaxed">
                          You understand that this event may have specific paddling skill level requirements set by the
                          organisers, and you meet these requirements.
                        </p>
                      </li>
                      <li>
                        <p>
                          Your medical information and emergency contact information are correct and up to date. You can
                          check your
                          details on
                          <nuxt-link
                            to="/profile"
                            class="underline text-indigo-500">
                            your profile.
                          </nuxt-link>
                        </p>
                      </li>
                      <li>
                        <p>
                          In the event that any relevant medical information changes between booking the course and the
                          start of the event, you will inform the event leaders of those changes on the day of the event.
                        </p>
                      </li>
                    </ol>

                    <rich-text
                      v-if="event.disclaimer"
                      :content="event.disclaimer" />
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <slot>
                  <a-button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    :action="onConfirm">
                    {{ bookNowLabel }}
                  </a-button>
                </slot>
                <button
                  ref="cancelButtonRef"
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  @click="open = false">
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
