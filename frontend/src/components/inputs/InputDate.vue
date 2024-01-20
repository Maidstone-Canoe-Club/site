<template>
  <div :class="{invalid: !isValid}">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900">
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
        v-bind="$attrs" />
    </div>
    <p
      v-if="!isValid"
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
  v?: Validation | null
}

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  required: false,
  disabled: false,
  v: null
});

const error = computed(() => {
  if (props.v && props.v?.$errors?.length >= 1) {
    return props.v.$errors[0].$message;
  }
});

const isValid = computed(() => !props.v?.$invalid ?? true);

const internalValue = computed<Date | number | null | undefined>({
  get () {
    return props.modelValue;
  },
  set (val: Date | number | null | undefined) {
    emits("update:modelValue", val);
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
