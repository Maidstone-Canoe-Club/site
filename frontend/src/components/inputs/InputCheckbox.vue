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
  </div>
</template>

<script setup lang="ts">

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: boolean,
  id: string,
  name: string,
  label?: string
}>();

const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
});

watch(internalValue, (val) => {
  emits("update:modelValue", val);
});

</script>

<style scoped lang="scss">

</style>
