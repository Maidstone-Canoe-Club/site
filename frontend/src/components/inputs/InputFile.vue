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
      @change="onInputChange">
  </div>
</template>

<script setup lang="ts">
import { UploadableFile } from "~/composables/useFileList";

const emits = defineEmits(["update:modelValue"]);

defineProps<{
  modelValue: UploadableFile[] | UploadableFile | null | undefined,
  id: string,
  label?: string
}>();

const { files, addFiles } = useFileList();

watch(files, (val) => {
  emits("update:modelValue", val);
});

function onInputChange (e) {
  addFiles(e.target.files);
}

</script>

<style scoped lang="scss">

</style>
