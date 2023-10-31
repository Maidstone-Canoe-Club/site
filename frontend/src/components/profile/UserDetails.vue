<template>
  <div
    v-if="user"
    class="flex flex-col gap-10">
    <div class="grid grid-cols-1 gap-x-8 gap-y-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-base font-semibold leading-7 text-gray-900">
          User information
        </h2>
      </div>
      <user-information />
    </div>

    <div class="grid grid-cols-1 gap-x-8 gap-y-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-base font-semibold leading-7 text-gray-900">
          Login information
        </h2>
      </div>
      <login-information />
    </div>

    <div class="grid grid-cols-1 gap-x-8 gap-y-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-base font-semibold leading-7 text-gray-900">
          Medical information
        </h2>
      </div>
      <profile-medical-info />
    </div>

    <div class="grid grid-cols-1 gap-x-8 gap-y-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-base font-semibold leading-7 text-gray-900">
          Emergency contact information
        </h2>
      </div>
      <profile-emergency-contact-info />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { InformationCircleIcon } from "@heroicons/vue/20/solid";
import { useDirectusUser, useDirectusUsers } from "#imports";
import { useFileUploader } from "~/composables/useFileUploader";

const { uploadFile } = useFileUploader();
const { updateUser } = useDirectusUsers();
const user = useDirectusUser();
const { fetchUser } = useDirectusAuth();
const directus = useDirectus();

const newPassword = ref("");
const confirmPassword = ref("");
const uploadingAvatar = ref(false);

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
    await updateUser<DirectusUser>({
      id: user.value!.id,
      user: cleanUser(user.value, type)
    });
    await fetchUser();
  } catch (e) {
    console.log("details not saved", e);
  }
}

function cleanUser (user: DirectusUser, type: string): object {
  if (type === "details") {
    return {
      first_name: user!.first_name,
      last_name: user!.last_name,
      home_tel: user!.home_tel,
      mobile: user!.mobile,
      street_address: user!.street_address,
      city: user!.city,
      county: user!.county,
      postcode: user!.postcode
    };
  } else if (type === "avatar") {
    return {
      avatar: user!.avatar
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
