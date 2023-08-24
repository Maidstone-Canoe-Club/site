<script setup lang="ts">
import { DirectusUser } from "nuxt-directus/dist/runtime/types";

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: DirectusUser
}>();

const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val: DirectusUser) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val: DirectusUser) => {
  emits("update:modelValue", val);
}, { deep: true });

</script>

<template>
  <div class="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
    <div>
      <h2 class="text-base font-semibold leading-7 text-gray-900">
        Profile
      </h2>
      <p class="mt-1 text-sm leading-6 text-gray-500">
        This information will be visible to coaches when you sign up to events
      </p>

      <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
            First name
          </dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input-field
              id="first-name"
              v-model="internalValue.first_name"
              class="w-full"
              required
              name="first-name" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
            Last name
          </dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input-field
              id="last-name"
              v-model="internalValue.last_name"
              class="w-full"
              required
              name="last-name" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
            Date of birth
          </dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input-field
              id="dob"
              v-model="internalValue.dob"
              class="w-full"
              required
              type="date"
              name="dob" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
            Email address
          </dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input-field
              id="email-address"
              v-model="internalValue.email"
              class="w-full"
              type="email"
              required
              name="email-address" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
            Home tel
          </dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input-field
              id="home-tel"
              v-model="internalValue.homeTel"
              type="tel"
              class="w-full"
              name="email-address" />
          </dd>
        </div>
        <div class="pt-6 sm:flex">
          <dt class="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
            Mobile
          </dt>
          <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
            <input-field
              id="mobile"
              v-model="internalValue.mobile"
              class="w-full"
              type="tel"
              name="mobile" />
          </dd>
        </div>
      </dl>
    </div>

    <div>
      <h2 class="text-base font-semibold leading-7 text-gray-900">
        Emergency contacts
      </h2>
      <p class="mt-1 text-sm leading-6 text-gray-500">
        Details of your emergency contacts
      </p>

      <ul role="list" class="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
        <li class="flex justify-between gap-x-6 py-6">
          <div class="font-medium text-gray-900">
            TD Canada Trust
          </div>
          <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">
            Update
          </button>
        </li>
        <li class="flex justify-between gap-x-6 py-6">
          <div class="font-medium text-gray-900">
            Royal Bank of Canada
          </div>
          <button type="button" class="font-semibold text-indigo-600 hover:text-indigo-500">
            Update
          </button>
        </li>
      </ul>

      <div class="flex border-t border-gray-100 pt-6">
        <button type="button" class="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          <span aria-hidden="true">+</span> Add another bank
        </button>
      </div>
    </div>

    <div>
      <h2 class="text-base font-semibold leading-7 text-gray-900">
        Medical information
      </h2>
      <p class="mt-1 text-sm leading-6 text-gray-500">
        Any medical conditions you may have
      </p>

      <dl class="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
        <div class="pt-6 sm:flex">
          <textarea
            id="medical-info"
            name="medical-info"
            rows="3"
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
        </div>
      </dl>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
