<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900">{{ label }}</label>
    <input
      id="file_input"
      class="p-2 bg-white block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
      type="file"
      :accept="fileTypes"
      @change="onInputChange">
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
import { UploadableFile } from "~/composables/useFileList";

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: UploadableFile[] | UploadableFile | null | undefined,
  id: string,
  label?: string,
  fileTypes?: string,
  v?: Validation | null
}>();

const { files, addFiles } = useFileList();

watch(files, (val) => {
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

function onInputChange (e) {
  addFiles(e.target.files);
}

</script>

<style scoped lang="scss">

</style>
