<template>
  <div>
    <template v-if="userHasAllowedRole">
      <div
        v-if="user"
        class="flex flex-col items-center gap-3">
        <!--        <template v-if="alreadyBooked && juniorsToBook">-->
        <!--          <div-->
        <!--            class="flex justify-center items-center gap-2 p-4 rounded-md border w-full">-->
        <!--            <CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />-->
        <!--            <p class="text-sm font-medium text-gray-900">-->
        <!--              You're booked on!-->
        <!--            </p>-->
        <!--          </div>-->
        <!--          <button-->
        <!--            class="w-full rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"-->
        <!--            @click="onCancelBooking">-->
        <!--            Cancel event booking-->
        <!--          </button>-->
        <!--        </template>-->
        <component
          :is="!!price ?'form' : 'div'"
          :action="paymentUrl"
          class="flex flex-col gap-2 w-full"
          method="post">
          <div
            v-if="eventCanBookJuniors && juniors && juniors.length"
            class="flex flex-col gap-2 w-full">
            <input v-if="bookMyself" id="userIds" :value="user.id" name="userIds">
            <input
              v-for="j in juniors.filter(x => x.shouldBook)"
              id="userIds"
              :key="j.id + '-input'"
              :value="j.id"
              name="userIds">
            <span class="block text-sm leading-6 text-gray-900">Who would you like to book onto this event?</span>
            <ul class="flex flex-col gap-3 mb-4">
              <li v-if="!alreadyBooked">
                <input-toggle
                  v-model="bookMyself"
                  :label="bookMyselfLabel" />
              </li>
              <li v-for="junior in juniorsToBook" :key="junior.id">
                <input-toggle
                  v-model="junior.shouldBook"
                  :label="juniorLabel(junior)" />
              </li>
            </ul>

            <div>
              <nuxt-link
                to="/profile#juniors"
                class="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Add new junior
              </nuxt-link>
            </div>
          </div>
          <button
            v-if="!!price"
            type="submit"
            :disabled="disableBookNowButton"
            class="w-full rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {{ bookNowLabel }}
          </button>
          <custom-button
            v-else
            class="w-full font-semibold px-2.5 py-3"
            :disabled="disableBookNowButton"
            :action="onBookNow">
            {{ bookNowLabel }}
          </custom-button>
        </component>

        <!--          <template v-else>-->
        <!--            <div-->
        <!--              v-if="eventCanBookJuniors && juniors && juniors.length"-->
        <!--              class="flex flex-col gap-2 w-full">-->
        <!--              <span class="block text-sm leading-6 text-gray-900">Who would you like to book onto this event?</span>-->
        <!--              <ul class="flex flex-col gap-3 px-4">-->
        <!--                <li>-->
        <!--                  <input-toggle-->
        <!--                    v-model="bookMyself"-->
        <!--                    :label="bookMyselfLabel" />-->
        <!--                </li>-->
        <!--                <li v-for="junior in juniors" :key="junior.id">-->
        <!--                  <input-toggle-->
        <!--                    v-model="junior.shouldBook"-->
        <!--                    :label="`${junior.first_name} ${junior.last_name}`" />-->
        <!--                </li>-->
        <!--              </ul>-->
        <!--            </div>-->

        <!--            <custom-button-->
        <!--              class="w-full font-semibold px-2.5 py-3"-->
        <!--              :disabled="disableBookNowButton"-->
        <!--              :action="onBookNow">-->
        <!--              {{ bookNowLabel }}-->
        <!--            </custom-button>-->
        <!--          </template>-->

        <!--        <template v-if="eventCanBookJuniors">-->
        <!--          <span-->
        <!--            v-if="!alreadyBooked"-->
        <!--            class="text-gray-500 font-semibold text-sm">-->
        <!--            or-->
        <!--          </span>-->
        <!--          <custom-button-->
        <!--            class="w-full rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"-->
        <!--            :action="onBookJunior">-->
        <!--            {{ bookJuniorLabel }}-->
        <!--          </custom-button>-->
        <!--        </template>-->
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
// @ts-ignore
import Dinero from "dinero.js";

