<template>
  <div v-if="spacesLeft === 0">
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
  </div>
  <div
    v-else-if="usersThatCanBook && usersThatCanBook.length"
    class="ring-1 ring-black ring-opacity-5 rounded p-3 sm:p-5 flex flex-col bg-white">
    <div class="flex gap-1 flex-wrap justify-between items-center mb-4">
      <span
        class="block text-sm font-semibold leading-6 text-gray-900">Who do you want to book onto the event?</span>
    </div>
    <ul class="flex flex-col gap-4 sm:gap-3 mb-4">
      <li v-for="(u, index) in usersThatCanBook" :key="index">
        <div class="flex justify-between items-center">
          <span class="text-sm font-semibold">{{ u.first_name }} {{ u.last_name }}</span>

          <div class="flex gap-2">
            <span
              v-if="hasPaid(u)"
              class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Paid
            </span>
            <span
              v-else
              class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {{ renderPrice(getPriceForUser(u)) || "Free" }}
            </span>
            <input-toggle
              v-model="u.shouldBook"
              :disabled="isFull && !u.shouldBook" />
          </div>
        </div>
      </li>
    </ul>

    <div
      class="flex flex-wrap gap-2 justify-between mb-6">
      <nuxt-link
        to="/profile/juniors"
        class="rounded flex items-center gap-1 bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        Add new junior
        <PlusIcon class="h-4" />
      </nuxt-link>
      <span
        v-if="spacesLeftLabel"
        class="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
        <UsersIcon class="h-5 mr-1" />
        {{ spacesLeftLabel }}
      </span>
    </div>

    <a-button
      v-if="usePaymentForm"
      :action="onTryBookNow"
      hide-loader>
      <CreditCardIcon class="size-5" />
      {{ payNowLabel }}
    </a-button>
    <a-button
      v-else
      class="w-full font-semibold px-2.5 py-3"
      :disabled="buttonDisabled"
      :action="onTryBookNow">
      <TicketIcon class="size-5" />
      Book now
    </a-button>
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
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
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

    <medical-info-modal
      v-model:open="openMedicalInfoModal"
      :users="usersToBook"
      show-cancel
      save-label="Save and continue"
      @continue="onMedicalInfoConfirmed"
      @cancel="onMedicalInfoCancel" />

    <event-disclaimer-modal
      v-if="usePaymentForm"
      v-model:open="openDisclaimerModal"
      :event="event"
      :confirm-action="onBookNow">
      <form
        v-if="usePaymentForm"
        :action="paymentUrl"
        class="inline-flex w-full sm:col-start-2"
        method="POST">
        <input
          v-for="(u, index) in usersToBook"
          id="userIds"
          :key="index"
          name="userIds"
          type="hidden"
          :value="u.id">
        <input
          v-if="paymentReference"
          id="ref"
          name="ref"
          type="hidden"
          :value="preloadPayload">
        <a-button
          type="submit"
          :disabled="buttonDisabled"
          :disable-timeout-ms="1000"
          class="w-full font-semibold px-2.5 py-3"
          :class="payNowButtonClass">
          <CreditCardIcon class="size-5" />
          {{ payNowLabel }}
        </a-button>
      </form>
    </event-disclaimer-modal>
    <event-disclaimer-modal
      v-else
      v-model:open="openDisclaimerModal"
      :event="event"
      :confirm-action="onBookNow" />
  </client-only>
</template>

<script setup lang="ts">
import {
  CheckIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  PlusIcon,
  CreditCardIcon,
  TicketIcon
} from "@heroicons/vue/24/outline";
// @ts-ignore
import Dinero from "dinero.js";
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { InformationCircleIcon } from "@heroicons/vue/20/solid";
import type { EventItem } from "~/types";

const emits = defineEmits(["refresh"]);

const props = defineProps<{
  event: EventItem,
  instance?: number,
  price?: number,
  juniorPrice?: number,
  nonMemberJuniorPrice?: number,
  coachPrice?: number,
  memberPrice?: number,
  nonMemberPrice?: number,
  paymentUrl?: string,
  currentBookings?: any,
  spacesLeft?: number,
  juniors?: DirectusUser[],
  oneTimePayment?: boolean,
  paymentReference?: string,
  paidUserIds?: string[]
}>();

