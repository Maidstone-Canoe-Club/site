<script setup lang="ts">
import { CheckBadgeIcon, TicketIcon } from "@heroicons/vue/24/outline";
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

      <div class="fixed inset-0 z-10 w-screen  overflow-y-auto">
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
                <div class=" mt-3 sm:mt-5">
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
                          start of the event, you will inform the event leaders of those changes on the day of the
                          event.
                        </p>
                      </li>
                      <li>
                        <p>
                          I have had the activities explained and agree to myself / my son / my daughter to participate
                          in the
                          activities / event.
                        </p>
                      </li>
                      <li>
                        <p>
                          I understand that the club / organisers accept no responsibility for loss, damage or injury
                          caused by or
                          during attendance of the organised activity / event except
                          where such loss, damage or injury can be shown to result directly from the negligence of the
                          club /
                          organisers.
                        </p>
                      </li>
                      <li>
                        <p>
                          I confirm to the best of my knowledge that myself / my son / my daughter does not suffer from
                          any medical
                          condition other than those declared.
                        </p>
                      </li>
                      <li>
                        <p>
                          I understand that British Canoeing is insured for its civil liabilities as organiser of the
                          event and that
                          there is no personal accident cover for participants.
                        </p>
                      </li>
                      <li>
                        <p>
                          I am responsible for completing this form accurately and including all details that might be
                          needed by the
                          person in charge. I am responsible for any errors and
                          omissions to personal information and
                          accept liability for any direct or indirect consequences that might
                          arise from these errors or omissions.
                        </p>
                      </li>
                      <li>
                        <p>
                          I consent to my son / daughter travelling by any form of transport arranged or approved by the
                          organisation
                          and related to the specific activity/event.
                        </p>
                      </li>
                      <li>
                        <p>
                          I agree to be at the pick-up / drop-off point at the agreed time.
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
                    :disable-timeout-ms="1000"
                    keep-loading
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    :action="onConfirm">
                    <TicketIcon class="size-5" />
                    {{ bookNowLabel }}
                  </a-button>
                </slot>
                <button
                  ref="cancelButtonRef"
                  type="button"
                  class="mt-3 inline-flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
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
