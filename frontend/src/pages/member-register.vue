<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Register
      </h2>
    </div>

    <nav
      aria-label="Progress"
      class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6 flex justify-center">
      <ol role="list" class="flex items-center">
        <li
          v-for="(step, stepIdx) in steps"
          :key="step.name"
          :class="[stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative']">
          <template v-if="step.status === 'complete'">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-indigo-600" />
            </div>
            <a
              href="#"
              class="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-900">
              <CheckIcon class="h-5 w-5 text-white" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </a>
          </template>
          <template v-else-if="step.status === 'current'">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-gray-200" />
            </div>
            <a
              href="#"
              class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white"
              aria-current="step">
              <span class="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </a>
          </template>
          <template v-else>
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-gray-200" />
            </div>
            <a
              href="#"
              class="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
              <span class="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </a>
          </template>
        </li>
      </ol>
    </nav>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <template v-if="currentStep === 1">
        <div class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email address</label>
            <div class="mt-2">
              <input
                id="email"
                v-model="user.email"
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
            </div>
            <div class="mt-2">
              <input
                id="password"
                v-model="user.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="confirm-password" class="block text-sm font-medium leading-6 text-gray-900">Confirm password</label>
            </div>
            <div class="mt-2">
              <input
                id="confirm-password"
                v-model="confirmedPassword"
                name="confirm-password"
                type="password"
                autocomplete="new-password"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>
        </div>
      </template>
      <template v-if="currentStep === 2">
        <div class="space-y-6">
          <input-field
            id="first-name"
            v-model="user.first_name"
            label="First name"
            required
            name="name"
            autocomplete="given-name" />

          <input-field
            id="last-name"
            v-model="user.last_name"
            label="Last name"
            required
            name="last-name"
            autocomplete="family-name" />

          <input-field
            id="dob"
            v-model="user.dob"
            label="Date of birth"
            type="date"
            required
            name="dob"
            autocomplete="bday" />

          <input-field
            id="home-tel"
            v-model="user.home_tel"
            label="Home Tel"
            required
            type="tel"
            name="home-tel"
            autocomplete="tel" />

          <input-field
            id="mobile"
            v-model="user.mobile"
            label="Mobile"
            required
            type="tel"
            name="mobile"
            autocomplete="tel" />
        </div>
      </template>

      <template v-if="currentStep === 3">
        <div class="space-y-6">
          <input-field
            id="street-address"
            v-model="user.street_address"
            label="Street address"
            required
            name="street-address"
            autocomplete="address-line1" />

          <input-field
            id="city"
            v-model="user.city"
            label="City"
            required
            name="city"
            autocomplete="address-level1" />

          <input-field
            id="county"
            v-model="user.county"
            label="County"
            required
            name="county"
            autocomplete="address-level2" />

          <input-field
            id="postcode"
            v-model="user.postcode"
            label="Postcode"
            required
            name="postcode"
            autocomplete="postal-code" />
        </div>
      </template>

      <template v-if="currentStep === 4">
        <div class="space-y-6" />
      </template>

      <div class="flex flex-col gap-4 mt-14">
        <button
          class="flex-grow rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          type="button"
          :disabled="!canGoNextStep"
          @click="nextStep">
          {{ currentStep === steps.length ? "Complete Registration" : "Next" }}
        </button>

        <button
          v-if="canGoBack"
          class="flex-grow rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          type="button"
          @click="previousStep">
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/solid";
import { definePageMeta } from "#imports";

definePageMeta({
  middleware: ["public-only"]
});

const route = useRoute();
const inviteId = route.query.id as string;

if (!inviteId) {
  throw createError({
    message: "Missing invite id",
    statusCode: 400
  });
}

const directus = useDirectus();

const inviteInfo = await directus(`/invites/${inviteId}`);
console.log("got invite info", inviteInfo);

const user = ref({
  email: inviteInfo.email,
  bc_number: inviteInfo.bc_number,
  club_number: inviteInfo.club_number,
  first_name: inviteInfo.first_name,
  last_name: inviteInfo.last_name,
  password: ""
});

const confirmedPassword = ref("");

const currentStep = ref(1);

const steps = computed(() => [
  { id: 1, name: "Login details", status: getStepStatus(1) },
  { id: 2, name: "Personal information", status: getStepStatus(2) },
  { id: 3, name: "Address", status: getStepStatus(3) },
  { id: 4, name: "Private details", status: getStepStatus(4) }
]);

function nextStep () {
  currentStep.value = currentStep.value + 1;
}

function previousStep () {
  currentStep.value = currentStep.value - 1;
}

const canGoBack = computed(() => currentStep.value - 1 >= 1);

function getStepStatus (id: number) {
  if (currentStep.value === id) {
    return "current";
  } else if (id > currentStep.value) {
    return "upcoming";
  } else {
    return "complete";
  }
}

function canGoNextStep () {
  if (currentStep.value === 1) {
    return user.value.email &&
        user.value.password &&
        confirmedPassword.value &&
        user.value.password === confirmedPassword.value;
  } else if (currentStep.value === 2) {
    return user.value.first_name &&
        user.value.last_name &&
        user.value.dob;
  }
}

</script>

<style scoped lang="scss">

</style>
