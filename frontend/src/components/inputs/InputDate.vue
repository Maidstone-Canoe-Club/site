<template>
  <div>
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
        :class="inputClass"
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
import { Validation } from "@vuelidate/core";
import { ExclamationCircleIcon } from "@heroicons/vue/20/solid";

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
  label: null,
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

const internalValue = computed<Date | number | null>({
  get () {
    return props.modelValue;
  },
  set (val: Date | number | null) {
    emits("update:modelValue", val);
  }
});

const inputClass = computed(() => {
  // if (props.disabled) {
  //   return "text-gray-600 bg-gray-50 ring-1 ring-inset ring-gray-200";
  // }
  //
  // if (isValid.value) {
  //   return "text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600";
  // } else {
  //   return "pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-red-500";
  // }
});

</script>

<style scoped lang="scss">

</style>
