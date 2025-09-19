<template>
  <div class="space-y-4">
    <h3
      v-if="!hideHeading"
      class="font-bold text-xl">
      {{ heading || "Medical information" }}
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

    <div class="space-y-4">
      <div
        class="space-y-3 border rounded-md p-3"
        :class="[firstAidConsent === undefined ? 'bg-red-50 border-red-200' : '']">
        <h4 class="block font-semibold required">
          First aid consent
        </h4>
        <span class="text-sm">
          <template v-if="isSelf">
            I consent to myself receiving appropriate first aid, or, in the event of a medical emergency, any treatment deemed necessary by a qualified medical practitioner.
          </template>
          <template v-else>
            I consent to my child receiving appropriate first aid, or, in the event of a medical emergency, any treatment deemed necessary by a qualified medical practitioner.
          </template>
        </span>
        <div>
          <option-toggle
            v-model="firstAidConsent"
            :options="consentOptions"
            show-icon />
        </div>
      </div>

      <div
        class="space-y-3 border rounded-md p-3"
        :class="[photographyConsent === undefined ? 'bg-red-50 border-red-200' : '']">
        <h4 class="block font-semibold required">
          Photography consent
        </h4>
        <span class="text-sm">
          <template v-if="isSelf">
            I consent that photographs or video taken by authorised personnel of myself at British Canoeing or club events may be used to promote paddlesport and help improve performance.
          </template>
          <template v-else>
            I consent that photographs or video taken by authorised personnel of my son/my daughter at British Canoeing or club events may be used to promote paddlesport and help improve performance.
          </template>
        </span>
        <div>
          <option-toggle
            v-model="photographyConsent"
            :options="consentOptions"
            show-icon />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

export type MedicalInformation = {
  id?: string,
  hasData: boolean,
  allergies: boolean,
  asthma: boolean,
  epilepsy: boolean,
  diabetes: boolean,
  other: boolean,
  first_aid_consent?: boolean | null,
  photography_consent?: boolean | null,
  details?: string,
  user?: string
}

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<{
  checkboxesLabel?: string,
  modelValue: MedicalInformation
  hideHeading?: boolean,
  heading?: string
  isSelf: boolean
}>(), {
  checkboxesLabel: "Do you have any of the following:",
  hideHeading: false,
  heading: undefined
});

const consentOptions = [
  {
    id: "consent",
    label: "I consent"
  },
  {
    id: "no-consent",
    label: "I do not consent"
  }
];

const internalValue = ref<MedicalInformation>({
  hasData: false,
  allergies: false,
  asthma: false,
  epilepsy: false,
  diabetes: false,
  other: false,
  first_aid_consent: undefined,
  photography_consent: undefined,
  details: ""
});

const firstAidConsent = ref<string | undefined>(
  props.modelValue.first_aid_consent !== undefined && props.modelValue.first_aid_consent !== null
    ? props.modelValue.first_aid_consent === true ? "consent" : "no-consent"
    : undefined
);
const photographyConsent = ref<string | undefined>(
  props.modelValue.photography_consent !== undefined && props.modelValue.photography_consent !== null
    ? props.modelValue.photography_consent === true ? "consent" : "no-consent"
    : undefined
);

watch(() => props.modelValue, (val) => {
  const value = val || {};

  internalValue.value.hasData = checkHasData(value);
  internalValue.value = value;
}, { deep: true, immediate: true });

watch(internalValue, (val) => {
  internalValue.value.hasData = checkHasData(val);
  emits("update:modelValue", val);
}, { deep: true, immediate: true });

watch(firstAidConsent, (val) => {
  if (val === "consent") {
    internalValue.value.first_aid_consent = true;
  } else if (val === "no-consent") {
    internalValue.value.first_aid_consent = false;
  } else {
    internalValue.value.first_aid_consent = undefined;
  }
});

watch(photographyConsent, (val) => {
  if (val === "consent") {
    internalValue.value.photography_consent = true;
  } else if (val === "no-consent") {
    internalValue.value.photography_consent = false;
  } else {
    internalValue.value.photography_consent = undefined;
  }
});

function checkHasData (val: MedicalInformation) {
  const hasDetails = !!val.details && val.details.trim() !== "";
  return val.allergies ||
    val.asthma ||
    val.epilepsy ||
    val.diabetes ||
    val.other ||
    hasDetails ||
    val.first_aid_consent !== undefined ||
    val.photography_consent !== undefined;
}

</script>

<style scoped lang="scss">

</style>
