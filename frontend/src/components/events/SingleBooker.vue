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
    <template v-else-if="!alreadyBooked">
      <form
        v-if="hasPrice"
        :action="paymentUrl"
        method="POST">
        <input
          id="userIds"
          type="hidden"
          :value="user.id"
          name="userIds">
        <button
          type="submit"
          class="w-full rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          {{ payNowLabel }}
        </button>
      </form>
      <custom-button
        v-else
        class="w-full font-semibold px-2.5 py-3"
        :action="onTryBookNow">
        Book now
      </custom-button>
    </template>
    <client-only>
      <TransitionRoot as="template" :show="openResultModal">
        <Dialog as="div" class="relative z-10" @close="openResultModal = false">
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
                  class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div
                      class="mx-auto flex h-12 w-12 items-center justify-center rounded-full "
                      :class="bookingSuccess ? 'bg-green-100' : 'bg-orange-100'">
                      <CheckIcon
                        v-if="bookingSuccess"
                        class="h-6 w-6 text-green-600"
                        aria-hidden="true" />
                      <ExclamationTriangleIcon
                        v-else
                        class="h-6 w-6 text-orange-600"
                        aria-hidden="true" />
                    </div>
                    <div class="mt-3 text-center sm:mt-5">
                      <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                        {{ bookingSuccess ? 'Booking success' : 'Booking problem' }}
                      </DialogTitle>
                      <div class="mt-2">
                        <p
                          v-for="(msg, index) in resultMessages"
                          :key="index"
                          class="text-sm text-gray-500">
                          {{ msg }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="mt-5 sm:mt-6">
                    <button
                      type="button"
                      class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      @click="openResultModal = false">
                      Continue
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>

      <event-disclaimer-modal
        v-model:open="openDisclaimerModal"
        :event="event"
        :confirm-action="onBookNow" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { InformationCircleIcon } from "@heroicons/vue/20/solid";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
// @ts-ignore
import Dinero from "dinero.js";
import type { EventItem } from "~/types";

const emits = defineEmits(["refresh"]);

const props = defineProps<{
  event: EventItem,
  instance?: string,
  price?: number,
  paymentUrl?: string,
  alreadyBooked: boolean,
  spacesLeft?: number
}>();

const user = useDirectusUser();
const directus = useDirectus();

const openResultModal = ref(false);
const openDisclaimerModal = ref(false);
const bookingSuccess = ref(true);
const resultMessages = ref<string[]>([]);

function onTryBookNow () {
  openDisclaimerModal.value = true;
}

async function onBookNow () {
  try {
    let url = `/events/book?eventId=${props.event.id}&userId=${user.value.id}`;

    if (props.instance) {
      url += `&instance=${props.instance}`;
    }

    const userIds = [user.value.id];

    const bookingResult = await directus(url, {
      method: "POST",
      body: {
        userIds
      }
    });
    emits("refresh");

    bookingSuccess.value = bookingResult.filter(x => !x.result).length === 0;
    resultMessages.value = bookingResult.map(x => x.message);
    openResultModal.value = true;
  } catch (e) {
    console.error("Error booking onto event", e);
  }
}

const userPrice = computed(() => {
  if (props.event.coach_price && (hasExactRole(user.value, "coach") || hasExactRole(user.value, "committee"))) {
    return props.event.coach_price;
  } else if (props.event.member_price && hasExactRole(user.value, "member")) {
    return props.event.member_price;
  } else if (props.event.non_member_price && hasExactRole(user.value, "unapproved")) {
    return props.event.non_member_price;
  } else {
    return props.event.price;
  }
});

const payNowLabel = computed(() => {
  return "Pay " + renderPrice(userPrice.value) + " now";
});

const hasPrice = computed(() => {
  return props.event.price || props.event.coach_price || props.event.member_price || props.event.non_member_price;
});

function renderPrice (amount: number) {
  if (!amount) {
    return null;
  }
  return `£${Dinero({ amount, currency: "GBP" }).toFormat(amount % 100 === 0 ? "0" : "0.00")}`;
}

</script>

<style scoped lang="scss">

</style>
