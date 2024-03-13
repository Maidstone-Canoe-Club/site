<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900">{{ label }}</label>
    <div class="relative">
      <span class="absolute h-full flex justify-center items-center aspect-square text-gray-500">{{ currencySymbol }}</span>
      <input
        :id="id"
        :value="internalValue"
        :required="required"
        :step="0.01"
        :min="0"
        class="block w-full rounded-md border-0 py-1.5 sm:text-sm sm:leading-6 pl-7"
        :class="inputClass"
        type="number"
        v-bind="$attrs"
        @blur="onBlur">
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
// @ts-ignore
import Dinero from "dinero.js";
interface Props {
  modelValue: number | null | undefined,
  id: string,
  label?: string,
  required?: boolean,
  disabled?: boolean,
  currencySymbol?: string
  v?: Validation | null
}

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  required: false,
  disabled: false,
  currencySymbol: "£",
  v: null
});

const error = computed(() => {
  if (props.v && props.v?.$errors?.length >= 1) {
    return props.v.$errors[0].$message;
  }
});

const isValid = computed(() => !props.v?.$invalid || true);

const internalValue = computed(() => formatPrice(props.modelValue));

function onBlur (e) {
  const amount = toPrice(e.target.value);
  emits("update:modelValue", amount);
}

function formatPrice (amount) {
  if (!amount) {
    return null;
  }
  return Dinero({ amount, currency: "GBP" }).toFormat("0.00");
}

function toPrice (amount) {
  return Math.round(amount * Math.pow(10, 2));
}

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
