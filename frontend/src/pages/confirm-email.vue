<template>
  <div class="flex items-center justify-center py-6 sm:py-12 flex-col gap-2">
    <ShieldCheckIcon
      v-if="result || alreadyConfirmed"
      class="w-12 h-12 mb-4 text-lime-600" />
    <ExclamationTriangleIcon
      v-else
      class="w-12 h-12 mb-6 text-orange-500" />
    <h2 class="font-bold text-4xl">
      {{ headingText }}
    </h2>
    <p>{{ message }}</p>

    <nuxt-link
      v-if="result || alreadyConfirmed || unknownToken || hasError"
      to="/"
      class="mt-4 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
      Click here to go home
    </nuxt-link>
    <template v-else>
      <button
        v-if="!sentNewRequest"
        class="mt-4 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="sendNew">
        Click here to send a new verification email
      </button>
      <p
        v-else
        class="mt-4">
        A new confirmation has been sent. Please check your email inbox.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ShieldCheckIcon, ExclamationTriangleIcon } from "@heroicons/vue/20/solid";

type ConfirmResult = {
  result: boolean,
  statusCode: number,
  message: string
}

const route = useRoute();
const token = route.query.t;

const { newError } = useErrors();
const directus = useDirectus();
const sentNewRequest = ref(false);

const res = useAsyncData<ConfirmResult | null>(`confirm-email-${token}`, async () => {
  const url = `/confirm-email?t=${token}`;
  try {
    return await directus<ConfirmResult>(url, {
      method: "POST"
    });
  } catch (err: any) {
    console.error("Error confirming email", err);
  }

  return null;
});

const result = computed(() => res.data.value?.result || false);
const expired = computed(() => res.data.value?.statusCode === 103 || false);
const alreadyConfirmed = computed(() => res.data.value?.statusCode === 102 || false);
const unknownToken = computed(() => res.data.value?.statusCode === 101 || false);
const hasError = computed(() => !!res.error.value);

const message = computed(() => {
  if (result.value) {
    return "You have successfully verified your email address!";
  }

  if (res.error.value) {
    console.log("error data", res.error.value.data);
    return "Something went wrong: " + res.error.value.data;
  }

  return res.data.value?.message ?? `Something went wrong (${res.data.value?.statusCode ?? -1})`;
});

const headingText = computed(() => {
  if (result.value) {
    return "Verified";
  }

  if (expired.value) {
    return "Link expired";
  }

  if (alreadyConfirmed.value) {
    return "Already confirmed";
  }

  return "Unable to confirm email";
});

async function sendNew () {
  const sendNewUrl = "/confirm-email/new";

  try {
    await directus(sendNewUrl, {
      method: "post",
      query: {
        t: token
      }
    });
    sentNewRequest.value = true;
  } catch (err: any) {
    newError({
      message: "Something went wrong sending a new confirmation link"
    });
  }
}

</script>
