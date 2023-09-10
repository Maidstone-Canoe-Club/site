<template>
  <div>
    <div
      v-if="user"
      class="flex flex-col items-center gap-3">
      <div
        v-if="alreadyBooked"
        class="flex justify-center items-center gap-2 p-4 rounded-md border w-full">
        <CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
        <p class="text-sm font-medium text-gray-900">
          You're booked on!
        </p>
      </div>
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
    <div v-else class="w-full">
      <nuxt-link
        :to="loginUrl"
        class="w-full rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Login to book
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

const user = useDirectusUser();
const directus = useDirectus();

const emits = defineEmits(["booked"]);

const props = defineProps<{
  eventId: string,
  juniorsCanBook: boolean
  price?: number,
  juniorPrice?: number,
  instance?: number,
  alreadyBooked: boolean
}>();

const loginUrl = computed(() => `/login?redirect=/events/${props.eventId}`);

const paymentUrl = computed(() => {
  let result = `/api/eventPayment?eventId=${props.eventId}&userId=${user.value.id}`;

  if (props.instance) {
    result += `&instance=${props.instance}`;
  }

  return result;
});

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

function wait () {
  return new Promise(resolve => setTimeout(resolve(), 2000));
}

async function onBookNow () {
  if (!props.price) {
    let url = `/events/book?eventId=${props.eventId}&userId=${user.value.id}`;

    if (props.instance) {
      url += `&instance=${props.instance}`;
    }

    const bookingResult = await directus(url, {
      method: "POST"
    });

    if (bookingResult.result) {
      emits("booked");
    } else {
      console.warn(bookingResult.message);
    }
  }
}

function onBookJunior () {

}

</script>

<style scoped lang="scss">

</style>
