<template>
  <div>
    <h1>Send newsletter</h1>
    <div>
      <input-dropdown
        v-model="selectedList"
        :options="lists"
        label="Select a list" />
    </div>
  </div>
</template>

<script setup lang="ts">

const lists = [
  {
    id: "newsletter",
    name: "Newsletter"
  }
];

const selectedList = ref(lists[0]);

</script>

<style scoped lang="scss">

</style>
