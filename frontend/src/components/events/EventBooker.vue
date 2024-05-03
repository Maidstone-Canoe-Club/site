<template>
  <div>
    <template v-if="!user">
      <nuxt-link
        :to="loginUrl"
        class="w-full flex justify-center items-center rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Login to book
      </nuxt-link>
    </template>

    <template v-else>
      <template v-if="userHasAllowedRole">
        <alert-box
          v-if="!userHasRequiredBooking"
          heading="Unable to book"
          variant="warning">
          <p>You must be booked onto <strong>{{ requiredEventTitle }}</strong> in order to book onto this event.</p>
        </alert-box>

        <div
          v-else
          class="w-full">
          <multi-booker
            v-if="canBookJuniors"
            :event="event"
            :instance="instance"
            :price="event.price"
            :junior-price="event.junior_price"
            :coach-price="event.coach_price"
            :member-price="event.member_price"
            :non-member-price="event.non_member_price"
            :non-member-junior-price="event.non_member_junior_price"
            :one-time-payment="event.one_time_payment"
            :payent-refernce="event.payment_reference"
            :payment-url="paymentUrl"
            :current-bookings="bookings"
            :spaces-left="spacesLeft"
            :juniors="juniors"
            :paid-user-ids="paidUserIds"
            @refresh="onRefresh" />

          <single-booker
            v-else
            :event="event"
            :instance="instance"
            :price="priceForUser"
            :payment-url="paymentUrl"
            :already-booked="alreadyBooked"
            :spaces-left="spacesLeft"
            @refresh="onRefresh" />
        </div>
      </template>
      <div v-else>
        You aren't allowed to book onto this event
      </div>
    </template>

    <template v-if="alreadyBooked">
      <beta-wrapper>
        <a-button
          class="w-full"
          size="lg"
          @click="onShowCheckin">
          <QrCodeIcon class="size-5" />
          Check-in
        </a-button>
        <checkin-viewer
          v-model:open="openCheckinModal"
          :checkin-code="checkinCode" />
      </beta-wrapper>
    </template>
  </div>
</template>

<script setup lang="ts">
import { QrCodeIcon } from "@heroicons/vue/24/solid";
import type { EventItem } from "~/types";

const emits = defineEmits(["refresh"]);

const props = defineProps<{
  event: EventItem,
  instance?: string,
  alreadyBooked: boolean,
  hasRequiredBooking: boolean,
  otherBookingRequired: boolean,
  requiredEventTitle?: string,
  spacesLeft?: number,
  paidUserIds?: string[],
  bookings: any,
}>();

const user = useDirectusUser();
const route = useRoute();
const { getUsers } = useDirectusUsers();

const loginUrl = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`);

// const advancedPricing = computed(() => props.event.advanced_pricing);
const advancedPricing = ref(false);
const openCheckinModal = ref(false);

function onShowCheckin () {
  openCheckinModal.value = true;
}

const { data: juniors } = await useAsyncData(`juniors-bookings-${user.value?.id}`, async () => {
  return await loadJuniors();
});

const canBookJuniors = computed(() => {
  if (juniors.value) {
    return juniors.value.length && (props.event.allowed_roles?.map(x => x.toLowerCase()).includes("juniors") ?? false);
  }
  return false;
});

async function loadJuniors () {
  if (user.value) {
    return await getUsers({
      params: {
        fields: ["id", "first_name", "last_name", "role.name", "dob"],
        filter: {
          parent: {
            _eq: user.value.id
          }
        }
      }
    });
  }

  return null;
}

const paymentUrl = computed(() => {
  let result = `/api/eventPayment?eventId=${props.event.id}&userId=${user.value!.id}`;

  if (props.instance) {
    result += `&instance=${props.instance}`;
  }

  if (props.event.payment_reference) {
    result += `&ref=${props.event.payment_reference}`;
  }

  return result;
});

const userHasAllowedRole = computed(() => {
  const result = true;

  if (!user.value) {
    return true;
  }

  const allowed = props.event.allowed_roles;
  if (allowed && allowed.length) {
    const nobodyAllowed = allowed.includes("No one");

    if (nobodyAllowed) {
      return false;
    }

    for (const allowedRole of allowed) {
      if (hasRole(user.value, mapAllowedRoleToUserRole(allowedRole))) {
        return true;
      }
    }

    return false;
  }

  return result;
});

const priceForUser = computed(() => {
  if (props.event.advanced_pricing) {
    if (hasExactRole(user.value, "coach") || user.value?.is_coach) {
      console.log("coach price", user.value.role.name);
      return props.event.coach_price;
    } else if (hasExactRole(user.value, "member") || hasExactRole(user.value, "committee")) {
      console.log("member price", user.value.role.name, props.event.member_price);
      return props.event.member_price;
    } else if (hasExactRole(user.value, "unapproved")) {
      return props.event.non_member_price;
    }

    return null;
  } else {
    return props.event.price;
  }

  // if (props.event.advanced_pricing) {
  //   if (hasExactRole(user.value, "member")) {
  //     return props.event.member_price;
  //   } else if (hasExactRole(user.value, "non_member")) {
  //     return props.event.non_member_price;
  //   } else if (hasExactRole(user.value, "coach")) {
  //     return props.event.coach_price;
  //   }
  //
  //   return null;
  // } else {
  //   return props.event.price;
  // }
});

function mapAllowedRoleToUserRole (allowedRole: string) {
  switch (allowedRole.toLowerCase()) {
  case "non-members":
    return "Unapproved";
  case "juniors":
    return "Junior";
  case "members":
    return "Member";
  case "none":
    return null;
  default:
    throw new Error("Unknown allowed role: " + allowedRole);
  }
}

function onRefresh () {
  emits("refresh");
}

const userHasRequiredBooking = computed(() => {
  if (props.otherBookingRequired) {
    return props.hasRequiredBooking;
  }

  return true;
});

const checkinCode = "cd15c415-1042-4766-81d3-8804c5fece62";

</script>

<style scoped lang="scss">

</style>
