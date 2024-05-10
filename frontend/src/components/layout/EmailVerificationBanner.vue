<template>
  <div v-if="user && !user.email_confirmed">
    <TransitionRoot
      as="template"
      :show="open">
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
              <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircleIcon
                      v-if="sentNewRequest"
                      class="h-6 w-6 text-green-600"
                      aria-hidden="true" />
                    <EnvelopeOpenIcon
                      v-else
                      class="h-6 w-6 text-green-600"
                      aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      {{ sentNewRequest ? "Confirmation sent!" : "Confirm your email" }}
                    </DialogTitle>
                    <div class="mt-2 space-y-3">
                      <div
                        v-if="errorMessage"
                        class="rounded-md bg-red-50 p-4">
                        <div class="flex">
                          <div class="flex-shrink-0">
                            <XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">
                              Something went wrong
                            </h3>
                            <div class="mt-2 text-sm text-left text-red-700">
                              <p>{{ errorMessage }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p
                        v-if="sentNewRequest"
                        class="text-sm">
                        A new confirmation email has been sent! Please check your inbox.
                      </p>
                      <template v-else>
                        <p class="text-sm">
                          You need to confirm your email before you can use the site.
                        </p>
                        <p class="text-sm">
                          Please verify your email address by clicking the link sent to
                          {{ " " }}
                          <strong>{{ user.email }}</strong>.
                        </p>
                        <p class="text-sm">
                          If you don't receive an email, please let us know by contacting us at
                          <a
                            class="text-indigo-600 underline"
                            href="mailto:web@maidstonecanoeclub.net">web@maidstonecanoeclub.net</a>.
                        </p>
                      </template>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 space-y-4">
                  <custom-button
                    v-if="!sentNewRequest"
                    type="button"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    :action="sendNew">
                    Resend verification email
                  </custom-button>
                  <button
                    class="inline-flex w-full justify-center rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    @click="onLogout">
                    Or click here logout
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { EnvelopeOpenIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";
import { XCircleIcon } from "@heroicons/vue/20/solid";

const open = ref(true);
const errorMessage = ref<string | null>(null);

const { logout } = useDirectusAuth();
const user = useDirectusUser();
const directus = useDirectus();

const sentNewRequest = ref(false);

async function sendNew () {
  errorMessage.value = null;
  try {
    const sendNewUrl = "/confirm-email/new";

    await directus(sendNewUrl, {
      method: "post",
      query: {
        id: user.value!.id
      }
    });
    sentNewRequest.value = true;
  } catch (e) {
    console.error("error sending new confirmation email", e);
    errorMessage.value = "There was an issue sending a new confirmation email.";
  }
}

async function onLogout () {
  await logout();
  await navigateTo("/");
  open.value = false;
}
</script>

<style scoped lang="scss">

</style>
