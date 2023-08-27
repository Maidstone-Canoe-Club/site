<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent>
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email address</label>
          <div class="mt-2">
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
            <div class="text-sm">
              <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>
          </div>
          <div class="mt-2">
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>

        <custom-button
          :action="onSubmit"
          class="flex w-full justify-center"
          type="submit">
          Sign in
        </custom-button>
      </form>

      <p class="mt-10 text-center text-sm text-gray-500">
        Already a club member?
        {{ ' ' }}
        <nuxt-link to="/member-check" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          Sign up for an account here
        </nuxt-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDirectusAuth, navigateTo } from "#imports";

useHead({ title: "Login" });

const email = ref("");
const password = ref("");

const { login } = useDirectusAuth();

const route = useRoute();

const redirect = route.query.redirect as string || "/";

async function onSubmit () {
  try {
    await login({ email: email.value, password: password.value });
    await navigateTo(redirect);
  } catch (e) {
    console.log("unable to login", e);
  }
}
</script>

<style scoped lang="scss">

</style>
