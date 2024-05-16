<script setup lang="ts">
import { type Ref, ref } from "vue";
import { required } from "@vuelidate/validators";
import { useVuelidate, type Validation } from "@vuelidate/core";
import { navigateTo } from "#imports";

const directus = useDirectus();
const { getFolderId } = useFolders();
const { createItems } = useDirectusItems();
const { newError } = useErrors();

const { data: folderId } = await useAsyncData("newsletters-folder-id", async () => {
  return await getFolderId("newsletters");
});

const internalValue = ref({
  publish_date: null,
  file: null
});

const rules = {
  publish_date: { required },
  file: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, internalValue);

async function submit () {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    try {
      const f = internalValue.value.file[0];

      const formData = new FormData();
      formData.append("title", f.file.name);
      formData.append("folder", folderId.value);
      formData.append("file", f.file);

      const fileUpload = await directus("/files", {
        method: "POST",
        body: formData
      });

      if (fileUpload && fileUpload.data && fileUpload.data.id) {
        internalValue.value.file = fileUpload.data.id;

        await createItems({
          collection: "newsletter_items",
          items: [internalValue.value]
        });

        await navigateTo("/newsletters");
      }

      console.log("file upload", fileUpload.data.id);
    } catch (err: any) {
      console.error("Error uploading newsletter", err);
      newError({
        title: "Unable to upload newsletter",
        message: "Something went wrong when uploading the newsletter, please try again"
      });
    }
  }
}

</script>

<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-12 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Upload newsletter
    </h1>

    <div class="space-y-4">
      <input-file
        id="file"
        v-model="internalValue.file"
        label="Newsletter file"
        required
        name="file"
        :v="v$.file" />

      <input-date
        id="meeting-date"
        v-model="internalValue.publish_date"
        name="meeting-date"
        required
        label="Publish date"
        :v="v$.meeting_date" />

      <a-button :action="submit">
        Upload
      </a-button>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
