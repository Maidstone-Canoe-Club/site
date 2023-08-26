<template>
  <div class="">
    <strong>login</strong>
    <form @submit.prevent="onSubmit">
      <input-field
        id="email"
        v-model="email"
        autocomplete="email"
        label="Email"
        type="email"
        required />
      <input-field
        id="password"
        v-model="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        required />
      <button type="submit">
        Login
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useDirectusAuth, navigateTo } from "#imports";

useHead({ title: "Login" });

const email = ref("");
const password = ref("");

const { login } = useDirectusAuth();

const route = useRoute();

const redirect = route.query.redirect as string;

async function onSubmit () {
  try {
    await login({ email: email.value, password: password.value });
    await navigateTo(redirect);
  } catch (e) {
    console.log("unable to login", e);
  }
}
</script>

<style scoped lang="scss">

</style>
