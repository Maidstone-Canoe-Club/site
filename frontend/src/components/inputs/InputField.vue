<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900">{{ label }}</label>
    <div
      class="relative rounded-md shadow-sm"
      :class="{'mt-2': !!label}">
      <input
        :id="id"
        v-model="internalValue"
        :type="type"
        :name="name"
        :required="required"
        :disabled="disabled"
        class="block w-full rounded-md border-0 py-1.5 sm:text-sm sm:leading-6"
        :class="inputClass"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-describedby="`${id}-error`">
      <div
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ExclamationCircleIcon
          v-if="!isValid"
          class="h-5 w-5 text-red-500"
          aria-hidden="true" />
        <slot name="icons" />
      </div>
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
import { ExclamationCircleIcon } from "@heroicons/vue/20/solid";
import type { Validation } from "@vuelidate/core";

interface Props {
  modelValue: string | number | null | undefined,
  id: string,
  type?: string,
  name?: string | undefined,
  label?: string | null,
  required?: boolean,
  disabled?: boolean,
  placeholder?: string | undefined,
  autocomplete?: string | undefined,
  v?: Validation | null
}

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  name: undefined,
  label: null,
  required: false,
  disabled: false,
  placeholder: undefined,
  autocomplete: undefined,
  v: null
});

const internalValue = computed<string | number | null>({
  get () {
    return props.modelValue;
  },
  set (val: string | number | null) {
    emits("update:modelValue", val);
  }
});

const error = computed(() => {
  if (props.v && props.v?.$errors?.length >= 1) {
    return props.v.$errors[0].$message;
  }
});

const isValid = computed(() => {
  if (props.v && props.v.$dirty) {
    return !props.v.$invalid;
  }

  return true;
});

const inputClass = computed(() => {
  if (props.disabled) {
    return "text-gray-600 bg-gray-50 ring-1 ring-inset ring-gray-200";
  }

  if (isValid.value) {
    return "text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600";
  } else {
    return "pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-red-500";
  }
});

</script>

<style scoped lang="scss">

</style>
