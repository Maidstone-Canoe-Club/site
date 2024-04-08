<template>
  <div
    :class="{'invalid': !isValid}">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900 mb-2">{{ label }}</label>
    <client-only>
      <quill-editor
        v-model:content="content"
        class="shadow-sm"
        style="min-height: 300px"
        content-type="html"
        :toolbar="toolbar" />
      <template #fallback>
        <div class="flex p-7 justify-center items-center">
          <loading-spinner color="#aaa" />
        </div>
      </template>
    </client-only>
    <p
      v-if="!isValid"
      :id="`${id}-error`"
      class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import "@vueup/vue-quill/dist/vue-quill.snow.css";
// @ts-ignore
// import ImageUploader from "quill-image-uploader";
import "quill-image-uploader/dist/quill.imageUploader.min.css";
import type { Validation } from "@vuelidate/core";

const { QuillEditor } = await import("@vueup/vue-quill");

const emits = defineEmits(["update:modelValue"]);
const props = defineProps<{
  modelValue?: string,
  id: string,
  label?: string
  v?: Validation | null
}>();

const toolbar = computed(() => [
  [{ header: 1 }, { header: 2 }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"]
]);

const directusUrl = useDirectusUrl();
const { token } = useDirectusToken();

// const modules = {
//   name: "imageUploader",
//   module: ImageUploader,
//   options: {
//     upload: (file) => {
//       return new Promise((resolve, reject) => {
//         const formData = new FormData();
//         formData.append("title", file.name);
//         formData.append("type", file.type);
//         formData.append("image", file);
//
//         $fetch(directusUrl + "/files",
//           {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${token.value}`
//             },
//             body: formData
//           })
//           .then((res) => {
//             resolve(directusUrl + "/assets/" + res.data.id);
//           })
//           .catch((err) => {
//             reject(new Error("Upload failed"));
//             console.error("Upload failed", err);
//           });
//       });
//     }
//   }
// };

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

const content = computed({
  get () {
    return props.modelValue?.replace(/[\r\n]/g, "");
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

.invalid {
  ::v-deep(.ql-toolbar) {
    border-top-color: rgb(252 165 165 / 1);
    border-right-color: rgb(252 165 165 / 1);
    border-left-color: rgb(252 165 165 / 1);
  }

  ::v-deep(.ql-container) {
    border-bottom-color: rgb(252 165 165 / 1);
    border-right-color: rgb(252 165 165 / 1);
    border-left-color: rgb(252 165 165 / 1);
  }
}

::v-deep(.ql-container) {
  min-height: inherit;
  font-family: 'Karla', Arial, sans-serif;
  font-size: 14px;
}

::v-deep(.ql-editor) {
  min-height: inherit;
}

::v-deep(p) {
  @apply mb-3;
}

::v-deep(ol),
::v-deep(ul) {
  @apply mb-3;
}

</style>
