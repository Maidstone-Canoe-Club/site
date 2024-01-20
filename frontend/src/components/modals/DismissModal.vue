<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-10" @close="onCancel">
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
              <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  @click="onCancel">
                  <span class="sr-only">Close</span>
                  <XMarkIcon
                    class="h-6 w-6"
                    aria-hidden="true" />
                </button>
              </div>
              <div class="sm:flex sm:items-start">
                <div
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                  :class="{
                    'bg-red-100': variant === 'danger',
                    'bg-blue-100': variant === 'primary',
                    'bg-green-100': variant === 'success',
                    'bg-yellow-100': variant === 'warning',
                  }">
                  <ExclamationTriangleIcon
                    v-if="variant === 'danger'"
                    class="h-6 w-6 text-red-400"
                    aria-hidden="true" />
                  <InformationCircleIcon
                    v-else-if="variant === 'primary'"
                    class="h-6 w-6 text-blue-500"
                    aria-hidden="true" />
                  <ExclamationTriangleIcon
                    v-else-if="variant === 'warning'"
                    class="h-6 w-6 text-yellow-500"
                    aria-hidden="true" />
                  <CheckCircleIcon
                    v-else-if="variant === 'success'"
                    class="h-6 w-6 text-green-500"
                    aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle
                    v-if="title"
                    as="h3"
                    class="text-base font-semibold leading-6 text-gray-900">
                    {{ title }}
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-pretty text-gray-700">
                      <slot />
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <a-button
                  :variant="variant"
                  class="whitespace-nowrap w-full sm:w-auto sm:ml-3"
                  :action="actionWrapper">
                  {{ actionButtonLabel }}
                </a-button>
                <a-button
                  variant="outline"
                  class="mt-3 w-full sm:w-auto sm:mt-0"
                  @click="onCancel">
                  {{ cancelButton }}
                </a-button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const emits = defineEmits(["update:open", "dismiss"]);

const props = withDefaults(defineProps<{
  open: boolean,
  title?: string,
  actionButtonLabel: string
  cancelButton?: string
  action: Function,
  variant: "primary" | "secondary" | "outline" | "danger" | "warning" | "success";
}>(), {
  title: undefined,
  cancelButton: "Cancel"
});

const isOpen = ref(props.open);

watch(() => props.open, (val) => {
  isOpen.value = val;
});

watch(isOpen, (val) => {
  emits("update:open", val);
});

function onCancel () {
  isOpen.value = false;
  emits("dismiss");
}

async function actionWrapper () {
  await props.action();
  onCancel();
}

</script>
