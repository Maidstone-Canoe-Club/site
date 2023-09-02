<template>
  <div>
    <strong>index</strong>
    <button @click="throwAnError">
      Throw Error
    </button>
  </div>
</template>

<script setup lang="ts">

function throwAnError () {
  throw new Error("I was thrown!");
}

</script>

<style scoped lang="scss">

</style>
