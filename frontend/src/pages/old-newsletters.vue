<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Send newsletter
    </h1>
    <div class="space-y-5">
      <input-dropdown
        v-model="selectedList"
        :options="lists"
        label="Select a list" />
      <input-field
        v-model="subject"
        label="Email subject" />
      <input-wysiwyg
        v-model="content"
        label="Email content" />

      <input-file
        id="attachment"
        v-model="attachment"
        label="Upload attachment" />

      <button
        :disabled="buttonDisabled"
        :class="buttonClass"
        @click="trySendNewsletter">
        {{ sendButtonLabel }}
      </button>

      <pre>{{ attachment }}</pre>
      <dismiss-modal
        :open="showConfirmModal"
        title="Send newsletter"
        :action="sendNewsletter"
        action-button-label="Yes, send!">
        Are you sure you want to send this newsletter to
        {{ formatNumber(subscriberCount) + " " + (subscriberCount === 1 ? "subscriber" : "subscribers") }}
      </dismiss-modal>
    </div>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: ["auth", "admin"]
});

const { getItems } = useDirectusItems();

const { data: lists } = await useAsyncData("newsletters", async () => {
  return await getItems({
    collection: "newsletters"
  });
});

const showConfirmModal = ref(false);

const selectedList = ref({});
const subscribers = ref();

const subject = ref();
const content = ref();
const attachment = ref();

const subscriberCount = computed(() => subscribers.value ? subscribers.value.meta.filter_count : 0);

const rules = {

};

watch(selectedList, async (val) => {
  subscribers.value = await getItems({
    collection: "newsletter_subscriber",
    params: {
      limit: 0,
      meta: "filter_count",
      filter: {
        newsletter: {
          _eq: val.id
        }
      }
    }
  });
});

const sendButtonLabel = computed(() => {
  if (!subscribers.value) {
    return "Send";
  }

  const count = subscriberCount.value;
  if (count === 1) {
    return "Send to 1 subscriber";
  }

  return `Send to ${formatNumber(count)} subscribers`;
});

function trySendNewsletter () {
  showConfirmModal.value = true;
}

function sendNewsletter () {
  console.log("sending newsletter!");
}

function formatNumber (input: string) {
  return parseInt(input, 10).toLocaleString();
}

const buttonDisabled = computed(() => {
  return subscriberCount.value === 0 || !selectedList.value;
});

const buttonClass = computed(() => {
  let result = "relative overflow-hidden rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

  if (buttonDisabled.value) {
    result = "relative overflow-hidden rounded-md bg-indigo-300 text-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
  }

  return result;
});

</script>

<style scoped lang="scss">

</style>
