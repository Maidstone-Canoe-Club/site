<template>
  <SwitchGroup as="div" class="flex items-center">
    <SwitchLabel
      v-if="label"
      as="span"
      class="text-sm mr-3 flex-grow">
      <span
        class="font-medium"
        :class="[disabled ? 'text-gray-500' : 'text-gray-900']">{{ label }}</span>
    </SwitchLabel>
    <Switch
      v-model="internalValue"
      :disabled="disabled"
      :class="switchClass">
      <span aria-hidden="true" :class="[internalValue ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
    </Switch>
  </SwitchGroup>
</template>

<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: boolean,
  label?: string,
  disabled?: boolean
}>();

const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val: boolean) => internalValue.value = val);
watch(internalValue, (val: boolean) => emits("update:modelValue", val));

const switchClass = computed(() => {
  const result = [
    "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
  ];

  if (!props.disabled) {
    result.push("cursor-pointer");
  } else {
    result.push("cursor-not-allowed");
  }

  if (internalValue.value) {
    result.push("bg-indigo-600");
  } else {
    result.push("bg-gray-200");
  }

  return result;
});

</script>

<style scoped lang="scss">

</style>
