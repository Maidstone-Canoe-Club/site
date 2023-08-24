<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900">{{ label }}</label>
    <div
      :class="{'mt-2': !!label}">
      <input
        :id="id"
        v-model="internalValue"
        :type="type"
        :name="name"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        :placeholder="placeholder">
    </div>
  </div>
</template>

<script setup lang="ts">

interface Props {
  modelValue: string | number | null | undefined,
  id: string,
  type?: string,
  name?: string,
  label?: string | null,
  required?: boolean,
  placeholder?: string
}

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  name: null,
  label: null,
  required: false,
  placeholder: null
});

const internalValue = computed<string | number | null>({
  get () {
    return props.modelValue;
  },
  set (val: string | number | null) {
    emits("update:modelValue", val);
  }
});
</script>

<style scoped lang="scss">

</style>
