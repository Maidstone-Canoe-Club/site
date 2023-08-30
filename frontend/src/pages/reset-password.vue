<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <template v-if="status === Status.Waiting">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h1 class="mt-10 mb-2 text-2xl font-bold">
          Set new password
        </h1>
      </div>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
        <zxcvbn-input
          v-model="password"
          show-strength
          label="New password"
          :v="v$.password" />
        <input-field
          id="confirm-password"
          v-model="confirmedPassword"
          type="password"
          label="Confirm password"
          :v="v$.confirmedPassword" />
        <custom-button class="w-full" :action="onSubmit">
          Submit
        </custom-button>
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
    <template v-else-if="status === Status.Success">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm text-center space-y-6">
        <h1 class="mt-10 mb-2 text-2xl font-bold">
          Success!
        </h1>
        <p>Your password has been changed</p>
        <nuxt-link
          to="/login"
          class="flex justify-center items-center rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Login
        </nuxt-link>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Ref } from "vue";
import { useVuelidate, Validation } from "@vuelidate/core";
import { sameAs, minLength, helpers, required } from "@vuelidate/validators";
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";

enum Status {
  Waiting,
  Success,
  Error
}

const password = ref();
const confirmedPassword = ref();

const { resetPassword } = useDirectusAuth();
const route = useRoute();
const token = route.query.token as string;

const rules = {
  password: {
    required,
    minLength: minLength(8)
  },
  confirmedPassword: {
    required,
    sameAsRef: helpers.withMessage("The passwords must match", sameAs(password))
  }
};

const v$: Ref<Validation> = useVuelidate(rules, { password, confirmedPassword });
const status = ref<Status>(Status.Error);

watch([password, confirmedPassword], () => {
  v$.value.$reset();
});

async function onSubmit () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    try {
      await resetPassword({
        token,
        password: password.value
      });
      status.value = Status.Success;
    } catch {
      status.value = Status.Error;
    }
  }
}
</script>
