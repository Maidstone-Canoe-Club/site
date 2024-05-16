<template>
  <div :class="{invalid: !internalIsValid}">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900"
      :class="{'required': required}">
      {{ label }}
    </label>
    <div
      class="relative"
      :class="{'mt-2': !!label}">
      <date-picker
        :id="id"
        v-model="internalValue"
        class="shadow-sm"
        :enable-time-picker="enableTimePicker"
        :disabled="disabled"
        :min-date="minDate"
        :max-date="maxDate"
        v-bind="$attrs" />
    </div>
    <p
      v-if="!internalIsValid && error"
      :id="`${id}-error`"
      class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Validation } from "@vuelidate/core";

interface Props {
  modelValue: Date | number | null | undefined,
  id: string,
  label?: string,
  required?: boolean,
  disabled?: boolean,
  enableTimePicker?: boolean,
  minDate?: Date | string,
  maxDate?: Date | string,
  v?: Validation | null,
  isValid?: boolean
}

const emits = defineEmits(["update:modelValue", "change"]);

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  required: false,
  disabled: false,
  minDate: undefined,
  maxDate: undefined,
  v: null,
  isValid: true
});

const error = computed(() => {
  if (props.v && props.v?.$errors?.length >= 1) {
    return props.v.$errors[0].$message;
  }
});

const internalIsValid = computed(() => {
  if (props.v && props.v.$dirty) {
    return !props.v.$invalid;
  }

  return props.isValid;
});

const internalValue = computed<Date | number | null | undefined>({
  get () {
    return props.modelValue;
  },
  set (val: Date | number | null | undefined) {
    emits("update:modelValue", val);
    emits("change", val);
  }
});

</script>

<style scoped lang="postcss">
.invalid {
  ::v-deep(.dp__input){
    border-color: rgb(252 165 165 / 1);
  }
}
</style>