const user = useDirectusUser();
const directus = useDirectus();

const emits = defineEmits(["refresh"]);

const props = defineProps<{
  event: any,
  price?: number,
  juniorPrice?: number,
  instance?: number,
  patternType?: string,
  alreadyBooked: boolean,
  bookings: any,
  userId: string
}>();

const showCancelModal = ref(false);

const loginUrl = computed(() => `/login?redirect=/events/${props.event.id}`);

const { getUsers } = useDirectusUsers();

const eventCanBookJuniors = computed(() => {
  return props.event.allowed_roles?.includes("juniors") ?? false;
});

const { data: juniors } = await useAsyncData(`event-juniors-${props.event.id}-${props.userId}`, async () => {
  return await loadJuniors();
});

async function loadJuniors () {
  let result = null;
  if (eventCanBookJuniors.value) {
    result = await getUsers({
      params: {
        fields: ["id", "first_name", "last_name"],
        filter: {
          parent: {
            _eq: props.userId
          }
        }
      }
    });
  }

  return result;
}

const juniorsToBook = computed(() => {
  return juniors.value.filter(x => props.bookings.filter(b => b.user.id === x.id).length === 0);
});

const paymentUrl = computed(() => {
  let result = `/api/eventPayment?eventId=${props.event.id}&userId=${props.userId}`;

  if (props.instance) {
    result += `&instance=${props.instance}`;
  }

  if (props.patternType) {
    result += `&patternType=${props.patternType}`;
  }

  return result;
});

const bookMyself = ref(false);

const bookMyselfLabel = computed(() => {
  let result = "Myself";

  if (props.event.price) {
    result += " - " + renderPrice(props.event.price);
  }

  return result;
});

const disableBookNowButton = computed(() => {
  let result = false;

  if (juniors.value && juniors.value.length) {
    const juniorIsBooked = juniors.value.filter(x => x.shouldBook).length;
    result = !juniorIsBooked && !bookMyself.value;
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

function mapAllowedRoleToUserRole (allowedRole: string) {
  switch (allowedRole.toLowerCase()) {
  case "non-members": return "Unapproved";
  case "juniors": return "Junior";
  case "members": return "Member";
  case "no one": return null;
  default: throw new Error("Unknown allowed role: " + allowedRole);
  }
}

const bookNowLabel = computed(() => {
  if (eventCanBookJuniors.value) {
    if (!props.event.price && !props.event.junior_price) {
      return "Book now";
    }

    let result = 0;

    if (props.event.price && bookMyself.value) {
      result += props.event.price;
    }

    if (props.event.junior_price) {
      console.log("juniors", juniors.value);
      for (const junior of juniors.value) {
        console.log("junior", junior);
        if (junior.shouldBook) {
          result += props.event.junior_price;
        }
      }
    }

    return result === 0 ? "Pay now" : `Pay ${renderPrice(result)} now`;
  } else {
    return props.price ? "Pay for myself" : "Book now";
  }
});

const bookJuniorLabel = computed(() => {
  return props.juniorPrice ? "Pay for a junior" : "Book for a junior";
});

function juniorLabel (junior) {
  let result = `${junior.first_name} ${junior.last_name}`;

  if (props.event.junior_price) {
    result += " - " + renderPrice(props.event.junior_price);
  }

  return result;
}

async function onBookNow () {
  if (!props.price) {
    let url = `/events/book?eventId=${props.event.id}&userId=${props.userId}`;

    if (props.instance) {
      url += `&instance=${props.instance}`;
    }

    const userIds = juniorsToBook.value.filter(x => x.shouldBook).map(x => x.id);

    if (bookMyself.value) {
      userIds.push(props.userId);
    }

    const bookingResult = await directus(url, {
      method: "POST",
      body: {
        userIds
      }
    });

    emits("refresh");

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

function renderPrice (amount: number) {
  if (!amount) {
    return null;
  }
  return `£${Dinero({ amount, currency: "GBP" }).toFormat(amount % 100 === 0 ? "0" : "0.00")}`;
}

</script>

<style scoped lang="scss">

</style>
