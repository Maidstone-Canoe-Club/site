<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-0 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Already a club member?
      </h2>
      <p class="text-center mt-4">
        Enter your details below to create a new account
      </p>
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
          <label for="bc-number" class="block text-sm font-medium leading-6 text-gray-900">BC membership number</label>
          <div class="mt-2">
            <input
              id="bc-number"
              v-model="bcNumber"
              name="bc-number"
              type="text"
              required
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>

        <custom-button
          class="flex w-full justify-center"
          :action="onCheck">
          Check details
        </custom-button>
      </form>

      <div
        v-if="checkResult"
        class="mt-6">
        <template v-if="checkResult.statusCode === 101">
          <div class="rounded-md bg-yellow-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">
                  Member not found
                </h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>Are you using the correct email and British Canoeing membership number?</p>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="checkResult.statusCode === 102">
          <div class="rounded-md bg-yellow-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">
                  Already joined
                </h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>That member already has an account</p>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Something went wrong
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ checkResult.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon, XCircleIcon } from "@heroicons/vue/24/solid";
import { definePageMeta } from "#imports";

definePageMeta({
  middleware: ["public-only"]
});

type CheckResult = {
  result: boolean,
  message?: string,
  statusCode: number,
  id?: string
}

const email = ref("");
const bcNumber = ref("");

const directus = useDirectus();

const checkResult = ref<CheckResult>(null);

async function onCheck () {
  if (!email.value || !bcNumber.value) {
    return;
  }

  try {
    checkResult.value = null;
    const check = await directus<CheckResult>("/invites/check", {
      method: "POST",
      body: {
        email: email.value,
        bcNumber: bcNumber.value
      }
    });

    if (check.result) {
      // navigate to member registraion page?
      navigateTo(`/member-register?id=${check.id}`);
    } else {
      checkResult.value = check;
    }
  } catch (e) {
    checkResult.value = {
      result: false,
      message: e.data,
      statusCode: e.statusCode
    };
  }
}

</script>

<style scoped lang="scss">

</style>
