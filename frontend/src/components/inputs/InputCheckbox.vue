<template>
  <div class="relative flex items-start">
    <div class="flex h-6 items-center">
      <input
        :id="id"
        v-model="internalValue"
        :name="name"
        type="checkbox"
        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
    </div>
    <div
      v-if="label"
      class="ml-3 text-sm leading-6">
      <label :for="id" class="font-medium text-gray-900">{{ label }}</label>
      {{ ' ' }}
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

const props = defineProps<{
  modelValue: boolean,
  id: string,
  name: string,
  label?: string,
  v?: Validation | null
}>();

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

</script>

<style scoped lang="scss">

</style>
