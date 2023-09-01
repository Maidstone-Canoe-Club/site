<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <template v-if="status === Status.Waiting">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h1 class="mt-10 mb-2 text-2xl font-bold">
          Forgot your password?
        </h1>
        <p>We'll send you reset instructions</p>
      </div>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
        <input-field
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter your email"
          :v="v$.email"
          label="Email" />
        <custom-button class="w-full" :action="onSubmit">
          Reset password
        </custom-button>
      </div>
    </template>
    <template
      v-else-if="status === Status.Success">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h1 class="mt-10 mb-2 text-2xl font-bold">
          Check your email
        </h1>
        <p>We've sent a password reset link to </p>
        <strong>{{ email }}</strong>
      </div>
    </template>
    <div
      v-else-if="status === Status.Error"
      class="mt-5 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
      <div class="rounded-md bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              Warning
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>An error occured, please try again</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="mt-5 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
      <nuxt-link
        to="/login"
        class="flex justify-center items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
          <path
            fill="currentColor"
            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
        </svg>
        Back to login
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref } from "vue";
import { useVuelidate, Validation } from "@vuelidate/core";
import { email as emailValidator, minLength, required } from "@vuelidate/validators";
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";

enum Status {
  Waiting,
  Success,
  Error
}

const { requestPasswordReset } = useDirectusAuth();

const email = ref("");

const status = ref<Status>(Status.Waiting);

const rules = {
  email: {
    required,
    emailValidator
  }
};
const v$: Ref<Validation> = useVuelidate(rules, { email });

watch(email, () => {
  v$.value.$reset();
});

const config = useRuntimeConfig();

async function onSubmit () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    try {
      const url = config.public.BASE_URL + "/reset-password";
      await requestPasswordReset({
        email: email.value,
        reset_url: url
      });
      status.value = Status.Success;
    } catch {
      status.value = Status.Error;
    }
  }
}
</script>
