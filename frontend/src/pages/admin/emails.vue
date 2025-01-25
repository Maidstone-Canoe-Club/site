<script setup lang="ts">
import { required } from "@vuelidate/validators";
import { useVuelidate, type Validation } from "@vuelidate/core";
import type { Ref } from "vue";

definePageMeta({
  middleware: [
    "auth",
    "committee"
  ]
});

const rules = {
  subject: { required },
  content: { required }
};

const sendResult = ref<{ sentToCount: string, unableToSendCount: string }>({});
const data = reactive({
  subject: "",
  content: ""
});

const v$: Ref<Validation> = useVuelidate<{ subject: string, content: string }>(rules, data);

const showConfirmModal = ref(false);
const showResultModal = ref(false);

const { newError } = useErrors();
const directus = useDirectus();

const { data: userCount } = await useAsyncData("user-count", async () => {
  const data = await directus<{ count: string }>("/emails/user-count");
  return data.count;
});

function onTrySubmit () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    showConfirmModal.value = true;
  }
}

async function onSubmit () {
  console.log("On submit");

  try {
    sendResult.value = await directus<{ sentToCount: string, unableToSendCount: string }>("/emails/send", {
      method: "POST",
      body: data
    });
    showResultModal.value = true;
    v$.value.$reset();
    data.subject = "";
    data.content = "";
  } catch (err: any) {
    newError({
      title: "Unable to send email",
      message: "Something went wrong when sending the email, please try again"
    });
  }
}

</script>

<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Email users
    </h1>
    <p>
      This form allows you to send an email to <strong>club members only</strong>.
    </p>

    <form
      method="post"
      class="space-y-6 mt-8"
      @submit.prevent="onTrySubmit">
      <input-field
        id="subject"
        v-model="data.subject"
        name="id"
        required
        label="Subject"
        type="text"
        :v="v$.subject" />
      <!--      <input-text-area-->
      <!--        id="content"-->
      <!--        v-model="data.content"-->
      <!--        name="content"-->
      <!--        required-->
      <!--        label="Content"-->
      <!--        :v="v$.content" />-->
      <input-wysiwyg
        id="content"
        v-model="data.content"
        label="Content"
        :v="v$.content"
        required />
      <a-button type="submit">
        Send
      </a-button>
    </form>

    <dismiss-modal
      :open="showConfirmModal"
      title="Send email"
      :action="onSubmit"
      variant="primary"
      action-button-label="Send">
      Are you sure you want to send this email to <strong>{{ userCount }}</strong> users?
    </dismiss-modal>

    <dismiss-modal
      :open="showResultModal"
      variant="primary"
      hide-action-button
      cancel-button="Continue"
      title="Emails sent">
      <span>Your email was sent to <strong>{{ sendResult.sentToCount }}</strong> users.</span>
      <span v-if="sendResult.unableToSendCount > 0">
        The email could not be sent to {{ sendResult.unableToSendCount }} users.
      </span>
    </dismiss-modal>
  </div>
</template>

<style scoped lang="scss">

</style>
