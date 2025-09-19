<script setup lang="ts">
const isBetaTester = useBetaTester();

defineProps<{
  hideIndicator?: boolean
}>();

</script>

<template>
  <div
    v-if="isBetaTester"
    :class="[hideIndicator ? '' : 'group relative ring-2 ring-indigo-100 rounded hover:ring-indigo-400 transition-all p-2']">
    <div
      v-if="!hideIndicator"
      class="absolute select-none bottom-full left-2 bg-indigo-100 text-white rounded-t px-2 group-hover:bg-indigo-400 text-sm font-semibold transition-colors">
      Beta feature
    </div>
    <slot />
  </div>
</template>

<style scoped lang="scss">

</style>
