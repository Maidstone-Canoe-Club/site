<script setup lang="ts">
import type { Validation } from "@vuelidate/core";

const emits = defineEmits(["prev", "advance"]);

const props = defineProps<{
  currentStepIndex: number,
  currentStepIsLast: boolean,
  isValid?: boolean,
  validator?: Validation,
  onSubmit:(() => Promise<any>)
}>();

const nextButtonLabel = computed(() => props.currentStepIsLast ? "Submit" : "Next");
const disablePrev = computed(() => props.currentStepIndex === 0);

const internalIsValid = computed(() => {
  if (props.validator) {
    return !props.validator.$invalid;
  }

  return props.isValid;
});
function onPrev () {
  emits("prev");
}

function onAdvance () {
  if (props.currentStepIsLast) {
    return;
  }

  props.validator?.$touch();
  if (internalIsValid.value) {
    emits("advance");
  }
}

async function submit () {
  props.validator?.$touch();
  if (internalIsValid.value) {
    await props.onSubmit();
  }
}

</script>

<template>
  <div class="flex flex-row-reverse justify-between gap-2">
    <a-button
      :action="currentStepIsLast && internalIsValid ? submit : undefined"
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
