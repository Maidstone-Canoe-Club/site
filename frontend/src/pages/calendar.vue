<template>
  <div>
    <h1>Placeholder calendar</h1>
    <month-calendar :events="events" />
  </div>
</template>

<script setup lang="ts">
const events = ref([]);
</script>

<style scoped lang="scss">

</style>
