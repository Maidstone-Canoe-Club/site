<template>
  <div>
    <strong>You are accepting an invite!</strong>
    <pre>{{ token }}</pre>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const token = route.query.token;
</script>

<style scoped lang="scss">

</style>
