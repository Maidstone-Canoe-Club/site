<template>
  <SwitchGroup as="div" class="flex items-center">
    <SwitchLabel
      v-if="label"
      as="span"
      class="text-sm flex-grow">
      <span class="font-medium text-gray-900">{{ label }}</span>
    </SwitchLabel>
    <Switch v-model="internalValue" :class="[internalValue ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2']">
      <span aria-hidden="true" :class="[internalValue ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
    </Switch>
  </SwitchGroup>
</template>

<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: boolean,
  label?: string
}>();

const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val: boolean) => internalValue.value = val);
watch(internalValue, (val: boolean) => emits("update:modelValue", val));
</script>

<style scoped lang="scss">

</style>
