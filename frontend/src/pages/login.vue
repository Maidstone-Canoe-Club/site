<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent>
        <input-field
          id="email"
          v-model="email"
          name="email"
          type="email"
          label="Email address"
          autocomplete="email"
          required
          :v="v$.email" />

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900 required">Password</label>
            <div class="text-sm">
              <nuxt-link to="/forgot-password" class="font-semibold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </nuxt-link>
            </div>
          </div>
          <div class="mt-2">
            <input-field
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              :v="v$.password" />
          </div>
        </div>

        <a-button
          :action="onSubmit"
          class="flex w-full justify-center"
          type="submit">
          Sign in
        </a-button>
        <div v-if="error">
          <p
            v-for="(e, index) in error.errors"
            :key="index">
            {{ e.message }}
          </p>
        </div>
      </form>

      <hr class="mt-10">

      <p class="mt-5 text-center text-sm text-gray-500">
        Don't have an account?
        {{ ' ' }}
        <nuxt-link to="/register" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          Sign up for an account here
        </nuxt-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import { minLength, required, email as emailValidator } from "@vuelidate/validators";
import type { Ref } from "vue";
import { useDirectusAuth, navigateTo, definePageMeta } from "#imports";

definePageMeta({
  middleware: ["public-only"]
});

useHead({ title: "Login" });

const email = ref("");
const password = ref("");

const { login } = useDirectusAuth();

const route = useRoute();

const error: any = ref(null);
const redirect = route.query.redirect as string | undefined | null;

const redirectUrl = computed(() => {
  let result = "/";

  if (redirect) {
    result = decodeURIComponent(redirect);
  }
  return result;
});

const rules = {
  email: {
    required,
    emailValidator
  },
  password: {
    required,
    minLength: minLength(8)
  }
};

const v$: Ref<Validation> = useVuelidate(rules, { email, password });

async function onSubmit () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    try {
      await login({ email: email.value, password: password.value });
      await navigateTo(redirectUrl.value);
    } catch (e) {
      error.value = e.data;
    }
  }
}
</script>

<style scoped lang="scss">

</style>
