<template>
  <span
    :class="badgeClass">
    <CheckIcon
      v-if="value"
      class="w-4 h-4" />
    <XMarkIcon
      v-else
      class="w-4 h-4" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  label: string,
  value: boolean
}>();

const badgeClass = computed(() => {
  if (props.value) {
    return "inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10";
  } else {
    return "inline-flex items-center justify-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20";
  }
});
</script>

<style scoped lang="scss">

</style>
