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
      <span
        :class="[internalValue ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']">
        <span
          v-if="icons"
          :class="[internalValue ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in', 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity']"
          aria-hidden="true">
          <svg
            class="h-3 w-3 text-gray-400"
            fill="none"
            viewBox="0 0 12 12">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </span>
        <span
          v-if="icons"
          :class="[internalValue ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out', 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity']"
          aria-hidden="true">
          <svg
            class="h-3 w-3 text-indigo-600"
            fill="currentColor"
            viewBox="0 0 12 12">
            <path
              d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  </SwitchGroup>
</template>

<script setup lang="ts">

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: boolean,
  label?: string,
  disabled?: boolean,
  icons?: boolean
}>();

const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val: boolean) => {
  internalValue.value = val;
});
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
