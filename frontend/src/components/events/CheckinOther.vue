<script setup lang="ts">
import { QrcodeStream } from "vue-qrcode-reader";
import { QrCodeIcon } from "@heroicons/vue/24/outline";

const open = defineModel<boolean>("open", { default: false });

const showCamera = ref(false);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

const processing = ref(false);

const content = ref("");

watch(open, (val) => {
  if (val) {
    showCamera.value = false;
    loading.value = true;
    errorMessage.value = null;
    content.value = "";
  }
});

async function onDetect (promise: Promise<any>) {
  try {
    processing.value = true;
    const {
      content,
      location
    } = await promise;

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });

    console.log("got content", content);
    console.log("got location", location);
  } catch (e) {
    console.error("error scanning code", e);
  } finally {
    processing.value = false;
  }
}

function onError (error: any) {
  console.error("error", error.name);
  if (error.name === "NotAllowedError") {
    errorMessage.value = "Unable to scan, camera is not allowed. Check your device permissions and refresh this page.";
  } else {
    errorMessage.value = "Something went wrong";
  }
}

async function onInit (promise: Promise<MediaTrackCapabilities>) {
  console.log("init");
  try {
    errorMessage.value = null;
    const result = await promise;
    console.log("camera ready!", result);
  } catch (error: any) {
    console.error("error", error.name);
    errorMessage.value = "Something went wrong";
  } finally {
    console.log("done");
    loading.value = false;
  }
}

</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="open = false">
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
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <QrCodeIcon class="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    Scan attendee code
                  </DialogTitle>
                  <div
                    v-if="showCamera"
                    class="max-h-[300px] mt-6 rounded overflow-hidden">
                    <alert-box
                      v-if="errorMessage"
                      class="text-left mb-4"
                      heading="Error"
                      variant="error">
                      {{ errorMessage }}
                    </alert-box>
                    <QrcodeStream
                      v-show="!errorMessage"
                      @camera-on="onInit"
                      @error="onError"
                      @detect="onDetect">
                      <div
                        v-if="loading"
                        class="flex justify-center items-center h-full bg-gray-100 rounded">
                        <loading-spinner
                          color="#6366F1" />
                      </div>
                    </QrcodeStream>
                  </div>
                  <div
                    v-else
                    class="mt-2">
                    <p class="text-sm text-gray-700">
                      Enable camera permissions on your device and scan the attendee's QR code.
                    </p>
                    <a-button
                      class="w-full mt-4"
                      @click="showCamera = true">
                      {{ clickOrTap(true) + " to open camera" }}
                    </a-button>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6">
                <a-button
                  class="w-full"
                  variant="outline"
                  @click="open = false">
                  Back
                </a-button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped lang="scss">

</style>
