<template>
  <div class="col-span-full">
    <label
      v-if="label"
      for="about"
      class="block text-sm font-medium leading-6 text-gray-900">{{ label }}</label>
    <div :class="{'mt-2': !!label}">
      <textarea
        :id="id"
        v-model="internalValue"
        :name="name"
        :rows="rows"
        class="block w-full rounded-md border-0 py-1.5 sm:text-sm sm:leading-6"
        :class="inputClass"
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

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<{
  modelValue: string,
  id: string,
  name: string,
  label: string,
  rows?: number,
  v?: Validation | null
}>(), {
  rows: 3,
  v: null
});

const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
});

watch(internalValue, (val) => {
  emits("update:modelValue", val);
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
  if (isValid.value) {
    return "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";
  } else {
    return "pr-10 text-red-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-red-500";
  }
});

</script>

<style scoped lang="scss">

</style>
