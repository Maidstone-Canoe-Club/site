<template>
  <div>
    <strong>profile</strong>
    <pre>{{ user }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useDirectusUser, definePageMeta } from "#imports";

definePageMeta({
  middleware: ["auth"]
});

const user = useDirectusUser();
</script>

<style scoped lang="scss">

</style>
