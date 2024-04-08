<template>
  <div class="space-y-4">
    <h3
      v-if="!hideHeading"
      class="font-bold text-xl">
      Medical information
    </h3>
    <div class="flex flex-col gap-1">
      <span class="block text-sm font-medium leading-6 text-gray-900">
        {{ checkboxesLabel }}
      </span>
      <input-checkbox
        id="allergies"
        v-model="internalValue.allergies"
        name="allergies"
        label="Allergies" />
      <input-checkbox
        id="asthma"
        v-model="internalValue.asthma"
        name="asthma"
        label="Asthma" />
      <input-checkbox
        id="epilepsy"
        v-model="internalValue.epilepsy"
        name="epilepsy"
        label="Epilepsy" />
      <input-checkbox
        id="diabetes"
        v-model="internalValue.diabetes"
        name="diabetes"
        label="Diabetes" />
      <input-checkbox
        id="other"
        v-model="internalValue.other"
        name="other"
        label="Other" />
    </div>

    <input-text-area
      id="medical-details"
      v-model="internalValue.details"
      name="medical-details"
      label="If you checked any of the above, please give details (e.g. medication required)" />
  </div>
</template>

<script setup lang="ts">

export type MedicalInformation = {
  hasData: boolean,
  allergies: boolean,
  asthma: boolean,
  epilepsy: boolean,
  diabetes: boolean,
  other: boolean,
  details?: string
}

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<{
  checkboxesLabel?: string,
  modelValue: MedicalInformation
  hideHeading?: boolean
}>(), {
  checkboxesLabel: "Do you have any of the following:",
  hideHeading: false
});

const internalValue = ref<MedicalInformation>({
  hasData: false,
  allergies: false,
  asthma: false,
  epilepsy: false,
  diabetes: false,
  other: false,
  details: ""
});

watch(() => props.modelValue, (val) => {
  const value = val || {};

  internalValue.value = value;
  internalValue.value.hasData = checkHasData(value);
}, { deep: true, immediate: true });

watch(internalValue, (val) => {
  internalValue.value.hasData = checkHasData(val);
  emits("update:modelValue", val);
}, { deep: true });

function checkHasData (val: MedicalInformation) {
  const hasDetails = !!val.details && val.details.trim() !== "";
  return val.allergies || val.asthma || val.epilepsy || val.diabetes || val.other || hasDetails;
}

</script>

<style scoped lang="scss">

</style>
