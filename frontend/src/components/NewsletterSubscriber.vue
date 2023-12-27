<template>
  <div class="bg-white shadow sm:rounded-lg mt-12">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-base font-semibold leading-6 text-gray-900">
        Stay up to date
      </h3>
      <div class="mt-2 max-w-xl text-sm text-gray-500">
        <p>Subscribe to the MCC newsletter</p>
      </div>
      <div
        v-if="success"
        class="rounded-md bg-green-50 p-4 mt-5">
        <div class="flex">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-5 w-5 text-green-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              You are now subscribed!
            </h3>
          </div>
        </div>
      </div>
      <form
        v-else
        class="mt-5 sm:flex sm:items-center"
        @submit.prevent>
        <div class="w-full sm:max-w-xs">
          <nuxt-turnstile
            v-model="formData.token"
            :options="turnstileOptions" />

          <label for="newsletter-email" class="sr-only">Email</label>
          <input-field
            id="newsletter-email"
            v-model="formData.email"
            name="newsletter-email"
            placeholder="you@example.com" />
        </div>
        <div>
          <a-button
            type="submit"
            class="mt-3 inline-flex w-full sm:ml-3 sm:mt-0 sm:w-auto"
            :action="onNewsletterSubscribe">
            Subscribe
          </a-button>
        </div>
      </form>
      <div
        v-if="warningMessage"
        class="rounded-md bg-yellow-50 p-4 mt-5">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              {{ warningMessage }}
            </h3>
          </div>
        </div>
      </div>
      <div
        v-if="errorMessage"
        class="rounded-md bg-red-50 p-4 mt-5">
        <div class="flex">
          <div class="flex-shrink-0">
            <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              {{ errorMessage }}
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required, email as emailValidator } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import type { Ref } from "vue";
import { XCircleIcon, ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import { ofetch } from "ofetch";
import { ref } from "#imports";

const newsletterListId = 1;

const formData = ref({
  newsletter: newsletterListId,
  email: "",
  token: ""
});

const success = ref(false);
const errorMessage = ref(null);
const warningMessage = ref(null);

const turnstileOptions = {
  action: "newsletter-subscribe"
};

const rules = {
  email: { required, emailValidator }
};

const v$: Ref<Validation> = useVuelidate(rules, formData);

async function onNewsletterSubscribe () {
  warningMessage.value = null;
  errorMessage.value = null;

  v$.value.$touch();

  if (!v$.value.$invalid) {
    try {
      const result = await ofetch("/api/newsletter", {
        method: "POST",
        body: formData.value
      });

      if (result.result) {
        success.value = true;
      } else {
        warningMessage.value = result.message;
      }
    } catch (e) {
      console.error("something went wrong sending contact us message", e);
      errorMessage.value = "Something went wrong sending the message";
    }
  }
}

</script>

<style scoped lang="scss">

</style>
