<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900 mb-2">{{ label }}</label>
    <quill-editor
      v-model:content="content"
      :modules="modules"
      class="shadow-sm"
      style="min-height: 300px"
      content-type="html"
      toolbar="full" />
  </div>
</template>

<script setup lang="ts">
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import ImageUploader from "quill-image-uploader";
const { QuillEditor } = await import("@vueup/vue-quill");

const emits = defineEmits(["update:modelValue"]);
const props = defineProps<{
  modelValue?: string,
  id: string,
  label?: string
}>();

const directusUrl = useDirectusUrl();
const { token } = useDirectusToken();

const modules = {
  name: "imageUploader",
  module: ImageUploader,
  options: {
    upload: (file) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("title", file.name);
        formData.append("type", file.type);
        formData.append("image", file);

        $fetch(directusUrl + "/files",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token.value}`
            },
            body: formData
          })
          .then((res) => {
            resolve(directusUrl + "/assets/" + res.data.id);
          })
          .catch((err) => {
            reject(new Error("Upload failed"));
            console.error("Upload failed", err);
          });
      });
    }
  }
};

const content = computed({
  get () {
    return props.modelValue;
  },
  set (value: string) {
    emits("update:modelValue", value);
  }
});

</script>

<style scoped lang="postcss">
::v-deep(.ql-toolbar) {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background-color: #fff;
}

::v-deep(.ql-container) {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  background-color: #fff;
}

::v-deep(.ql-container) {
  min-height: inherit;
}

::v-deep(.ql-editor){
  min-height: inherit;
}

</style>
