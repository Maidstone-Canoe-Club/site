<template>
  <div>
    <template
      v-if="user">
      <nuxt-link
        to="/profile">
        Profile
      </nuxt-link>
      <button type="button" @click="onLogout">
        Logout
      </button>
    </template>
    <nuxt-link
      v-else
      to="/login">
      Login
    </nuxt-link>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useDirectusUser, useDirectusAuth, navigateTo } from "#imports";

const user = useDirectusUser();
const { logout } = useDirectusAuth();

async function onLogout () {
  await logout();
  await navigateTo("/");
}

</script>

<style scoped lang="scss">

</style>
