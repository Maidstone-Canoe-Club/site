<template>
  <div class="flex items-center justify-between mt-5 gap-3">
    <button
      v-if="showBackButton"
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      @click="goToPrevStep">
      Back
    </button>
    <button
      class="ml-auto rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      :disabled="!canGoNext"
      @click="goToNextStep">
      {{ isLast ? "Submit" : "Next" }}
    </button>
  </div>
</template>

<script setup lang="ts">

const emits = defineEmits(["prev", "next"]);

defineProps<{
  showBackButton: boolean,
  isLast?: boolean,
  canGoNext: boolean
}>();

function goToPrevStep () {
  emits("prev");
}

function goToNextStep () {
  emits("next");
}

</script>

<style scoped lang="scss">

</style>
