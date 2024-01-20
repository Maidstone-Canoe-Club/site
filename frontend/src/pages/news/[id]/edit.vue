<script setup lang="ts">
import { required, requiredIf, helpers } from "@vuelidate/validators";
import type { Ref } from "vue";
import { useVuelidate, type Validation } from "@vuelidate/core";
import type { NewsItem } from "~/types";

const route = useRoute();
const router = useRouter();
const { getItemById, updateItem, deleteItems } = useDirectusItems();

const { data: item } = await useAsyncData(`news-edit-item-${route.params.id}`, async () => {
  return await getItemById<NewsItem>({
    collection: "news",
    id: route.params.id as string,
    params: {
      fields: [
        "status",
        "title",
        "content",
        "publish_date"
      ]
    }
  });
});

if (!item.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "News post not found"
  });
}
const showPublish = ref(!!item.value.publish_date);

function futureValidator (value: string | Date) {
  return showPublish.value ? new Date(value) >= new Date() : true;
}

const rules = {
  title: { required },
  content: { required },
  publish_date: {
    requiredIf: requiredIf(showPublish),
    before: helpers.withMessage("Publish date must be in the future", futureValidator)
  }
};

const v$: Ref<Validation> = useVuelidate(rules, item.value);

const wasScheduled = ref(!!item.value.publish_date);

const showDeleteModal = ref(false);
const showError = ref(false);
const errorMessage = ref<string | null>(null);

watch(showPublish, (val) => {
  if (!val) {
    item.value!.publish_date = null;
  }
});

async function onSave () {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    try {
      await updateItem({
        collection: "news",
        id: route.params.id as string,
        item: item.value!
      });

      await navigateTo(`/news/${route.params.id}`);
    } catch (e) {
      console.error("Error updating news post", e);
      errorMessage.value = "Unable to edit the news post";
      showError.value = true;
    }
  }
}

async function onDelete () {
  try {
    await deleteItems({
      collection: "news",
      items: route.params.id as string
    });

    await navigateTo("/news");
  } catch (e) {
    console.error("Error deleting news post", e);
    errorMessage.value = "Unable to delete the news post";
    showError.value = true;
  }
}

function closeDeleteModal () {
  showDeleteModal.value = false;
}

function closeErrorModal () {
  showError.value = false;
}

function tryDelete () {
  showDeleteModal.value = true;
}

const saveButtonLabel = computed(() => {
  if (wasScheduled.value && !showPublish.value) {
    return "Save and Publish";
  }
  return "Save";
});

function onBack () {
  router.back();
}
</script>

<template>
  <div
    v-if="item"
    class="mx-auto max-w-3xl mt-8 px-2 sm:px-0">
    <h1 class="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Edit news post
    </h1>
    <div class="space-y-4">
      <input-field
        id="title"
        v-model="item.title"
        required
        name="title"
        label="Title"
        :v="v$.title" />

      <input-wysiwyg
        id="content"
        v-model="item.content"
        required
        label="Content"
        :v="v$.content" />

      <div>
        <input-checkbox
          id="show-publish"
          v-model="showPublish"
          label="Schedule publishing of news post"
          name="show-publish" />
      </div>

      <div v-if="showPublish">
        <input-date
          id="publish-date"
          v-model="item.publish_date"
          enable-time-picker
          label="Publish date"
          :v="v$.publish_date" />
        <small>
          The site will check for any pending scheduled news posts every 15 minutes.
        </small>
      </div>

      <div class="flex justify-between items-center flex-row-reverse">
        <div class="flex gap-2">
          <a-button
            variant="outline"
            @click="onBack">
            Back
          </a-button>
          <a-button
            :action="onSave">
            {{ saveButtonLabel }}
          </a-button>
        </div>
        <a-button
          variant="danger"
          hide-loader
          :action="tryDelete">
          Delete
        </a-button>
      </div>
    </div>

    <dismiss-modal
      :open="showDeleteModal"
      variant="danger"
      title="Delete post"
      action-button-label="Delete"
      :action="onDelete"
      @dismiss="closeDeleteModal">
      Are you sure you want to delete this post? This action cannot be undone.
    </dismiss-modal>

    <dismiss-modal
      :open="showError"
      variant="danger"
      title="An error occured"
      cancel-button="Okay"
      hide-action-button
      @dismiss="closeErrorModal">
      {{ errorMessage }}
    </dismiss-modal>
  </div>
</template>

<style scoped lang="scss">

</style>
