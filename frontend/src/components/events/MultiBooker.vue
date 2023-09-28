<template>
  <div
    v-if="usersThatCanBook && usersThatCanBook.length"
    class="ring-1 ring-black ring-opacity-5 rounded p-3 sm:p-5 flex flex-col bg-white">
    <div class="flex gap-1 flex-wrap justify-between items-center mb-4">
      <span
        class="block text-sm font-semibold leading-6 text-gray-900">Who do you want to book onto the event?</span>
    </div>
    <ul class="flex flex-col gap-4 sm:gap-3 mb-4">
      <li v-for="(u, index) in usersThatCanBook" :key="index">
        <input-toggle
          v-model="u.shouldBook"
          :disabled="isFull && !u.shouldBook"
          :label="toggleLabel(u)" />
      </li>
    </ul>

    <div
      v-if="spacesLeft"
      class="flex justify-end mb-6">
      <span
        class="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
        <UsersIcon class="h-5 mr-1" />
        {{ usersToBook.length }}/{{ spacesLeft }}
      </span>
    </div>

    <form
      v-if="usePaymentForm"
      :action="paymentUrl"
      method="POST">
      <input
        v-for="(u, index) in usersToBook"
        id="userIds"
        :key="index"
        name="userIds"
        type="hidden"
        :value="u.id">
      <button
        type="submit"
        :disabled="buttonDisabled"
        class="w-full font-semibold px-2.5 py-3"
        :class="payNowButtonClass">
        {{ payNowLabel }}
      </button>
    </form>
    <custom-button
      v-else
      class="w-full font-semibold px-2.5 py-3"
      :disabled="buttonDisabled"
      :action="onBookNow">
      Book now
    </custom-button>
  </div>

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
                  <div class="mt-3 sm:mt-5">
                    <DialogTitle as="h3" class="text-base text-center font-semibold leading-6 text-gray-900">
                      {{ bookingSuccess ? 'Booking success' : 'Booking problem' }}
                    </DialogTitle>
                    <div class="mt-5">
                      <ul class="flex flex-col gap-3">
                        <li
                          v-for="(result, index) in bookingResults"
                          :key="index"
                          class="flex flex-col">
                          <strong class="text-sm ">{{ getUser(result.userId) }}</strong>
                          <span class="text-sm text-gray-700">
                            {{ result.message }}
                          </span>
                        </li>
                      </ul>
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
  </client-only>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { CheckIcon, ExclamationTriangleIcon, UsersIcon } from "@heroicons/vue/24/outline";
import Dinero from "dinero.js";
import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { EventItem } from "~/types";
// @ts-ignore

const emits = defineEmits(["refresh"]);

const props = defineProps<{
  event: EventItem,
  instance?: string,
  price?: number,
  juniorPrice?: number,
  paymentUrl?: string,
  currentBookings?: any,
  spacesLeft?: number,
  juniors?: DirectusUser[]
}>();

const user = useDirectusUser();
const directus = useDirectus();

const openResultModal = ref(false);
const bookingSuccess = ref(true);
const bookingResults = ref(null);

const lastUsersBooked = ref();

const nonJuniorRoles = ["members", "coach", "committee"];
const canBookNonJuniors = computed(() => {
  if (props.event.allowed_roles) {
    for (const role of props.event.allowed_roles) {
      if (nonJuniorRoles.includes(role.toLowerCase())) {
        return true;
      }
    }
  }

  return false;
});

const totalPrice = computed(() => {
  let total = 0;

  for (const user of usersToBook.value) {
    const isJunior = hasExactRole(user, "junior");
    if (isJunior && props.juniorPrice) {
      total += props.juniorPrice;
    }

    if (!isJunior && props.price) {
      total += props.price;
    }
  }

  return total;
});

const isFull = computed(() => usersToBook.value.length === props.spacesLeft);

const usePaymentForm = computed(() => {
  if (!props.price && !props.juniorPrice) {
    return false;
  }

  const shouldBookUsers = usersToBook.value;
  const total = totalPrice.value;

  if (shouldBookUsers.length && total > 0) {
    return true;
  }

  return false;
});

const usersThatCanBook = computed(() => {
  const result = [];

  if (canBookNonJuniors.value && !userAlreadyBooked(user.value.id)) {
    result.push(user.value);
  }

  if (juniors.value && juniors.value.length) {
    for (const j of juniors.value) {
      if (!userAlreadyBooked(j.id)) {
        result.push(j);
      }
    }
  }

  return result;
});

const usersToBook = computed(() => usersThatCanBook.value.filter(x => x.shouldBook));

const buttonDisabled = computed(() => {
  if (usersThatCanBook.value.length === 0) {
    return true;
  }

  if (usersThatCanBook.value.length && !usersToBook.value.length) {
    return true;
  }

  return false;
});

const payNowLabel = computed(() => {
  const total = totalPrice.value;
  if (total !== 0) {
    return "Pay " + renderPrice(total) + " now";
  }
  return "Pay now";
});

function userAlreadyBooked (id) {
  return !!props.currentBookings.find(x => x.user.id === id);
}

async function onBookNow () {
  try {
    let url = `/events/book?eventId=${props.event.id}&userId=${props.userId}`;

    if (props.instance) {
      url += `&instance=${props.instance}`;
    }

    const userIds = usersToBook.value?.map(x => x.id) ?? [];
    lastUsersBooked.value = [...usersToBook.value];

    const bookingResult = await directus(url, {
      method: "POST",
      body: {
        userIds
      }
    });

    emits("refresh");

    bookingSuccess.value = bookingResult.filter(x => !x.result).length === 0;
    bookingResults.value = bookingResult;
    openResultModal.value = true;
  } catch (e) {
    console.error("Error booking onto event", e);
  }
}

function toggleLabel (user) {
  return `${user.first_name} ${user.last_name}`;
}

function renderPrice (amount: number) {
  if (!amount) {
    return null;
  }
  return `£${Dinero({ amount, currency: "GBP" }).toFormat(amount % 100 === 0 ? "0" : "0.00")}`;
}

const payNowButtonClass = computed(() => {
  let result = "relative overflow-hidden rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

  if (buttonDisabled.value) {
    result = "relative overflow-hidden rounded-md bg-indigo-300 text-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
  }

  return result;
});

function getUser (userId) {
  const user = lastUsersBooked.value.find(x => x.id === userId);
  if (!user) {
    return "Unknown user";
  }
  return `${user.first_name} ${user.last_name}`;
}

</script>

<style scoped lang="scss">

</style>
