<template>
  <div
    v-if="user && !user.email_confirmed"
    class="w-full">
    <div
      class="p-4 text-center flex-col md:flex-row md:justify-center flex gap-5 bg-mcc-brand-700 text-white items-center">
      <p
        v-if="sentNewRequest"
        class="text-sm flex flex-row justify-center items-center gap-2">
        <CheckCircleIcon class="w-5 h-5" />
        New verification email has been sent!
      </p>

      <template v-else>
        <p class="text-sm flex flex-row gap-2">
          <EnvelopeIcon class="w-5 h-5" />
          <span>
            Please verify your email address by clicking the link sent to
            {{ " " }}
            <strong>{{ user.email }}</strong>
          </span>
        </p>

        <button
          type="button"
          class="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          @click="sendNew">
          Resend verification email
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/vue/24/solid";

const user = useDirectusUser();
const directus = useDirectus();

const sentNewRequest = ref(false);

async function sendNew () {
  const sendNewUrl = "/confirm-email/new";

  await directus(sendNewUrl, {
    method: "post",
    query: {
      id: user.value!.id
    }
  });
  sentNewRequest.value = true;
}
</script>

<style scoped lang="scss">

</style>
