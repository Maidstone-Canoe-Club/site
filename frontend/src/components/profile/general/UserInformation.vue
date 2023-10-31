<template>
  <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl" @submit.prevent>
    <div class="px-4 py-6 sm:p-8">
      <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div class="sm:col-span-full">
          <role-badge :user="user" />
          <div
            v-if="hasExactRole(user, 'unapproved')"
            class="rounded-md bg-blue-50 p-4 mt-5">
            <div class="flex">
              <div class="flex-shrink-0">
                <InformationCircleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div class="ml-3 flex-1 md:flex md:justify-between">
                <p class="text-sm text-blue-700">
                  You aren't a member yet!
                </p>
                <p class="mt-3 text-sm md:ml-6 md:mt-0">
                  <nuxt-link to="/come-paddle/memberships" class="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                    Click here to see how to join
                    <span aria-hidden="true"> &rarr;</span>
                  </nuxt-link>
                </p>
              </div>
            </div>
          </div>
        </div>
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
          <div class="mt-2 flex items-center gap-x-5">
            <user-avatar
              :user="user"
              :image-size="96"
              size-class="w-24 h-24" />
            <label for="file-upload">
              <span class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                {{ user.avatar ? "Change" : "Upload" }}
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept="image/*"
                class="hidden"
                @change="avatarChanged">
            </label>
            <button
              v-if="user.avatar"
              type="button"
              class="rounded bg-rose-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
              @click="removeAvatar">
              Remove
            </button>
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
</template>

<script setup lang="ts">
import { InformationCircleIcon } from "@heroicons/vue/20/solid";
import { DirectusUser } from "nuxt-directus/dist/runtime/types";

const user = useDirectusUser();
const { updateUser } = useDirectusUsers();
const { fetchUser } = useDirectusAuth();
const { uploadFile } = useFileUploader();
const directus = useDirectus();

const uploadingAvatar = ref(false);

async function avatarChanged (event) {
  const file = new UploadableFile(event.target.files[0], false);

  uploadingAvatar.value = true;
  try {
    const oldId = user.value!.avatar;
    const result = await uploadFile(file);
    user.value.avatar = result.data.id;

    await onSave();

    if (oldId) {
      await directus(`/files/${oldId}`, {
        method: "DELETE"
      });
    }
  } finally {
    uploadingAvatar.value = false;
  }
}

async function removeAvatar () {
  const oldId = user.value!.avatar;
  await updateUser<DirectusUser>({
    id: user.value!.id,
    user: {
      avatar: null
    }
  });
  await fetchUser();
  await directus(`/files/${oldId}`, {
    method: "DELETE"
  });
}

async function onSave () {
  try {
    const userToSave = {
      first_name: user.value!.first_name,
      last_name: user.value!.last_name,
      home_tel: user.value!.home_tel,
      mobile: user.value!.mobile,
      street_address: user.value!.street_address,
      city: user.value!.city,
      county: user.value!.county,
      postcode: user.value!.postcode,
      avatar: user.value!.avatar
    };

    await updateUser({
      id: user.value!.id,
      user: userToSave
    });
    await fetchUser();
  } catch (e) {
    console.error("could not save user details", e);
  }
}

</script>

<style scoped lang="scss">

</style>
