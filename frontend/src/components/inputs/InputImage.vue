<script setup lang="ts">
import { PhotoIcon } from "@heroicons/vue/24/solid";

const emits = defineEmits(["change"]);

defineProps<{
  label: string
}>();

const internalValue = ref();

watch(internalValue, (val) => {
  emits("change", val);
}, { deep: true });

function onChange (event) {
  const foo = event.target.files;
  internalValue.value = foo;
  console.log("change event", event, foo);
}

</script>

<template>
  <div class="col-span-full">
    <label for="cover-photo" class="block text-sm font-medium leading-6 text-gray-900">
      {{ label }}
    </label>
    <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
      <div class="text-center">
        <PhotoIcon class="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
        <div class="mt-4 flex text-sm leading-6 text-gray-600">
          <label for="file-upload" class="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
            <span>Upload a file</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              class="sr-only"
              @change="onChange">
          </label>
          <p class="pl-1">
            or drag and drop
          </p>
        </div>
        <p class="text-xs leading-5 text-gray-600">
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
