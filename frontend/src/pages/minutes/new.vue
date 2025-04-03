<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-12 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Upload new meeting minutes
    </h1>

    <div class="space-y-4">
      <input-dropdown
        id="meeting"
        v-model="internalValue.meeting"
        :options="meetingOptions"
        name="options"
        label="Select a meeting"
        :v="v$.meeting" />

      <input-date
        id="meeting-date"
        v-model="internalValue.meeting_date"
        name="meeting-date"
        label="Date of meeting"
        :v="v$.meeting_date" />

      <input-file
        id="file"
        v-model="internalValue.file"
        label="Minutes file"
        name="file"
        :v="v$.file" />

      <custom-button :action="submit">
        Submit
      </custom-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

useHead({
  title: "Add meeting minutes"
});

const directus = useDirectus();
const { createItems } = useDirectusItems();

const internalValue = ref({
  meeting: {},
  meeting_date: null,
  file: null
});

const rules = {
  meeting: { required },
  meeting_date: { required },
  file: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, internalValue);

const meetingOptions = [
  {
    id: "committee",
    name: "Committee meeting"
  },
  {
    id: "cdg",
    name: "CDG"
  },
  {
    id: "agm",
    name: "AGM"
  }
];

async function submit () {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    try {
      const f = internalValue.value.file[0];

      const formData = new FormData();
      formData.append("title", f.file.name);
      formData.append("file", f.file);

      const fileUpload = await directus("/files", {
        method: "POST",
        body: formData
      });

      if (fileUpload && fileUpload.data && fileUpload.data.id) {
        internalValue.value.file = fileUpload.data.id;
        internalValue.value.meeting = internalValue.value.meeting.id;

        await createItems({
          collection: "minutes",
          items: [internalValue.value]
        });

        await navigateTo("/minutes");
      }

      console.log("file upload", fileUpload.data.id);
    } catch (e) {
      console.error("error uploading file");
    }
  }
}

</script>

<style scoped lang="scss">

</style>
