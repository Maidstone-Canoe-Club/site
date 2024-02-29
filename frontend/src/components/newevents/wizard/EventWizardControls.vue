<script setup lang="ts">
import type { Validation } from "@vuelidate/core";

const emits = defineEmits(["prev", "advance"]);

const props = defineProps<{
  currentStepIndex: number,
  currentStepIsLast: boolean,
  validator: Validation,
}>();

const nextButtonLabel = computed(() => props.currentStepIsLast ? "Submit" : "Next");
const disablePrev = computed(() => props.currentStepIndex === 0);

function onPrev () {
  emits("prev");
}

function onAdvance () {
  props.validator.$touch();
  if (!props.validator.$invalid) {
    emits("advance");
  }
}

</script>

<template>
  <div class="flex flex-row-reverse justify-between gap-2">
    <a-button
      @click="onAdvance">
      {{ nextButtonLabel }}
    </a-button>
    <a-button
      v-if="!disablePrev"
      :disabled="disablePrev"
      @click="onPrev">
      Previous
    </a-button>
  </div>
</template>

<style scoped>

</style>
