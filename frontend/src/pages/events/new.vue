<template>
  <div class="max-auto w-full max-w-1xl">
    <event-wizard />
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  middleware: ["auth"]
});

</script>

<style scoped lang="scss">

</style>
