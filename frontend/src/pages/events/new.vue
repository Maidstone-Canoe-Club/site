<template>
  <div class="max-auto w-full max-w-1xl">
    <event-wizard />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
});
</script>
