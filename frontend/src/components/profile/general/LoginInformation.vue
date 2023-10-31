<template>
  <form class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl" @submit.prevent>
    <div class="px-4 py-6 sm:p-8">
      <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div class="sm:col-span-4">
          <input-field
            id="email"
            v-model="user.email"
            :disabled="!user.email_confirmed"
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
        :action="onSave">
        Save
      </custom-button>
    </div>
  </form>
</template>

<script setup lang="ts">

const user = useDirectusUser();
const { updateUser } = useDirectusUsers();
const { fetchUser } = useDirectusAuth();

const newPassword = ref("");
const confirmPassword = ref("");

async function onSave () {
  try {
    const userToSave = {
      email: user.value!.email
    };

    if (newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value) {
      userToSave.password = newPassword.value;
    }

    await updateUser({
      id: user.value!.id,
      user: userToSave
    });
    await fetchUser();
  } catch (e) {
    console.error("error updating login information", e);
  }
}

</script>

<style scoped lang="scss">

</style>