const user = useDirectusUser();
const directus = useDirectus();

const openResultModal = ref(false);
const openDisclaimerModal = ref(false);
const openMedicalInfoModal = ref(false);

const bookingSuccess = ref(true);
const bookingResults = ref(null);

const lastUsersBooked = ref();

const nonJuniorRoles = ["members", "coach", "committee", "non-members"];
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

function onMedicalInfoCancel () {
  openMedicalInfoModal.value = false;
}

function onMedicalInfoConfirmed () {
  openMedicalInfoModal.value = false;
  openDisclaimerModal.value = true;
}

const totalPrice = computed(() => {
  let total = 0;

  for (const user of usersToBook.value) {
    const userPrice = getPriceForUser(user);
    if (userPrice) {
      total += userPrice;
    }
  }

  return total;
});

function hasPaid (user: any) {
  const paid = props.paidUserIds?.includes(user.id);
  return !!paid;
}

function getPriceForUser (user: any) {
  let amount = null;

  if (hasPaid(user)) {
    return null;
  }

  const isJunior = hasExactRole(user, "junior");
  if (props.event.advanced_pricing) {
    if (isJunior) {
      if (props.nonMemberJuniorPrice) {
        amount = user.bc_number ? props.juniorPrice : props.nonMemberJuniorPrice;
      } else {
        amount = props.juniorPrice;
      }
    } else if (hasExactRole(user, "coach") || user.is_coach) {
      amount = props.coachPrice;
    } else if (hasExactRole(user, "member") || hasExactRole(user, "committee")) {
      amount = props.memberPrice;
    } else if (hasExactRole(user, "unapproved")) {
      amount = props.nonMemberPrice;
    }
  } else if (isJunior) {
    amount = props.juniorPrice;
  } else {
    amount = props.price;
  }

  return amount;
}

const isFull = computed(() => usersToBook.value.length === props.spacesLeft);

const spacesLeftLabel = computed(() => {
  if (props.spacesLeft) {
    const left = props.spacesLeft - usersToBook.value.length;
    return left === 1 ? "1 space left" : left + " spaces left";
  }

  return null;
});

const usePaymentForm = computed(() => {
  if (!props.price && !props.juniorPrice && !props.nonMemberJuniorPrice) {
    return false;
  }

  const shouldBookUsers = usersToBook.value;
  const total = totalPrice.value;

  if (shouldBookUsers.length && total > 0) {
    let usersMustPay = false;
    for (const user of shouldBookUsers) {
      if (!hasPaid(user)) {
        usersMustPay = true;
        break;
      }
    }

    return usersMustPay;
  }

  return false;
});

function userMeetsMinAge (user: DirectusUser) {
  if (!props.event.min_age) {
    return true;
  }

  const today = new Date();
  const birthDate = new Date(user.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= props.event.min_age;
}

const usersThatCanBook = computed(() => {
  const result = [];

  if (canBookNonJuniors.value && !userAlreadyBooked(user.value.id) && userMeetsMinAge(user.value)) {
    result.push(user.value);
  }

  if (props.juniors && props.juniors.length) {
    for (const j of props.juniors) {
      if (!userAlreadyBooked(j.id) && userMeetsMinAge(j)) {
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

function userAlreadyBooked (id: string) {
  return !!props.currentBookings.find((x: any) => x.user.id === id && x.status !== "cancelled");
}

const route = useRoute();

function onTryBookNow () {
  umTrackEvent("check-medical-info", { page: route.fullPath });
  openMedicalInfoModal.value = true;
}

async function onBookNow () {
  try {
    let url = `/events/book?eventId=${props.event.id}&userId=${user.value!.id}`;

    if (props.instance !== null && props.instance !== undefined) {
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

function renderPrice (amount: number | null) {
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

function getUser (userId: string) {
  const user = lastUsersBooked.value.find(x => x.id === userId);
  if (!user) {
    return "Unknown user";
  }
  return `${user.first_name} ${user.last_name}`;
}

</script>

<style scoped lang="scss">

</style>
