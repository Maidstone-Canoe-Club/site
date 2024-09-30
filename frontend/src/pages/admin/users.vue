<script setup lang="ts">
definePageMeta({
  middleware: [
    "auth",
    "committee"
  ]
});

</script>

<template>
  <users-table/>
</template>

<style scoped lang="scss">

</style>
