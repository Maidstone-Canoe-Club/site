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
                v-model="user.street_address"
                autocomplete="street-address"
                label="Street address"
                name="street-address" />
            </div>

            <div class="sm:col-span-2 sm:col-start-1">
              <input-field
                id="city"
                v-model="user.city"
                autocomplete="address-level2"
                label="City"
                name="city" />
            </div>

            <div class="sm:col-span-2">
              <input-field
                id="region"
                v-model="user.county"
                autocomplete="address-level1"
                label="County"
                name="region" />
            </div>

            <div class="sm:col-span-2">
              <input-field
                id="post-code"
                v-model="user.postcode"
                autocomplete="postal-code"
                label="Post code"
                name="post-code" />
            </div>

            <div class="sm:col-span-full">
              <label for="photo" class="block text-sm font-medium leading-6 text-gray-900">Profile picture</label>
              <div class="mt-2 flex items-center gap-x-3">
                <user-avatar :user="user" />
                <label for="file-upload">
                  <span class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    Change
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="avatarChanged">
                </label>
                <div v-if="uploadingAvatar">
                  <span class="text-gray-500 text-sm">Uploading...</span>
                </div>
              </div>
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
          Login information
        </h2>
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
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import { useDirectusUser, useDirectusUsers } from "#imports";
import { useFileUploader } from "~/composables/useFileUploader";
import { UploadableFile } from "~/composables/useFileManager";

const { uploadFile } = useFileUploader();
const { updateUser } = useDirectusUsers();
const user = useDirectusUser();

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

async function avatarChanged (event) {
  const directus = useDirectus();
  const file = new UploadableFile(event.target.files[0], false);

  uploadingAvatar.value = true;
  try {
    const oldId = user.value!.avatar;
    const result = await uploadFile(file);
    user.value.avatar = result.data.id;

    await onSave("avatar");

    if (oldId) {
      await directus(`/files/${oldId}`, {
        method: "DELETE"
      });
    }
  } finally {
    uploadingAvatar.value = false;
  }
}

</script>

<style scoped lang="scss">

</style>
