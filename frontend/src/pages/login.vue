<template>
  <div class="">
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
