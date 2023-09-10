<template>
  <div>
    <event-wizard />
  </div>
</template>

<script setup lang="ts">

import { definePageMeta } from "#imports";

definePageMeta({
  middleware: ["auth"]
});

const event = ref({});

</script>

<style scoped lang="scss">

</style>
