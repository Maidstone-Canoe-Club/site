<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import type { Ref } from "vue";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const emits = defineEmits(["update:open", "dismiss"]);

const props = defineProps<{
  open: boolean,
  attendeeCount: number,
  eventId: string,
  instance?: string
}>();

const directus = useDirectus();
const internalIsOpen = ref(props.open);

const data = reactive({
  subject: "",
  message: ""
});

const messageSent = ref(false);
const errorMessage = ref<string | null>(null);

watch(() => props.open, (val) => {
  internalIsOpen.value = val;
});

watch(internalIsOpen, (val) => {
  emits("update:open");
  if (!val) {
    emits("dismiss");
  } else {
    data.subject = "";
    data.message = "";

    errorMessage.value = null;
    messageSent.value = false;
  }
});

const rules = {
  subject: { required },
  message: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, data);

async function onSend () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    let url = "/events/message-attendees?eventId=" + props.eventId;

    if (props.instance) {
      url += "&instance=" + props.instance;
    }

    try {
      await directus(url, {
        method: "POST",
        body: data
      });
    } catch (e) {
      console.error("Error sending event message: " + e.message);
      errorMessage.value = "Something went wrong sending the message";
    }
    messageSent.value = true;
  }
}

</script>

<template>
  <TransitionRoot as="template" :show="internalIsOpen">
    <Dialog as="div" class="relative z-10" @close="internalIsOpen = false">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div v-if="messageSent">
                <template v-if="errorMessage">
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      Message not sent
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        {{ errorMessage }}
                      </p>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      Message sent!
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        Message has been sent to {{ attendeeCount }} attendee{{ attendeeCount === 1 ? "" : "s" }}
                      </p>
                    </div>
                  </div>
                </template>
                <div class="mt-5 sm:mt-6">
                  <button
                    ref="cancelButtonRef"
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0"
                    @click="internalIsOpen = false">
                    Continue
                  </button>
                </div>
              </div>
              <template v-else>
                <div>
                  <strong class="">Send an email to {{
                    attendeeCount + " attendee" + (attendeeCount === 1 ? "" : "s")
                  }}</strong>
                  <p class="mb-4">
                    Currently, attendees will not be able to reply to this email
                  </p>

                  <div class="space-y-6 w-full">
                    <input-field
                      id="subject"
                      v-model="data.subject"
                      name="subject"
                      required
                      label="Subject"
                      :v="v$" />

                    <input-wysiwyg
                      id="content"
                      v-model="data.message"
                      name="content"
                      label="Message"
                      :v="v$" />
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <a-button
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    :action="onSend">
                    Send message
                  </a-button>
                  <button
                    ref="cancelButtonRef"
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    @click="internalIsOpen = false">
                    Cancel
                  </button>
                </div>
              </template>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped lang="scss">

</style>
