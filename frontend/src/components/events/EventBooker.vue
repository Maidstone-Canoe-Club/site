<template>
  <div>
    <template v-if="userHasAllowedRole">
      <div
        v-if="user"
        class="flex flex-col items-center gap-3">
        <template v-if="alreadyBooked">
          <div
            class="flex justify-center items-center gap-2 p-4 rounded-md border w-full">
            <CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
            <p class="text-sm font-medium text-gray-900">
              You're booked on!
            </p>
          </div>
          <button
            class="w-full rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            @click="onCancelBooking">
            Cancel event booking
          </button>
        </template>
        <template v-else>
          <form
            v-if="!!price"
            :action="paymentUrl"
            class="w-full"
            method="post">
            <button
              type="submit"
              class="w-full rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              {{ bookNowLabel }}
            </button>
          </form>

          <custom-button
            v-else
            class="w-full rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            :action="onBookNow">
            {{ bookNowLabel }}
          </custom-button>
        </template>

        <template v-if="juniorsCanBook">
          <span
            v-if="!alreadyBooked"
            class="text-gray-500 font-semibold text-sm">
            or
          </span>
          <custom-button
            class="w-full rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            :action="onBookJunior">
            {{ bookJuniorLabel }}
          </custom-button>
        </template>
      </div>
      <div v-else class="w-full flex">
        <nuxt-link
          :to="loginUrl"
          class="w-full flex justify-center items-center rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Login to book
        </nuxt-link>
      </div>

      <dismiss-modal
        v-model:open="showCancelModal"
        title="Cancel booking"
        action-button-label="Cancel booking"
        cancel-button="Dismiss"
        :action="cancelBooking">
        {{ cancelConfirmationMessage }}
      </dismiss-modal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

const user = useDirectusUser();
const directus = useDirectus();

const emits = defineEmits(["refresh"]);

const props = defineProps<{
  event: any,
  juniorsCanBook: boolean
  price?: number,
  juniorPrice?: number,
  instance?: number,
  patternType?: string,
  alreadyBooked: boolean,
  userId: string
}>();

const showCancelModal = ref(false);

const loginUrl = computed(() => `/login?redirect=/events/${props.event.id}`);

const paymentUrl = computed(() => {
  let result = `/api/eventPayment?eventId=${props.event.id}&userId=${user.value.id}`;

  if (props.instance) {
    result += `&instance=${props.instance}`;
  }

  if (props.patternType) {
    result += `&patternType=${props.patternType}`;
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
      if (hasExactRole(user.value, mapAllowedRoleToUserRole(allowedRole))) {
        return true;
      }
    }

    return false;
  }

  return result;
});

function mapAllowedRoleToUserRole (allowedRole: string) {
  switch (allowedRole) {
  case "Non-members": return "Unapproved";
  case "Juniors": return "Junior";
  case "Members": return "Member";
  case "No one": return null;
  default: throw new Error("Unknown allowed role: " + allowedRole);
  }
}

const bookNowLabel = computed(() => {
  if (props.juniorsCanBook) {
    return props.price ? "Pay for myself" : "Book now";
  } else {
    return props.price ? "Pay now" : "Book now";
  }
});

const bookJuniorLabel = computed(() => {
  return props.juniorPrice ? "Pay for a junior" : "Book for a junior";
});

async function onBookNow () {
  if (!props.price) {
    let url = `/events/book?eventId=${props.event.id}&userId=${props.userId}`;

    if (props.instance) {
      url += `&instance=${props.instance}`;
    }

    const bookingResult = await directus(url, {
      method: "POST"
    });

    if (bookingResult.result) {
      emits("refresh");
    } else {
      console.warn(bookingResult.message);
    }
  }
}

function onBookJunior () {

}

function onCancelBooking () {
  showCancelModal.value = true;
}

const cancelConfirmationMessage = computed(() => {
  let result = "Are you sure you want to cancel your booking?";

  // if event has price AND the user booked on is NOT A JUNIOR
  // if the event has a junior_price AND the user booked on IS A JUNIOR
  if (true) {
    result += " You will be refunded the cost of the event.";
  }

  return result;
});

async function cancelBooking () {
  let url = "/events/cancel?eventId=" + props.event.id + "&userId=" + props.userId;

  if (props.instance) {
    url += "&instance=" + props.instance;
  }

  await directus(url, {
    method: "POST"
  });
  emits("refresh");
}

</script>

<style scoped lang="scss">

</style>
