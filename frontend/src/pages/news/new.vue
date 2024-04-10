<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import { helpers, required, requiredIf } from "@vuelidate/validators";
import type { Ref } from "vue";
import type { NewsItem } from "~/types";

definePageMeta({
  middleware: ["auth"]
});

const showPublish = ref(false);

const title = ref("");
const content = ref("");
const publishDate = ref(null);

function futureValidator (value: string | Date) {
  return showPublish.value ? new Date(value) >= new Date() : true;
}

const rules = {
  title: { required },
  content: { required },
  publishDate: {
    requiredIf: requiredIf(showPublish),
    before: helpers.withMessage("Publish date must be in the future", futureValidator)
  }
};

const v$: Ref<Validation> = useVuelidate(rules, {
  title,
  content,
  publishDate
});

const directus = useDirectus();

const showError = ref(false);
const errorMessage = ref<string | null>(null);

watch(showPublish, (val) => {
  if (!val) {
    publishDate.value = null;
  }
});

async function onCreate () {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    try {
      const result = await directus<{ id: string }>("/news-posts/create", {
        method: "post",
        body: {
          data: {
            title: title.value,
            content: content.value,
            publish_date: publishDate.value,
            status: publishDate.value ? "scheduled" : "published"
          }
        }
      });

      await navigateTo(`/news/${result.id}`);
    } catch (e) {
      errorMessage.value = "Unable to create the news post";
      showError.value = true;
      console.log("error", e);
    }
  }
}

function closeModal () {
  showError.value = false;
  errorMessage.value = null;
}

</script>

<template>
  <div class="mx-auto max-w-3xl mt-8 px-2 sm:px-0">
    <h1 class="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Create news post
    </h1>
    <div class="space-y-4">
      <input-field
        id="title"
        v-model="title"
        required
        name="title"
        label="Title"
        :v="v$.title" />

      <input-wysiwyg
        id="content"
        v-model="content"
        required
        label="Content"
        :v="v$.content" />

      <input-checkbox
        id="show-publish"
        v-model="showPublish"
        label="Schedule publishing of news post"
        name="show-publish" />

      <div v-if="showPublish">
        <input-date
          id="publish-date"
          v-model="publishDate"
          enable-time-picker
          label="Publish date"
          :v="v$.publishDate" />
        <small>
          The site will check for any pending scheduled news posts every 15 minutes.
        </small>
      </div>

      <a-button
        :action="onCreate"
        keep-loading>
        Create
      </a-button>
    </div>

    <dismiss-modal
      :open="showError"
      variant="danger"
      title="An error occured"
      cancel-button="Okay"
      hide-action-button
      @dismiss="closeModal">
      {{ errorMessage }}
    </dismiss-modal>
  </div>
</template>

<style scoped lang="scss">

</style>
