<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/outline";
import { required } from "@vuelidate/validators";
import type { Ref } from "vue";
import { useVuelidate, type Validation } from "@vuelidate/core";

const props = defineProps<{
  leaders: any[],
  leaderLabel: string,
  eventId: string,
  instance?: string | number
}>();

const directus = useDirectus();
const { newError } = useErrors();

const open = defineModel<boolean>("open", { required: true });
const messageSent = ref(false);

const leaderOptions = computed(() => {
  return props.leaders?.map(l => ({
    id: l.directus_users_id.id,
    name: `${l.directus_users_id.first_name} ${l.directus_users_id.last_name}`
  }));
});

const selectedLeader = ref(leaderOptions.value[0]);

const data = reactive({
  subject: "",
  message: ""
});

const rules = {
  subject: { required },
  message: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, data);

watch(open, (val) => {
  if (val) {
    v$.value.$reset();
    data.subject = "";
    data.message = "";
    messageSent.value = false;
  }
});

async function onSend () {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    let url = "/events/message/leader?eventId=" + props.eventId;

    if (props.instance !== null && props.instance !== undefined) {
      url += "&instance=" + props.instance;
    }

    try {
      await directus(url, {
        method: "POST",
        body: {
          ...data,
          leaderId: selectedLeader.value.id
        }
      });

      messageSent.value = true;
    } catch (err: any) {
      console.error(`Error sending event leader message: ${e.message}`);
      newError({
        message: "Something went wrong trying to send message, please try again later."
      });
    }
  }
}

</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10">
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
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    Message sent!
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Message has been sent to an event {{ leaderLabel }}
                    </p>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6">
                  <button
                    ref="cancelButtonRef"
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0"
                    @click="open = false">
                    Continue
                  </button>
                </div>
              </div>
              <template v-else>
                <div>
                  <div class="space-y-4 mb-4">
                    <strong class="">Send message to event {{ leaderLabel }}</strong>

                    <p>
                      Use this form to send a message or question to an event {{ leaderLabel }}.
                    </p>

                    <template v-if="leaders && leaders.length > 1">
                      <input-dropdown
                        v-model="selectedLeader"
                        :label="('Select an event ' + leaderLabel + ' to message')"
                        :options="leaderOptions" />
                    </template>
                  </div>

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
                      required
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
                    @click="open = false">
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
