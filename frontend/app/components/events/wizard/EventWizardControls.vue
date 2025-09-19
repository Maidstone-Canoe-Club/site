<script setup lang="ts">
import type { Validation } from "@vuelidate/core";

const emits = defineEmits(["prev", "advance"]);

const props = defineProps<{
  currentStepIndex: number,
  currentStepIsLast: boolean,
  isValid?: boolean,
  validator?: Validation,
  onSubmit:(() => Promise<any>),
  editMode: boolean
}>();

const user = useDirectusUser();

const nextButtonLabel = computed(() => {
  if (props.currentStepIsLast) {
    return props.editMode ? "Update event" : "Create event";
  }

  return "Next";
});
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

const showHiddenWarning = computed(() => {
  const userIsMember = hasExactRole(user.value, "member");
  return props.currentStepIsLast && !props.editMode && userIsMember;
});

</script>

<template>
  <div class="space-y-5">
    <alert-box
      v-if="showHiddenWarning"
      heading="Event hidden"
      variant="warning">
      This event will remain hidden on the calendar until it has been approved.
    </alert-box>
    <div class="flex flex-row-reverse justify-between gap-2">
      <a-button
        :action="currentStepIsLast && internalIsValid ? submit : undefined"
        :keep-loading="currentStepIsLast"
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
  </div>
</template>

<style scoped>

</style>
