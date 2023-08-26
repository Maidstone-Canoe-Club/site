<template>
  <div
    v-if="user"
    class="flex flex-col gap-10">
    <div class="grid grid-cols-1 gap-x-8 gap-y-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-base font-semibold leading-7 text-gray-900">
          Personal Information
        </h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">
          Use a permanent address where you can receive mail.
        </p>
      </div>

      <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl" @submit.prevent>
        <div class="px-4 py-6 sm:p-8">
          <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <input-field
                id="first-name"
                v-model="user.first_name"
                autocomplete="given-name"
                label="First name"
                name="first-name" />
            </div>

            <div class="sm:col-span-3">
              <input-field
                id="last-name"
                v-model="user.last_name"
                autocomplete="last-name"
                label="Last name"
                name="last-name" />
            </div>

            <div class="sm:col-span-3">
              <input-field
                id="home-tel"
                v-model="user.home_tel"
                autocomplete="tel"
                label="Home Tel."
                name="home-tel" />
            </div>

            <div class="sm:col-span-3">
              <input-field
                id="mobile-tel"
                v-model="user.mobile"
                autocomplete="mobile-tel"
                label="Mobile"
                name="mobile-tel" />
            </div>

            <div class="col-span-full">
              <input-field
                id="street-address"
                autocomplete="street-address"
                label="Street address"
                name="street-address" />
            </div>

            <div class="sm:col-span-2 sm:col-start-1">
              <input-field
                id="city"
                autocomplete="address-level2"
                label="City"
                name="city" />
            </div>

            <div class="sm:col-span-2">
              <input-field
                id="region"
                autocomplete="address-level1"
                label="County"
                name="region" />
            </div>

            <div class="sm:col-span-2">
              <input-field
                id="post-code"
                autocomplete="postal-code"
                label="Post code"
                name="post-code" />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <custom-button
            type="submit"
            :action="() => onSave('details')">
            Save
          </custom-button>
        </div>
      </form>
    </div>

    <div class="grid grid-cols-1 gap-x-8 gap-y-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-base font-semibold leading-7 text-gray-900">
          Login Information
        </h2>
        <p class="mt-1 text-sm leading-6 text-gray-600">
          <!--          Use a permanent address where you can receive mail.-->
        </p>
      </div>

      <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl" @submit.prevent>
        <div class="px-4 py-6 sm:p-8">
          <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div class="sm:col-span-4">
              <input-field
                id="email"
                v-model="user.email"
                type="email"
                autocomplete="email"
                label="Email address"
                name="email" />
            </div>

            <div class="sm:col-span-3">
              <input-field
                id="new-password"
                v-model="newPassword"
                autocomplete="new-password"
                label="New password"
                type="password"
                name="new-password" />
            </div>

            <div class="sm:col-span-3">
              <input-field
                id="confirm-password"
                v-model="confirmPassword"
                autocomplete="new-password"
                label="Confirm password"
                type="password"
                name="confirm-password" />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <custom-button
            type="submit"
            :action="() => onSave('login')">
            Save
          </custom-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { useDirectusUser, useDirectusUsers } from "#imports";

const { updateUser } = useDirectusUsers();
const user = useDirectusUser();

const newPassword = ref("");
const confirmPassword = ref("");

const emergencyContacts = [
  {
    fullName: "Name here",
    relation: "Person",
    contactNumber: "01234 567890"
  },
  {
    fullName: "Name here",
    relation: "Person",
    contactNumber: "01234 567890"
  }
];

async function onSave (type: string) {
  try {
    user.value = await updateUser<DirectusUser>({
      id: user.value!.id,
      user: cleanUser(user.value, type)
    });
  } catch (e) {
    console.log("details not saved", e);
  }
}

function cleanUser (user: DirectusUser, type: string): object {
  if (type === "details") {
    return {
      first_name: user!.first_name,
      last_name: user!.last_name
    };
  } else if (type === "login") {
    const result = {
      email: user!.email
    };

    if (newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value) {
      result.password = newPassword.value;
    }

    return result;
  } else {
    throw new Error(`Unknown save type: ${type}`);
  }
}

</script>

<style scoped lang="scss">

</style>
