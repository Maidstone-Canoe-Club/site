<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <div
      v-if="success"
      class="flex items-center justify-center py-6 sm:py-12 flex-col gap-2 mt-12"
    >
      <CheckCircleIcon
        class="w-24 h-24 mb-4 text-lime-600"
      />
      <h2 class="font-bold text-4xl">
        Message sent!
      </h2>
      <p>We will get back to you as soon as possible</p>
    </div>
    <div v-else>
      <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Contact us
      </h1>
      <form
        method="post"
        class="space-y-4"
        @submit.prevent
      >
        <nuxt-turnstile
          v-model="formData.token"
          :options="turnstileOptions"
        />
        <input-field
          id="from-name"
          v-model="formData.fromName"
          name="fromName"
          label="From name"
          :v="v$.fromName"
        />
        <input-field
          id="from-email"
          v-model="formData.fromEmail"
          type="email"
          name="fromEmail"
          label="From email"
          :v="v$.fromEmail"
        />

        <div class="pt-6 space-y-4">
          <input-dropdown
            v-model="formData.to"
            :options="options"
            label="To"
            :v="v$.to"
          />
          <input-field
            id="subject"
            v-model="formData.subject"
            name="subject"
            label="Subject"
            :v="v$.subject"
          />
          <div>
            <input-text-area
              id="message"
              v-model="formData.message"
              name="mame"
              label="Message"
              :v="v$.message"
            />
            <span
              class="text-sm"
              :class="[charactersLeft < 0 ? 'text-red-500' : 'text-gray-500']"
            >{{ charactersLeftLabel }}</span>
          </div>
        </div>
        <a-button
          type="submit"
          :action="onSubmit"
        >
          Send
        </a-button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import { maxLength, required, email as emailValidator } from "@vuelidate/validators";
import { ofetch } from "ofetch";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

useHead({
  title: "Contact us"
});

const { getItems } = useDirectusItems();

const { data: options } = await useAsyncData("contact-us-options", async () => {
  return await getItems({
    collection: "contact_us_options"
  });
});

const route = useRoute();
const to = route.query.to;

const turnstileOptions = {
  action: "contact-us"
};

const toOptions = [
  "web",
  "fun-session",
  "committee",
  "racing",
  "membership",
  "incident",
  "beginners-course",
  "mailing-list"
];

function getOptionFromQuery() {
  if (to) {
    const index = toOptions.findIndex(val => val === to.toLowerCase().trim());
    if (index >= 0) {
      return options.value?.[index];
    }
  }

  return null;
}

const formData = ref({
  fromName: "",
  fromEmail: "",
  to: getOptionFromQuery() || null,
  subject: getOptionFromQuery()?.default_subject || "",
  message: "",
  token: ""
});

const rules = {
  fromName: { required },
  fromEmail: { required, emailValidator },
  to: { required },
  subject: { required, maxLength: maxLength(998) },
  message: { required, maxLength: maxLength(1000) }
};

const v$: Ref<Validation> = useVuelidate(rules, formData);

const { newError } = useErrors();
const success = ref(false);

watch(() => formData.value.to, (val) => {
  if (val && val.default_subject) {
    formData.value.subject = val.default_subject;
  }
}, { deep: true });

async function onSubmit() {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    try {
      await ofetch("/api/contactUs", {
        method: "POST",
        body: formData.value
      });
      success.value = true;
    }
    catch (e) {
      console.error("something went wrong sending contact us message", e);
      newError({
        title: "Message was not sent",
        message: "Something went wrong sending the contact us message."
      });
    }
  }
}

const charactersLeft = computed(() => 1000 - (formData.value.message?.length ?? 0));

const charactersLeftLabel = computed(() => {
  const left = charactersLeft.value;
  if (left < 0) {
    return `${-left} ${-left === 1 ? "character" : "characters"} over the limit`;
  }
  else {
    return `${left} ${left === 1 ? "character" : "characters"} left`;
  }
});
</script>

<style scoped lang="scss">

</style>
