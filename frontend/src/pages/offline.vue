<template>
  <strong>can't connect to directus, please wait...</strong>
</template>

<script setup lang="ts">
import { useDirectus, navigateTo, definePageMeta } from "#imports";

definePageMeta({
  layout: "plain"
});

const directus = useDirectus();

let interval;
await runCheck();

if (process.client) {
  interval = window.setInterval(async () => {
    await runCheck();
  }, 2000);
}

async function runCheck () {
  try {
    await directus("/server/health");
    console.log("up!");
    if (process.client && interval) {
      window.clearInterval(interval);
    }
    navigateTo("/");
  } catch {
    console.log("still down");
  }
}

</script>

<style scoped lang="scss">

</style>
