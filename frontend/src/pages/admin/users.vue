<script setup lang="ts">
definePageMeta({
  middleware: [
    "auth",
    "committee"
  ]
});

</script>

<template>
  <users-table-new/>
</template>

<style scoped lang="scss">

</style>
