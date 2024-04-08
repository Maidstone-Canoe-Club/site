<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import { email as emailValidator, maxLength, required } from "@vuelidate/validators";
import { ref, type Ref } from "vue";
import { ofetch } from "ofetch";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

const emits = defineEmits(["sent", "close"]);

const props = defineProps<{
  userId: string
}>();

const turnstileOptions = {
  action: "contact-user"
};

const formData = ref({
  fromName: "",
  fromEmail: "",
  toUser: props.userId,
  subject: "",
  message: "",
  token: ""
});

const rules = {
  fromName: { required },
  fromEmail: { required, emailValidator },
  subject: { required, maxLength: maxLength(998) },
  message: { required, maxLength: maxLength(1000) }
};

const v$: Ref<Validation> = useVuelidate(rules, formData);

const errorMessage = ref<string | null>(null);
const success = ref(false);

async function onSubmit () {
  errorMessage.value = null;

  v$.value.$touch();

  if (!v$.value.$invalid) {
    try {
      await ofetch("/api/contact-user", {
        method: "POST",
        body: formData.value
      });
      success.value = true;
      emits("sent");
    } catch (e) {
      console.error("something went wrong sending contact user message", e);
      errorMessage.value = "Something went wrong sending the message";
    }
  }
}

function onClose () {
  emits("close");
}

</script>

<template>
  <div>
    <div
      v-if="success"
      class="flex items-center justify-center py-6 sm:py-12 flex-col gap-2">
      <CheckCircleIcon
        class="w-24 h-24 mb-1 text-lime-600" />
      <h2 class="font-bold text-2xl">
        Message sent!
      </h2>
      <div>
        <a-button
          :action="onClose"
          variant="outline"
          hide-loader>
          Okay
        </a-button>
      </div>
    </div>
    <form
      v-else
      method="post"
      @submit.prevent>
      <nuxt-turnstile
        v-model="formData.token"
        :options="turnstileOptions" />
      <input
        id="user-id"
        type="hidden"
        name="userId"
        :value="userId">
      <div class="space-y-6">
        <input-field
          id="from-name"
          v-model="formData.fromName"
          name="fromName"
          label="From name"
          :v="v$.fromName" />
        <input-field
          id="from-email"
          v-model="formData.fromEmail"
          type="email"
          name="fromEmail"
          label="From email"
          :v="v$.fromEmail" />

        <input-field
          id="subject"
          v-model="formData.subject"
          name="subject"
          label="Subject"
          :v="v$.subject" />

        <div>
          <input-text-area
            id="message"
            v-model="formData.message"
            name="mame"
            label="Message"
            :v="v$.message" />
          <span class="text-sm text-gray-500">Max 1000 characters</span>
        </div>

        <div class="flex w-full justify-end items-center gap-2">
          <a-button
            variant="outline"
            hide-loader
            :action="onClose">
            Cancel
          </a-button>
          <a-button
            type="submit"
            :action="onSubmit">
            Send
          </a-button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">

</style>
