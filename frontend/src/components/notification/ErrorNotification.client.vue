<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import type { ErrorContent } from "~/composables/useError";

const props = withDefaults(defineProps<{
  delay?: number
}>(), {
  delay: 100
});

const fetching = ref(false);
const show = ref(false);

const {
  errors,
  clearError
} = useErrors();

const currentError = ref<ErrorContent>();

watch(errors, (val) => {
  if (!currentError.value && val.length && !fetching.value) {
    currentError.value = val[0];
    show.value = true;
  }
}, { deep: true, immediate: true });

function closeError () {
  show.value = false;
}

function onAfterLeave () {
  clearError();
  currentError.value = undefined;

  if (errors.value.length) {
    // Fetching acts as a lock to stop the watcher from populating the
    // currentError ref before the delay
    fetching.value = true;

    setTimeout(() => {
      currentError.value = errors.value[0];
      show.value = true;
      fetching.value = false;
    }, props.delay);
  }
}

</script>

<template>
  <TransitionRoot
    as="template"
    :show="show"
    @after-leave="onAfterLeave">
    <Dialog
      class="relative z-10">
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
              <div class="sm:flex sm:items-start">
                <div
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    {{ currentError?.title ?? "Something went wrong" }}
                  </DialogTitle>
                  <div
                    v-if="currentError?.message"
                    class="mt-2">
                    <p class="text-sm text-gray-700">
                      {{ currentError?.message }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <a-button
                  ref="cancelButtonRef"
                  type="button"
                  variant="outline"
                  class="w-full sm:mt-0 sm:w-auto"
                  @click="closeError">
                  Continue
                </a-button>
                <!--                TODO: Add this when report functionality is done-->
                <!--                <a-button-->
                <!--                  variant="link"-->
                <!--                  class="w-full sm:mt-0 sm:w-auto mt-3">-->
                <!--                  Report-->
                <!--                </a-button>-->
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
