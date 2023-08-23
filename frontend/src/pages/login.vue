<template>
  <strong>login</strong>
  <form @submit.prevent="onSubmit">
    <label for="email">Email</label>
    <input id="email" v-model="email" type="email" required>
    <label for="password">Password</label>
    <input id="password" v-model="password" type="password" required>
    <button type="submit">
      Login
    </button>
  </form>
</template>

<script setup lang="ts">
import { useDirectusAuth, navigateTo } from "#imports";

const email = ref("");
const password = ref("");

const { login } = useDirectusAuth();

async function onSubmit () {
  try {
    await login({ email: email.value, password: password.value });
    await navigateTo("/");
  } catch (e) {
    console.log("unable to login", e);
  }
}
</script>

<style scoped lang="scss">

</style>
