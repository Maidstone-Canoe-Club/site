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
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
    </div>
  </div>
</template>

<script setup lang="ts">

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<{
  modelValue: string,
  id: string,
  name: string,
  label: string,
  rows?: number
}>(), {
  rows: 3
});

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
