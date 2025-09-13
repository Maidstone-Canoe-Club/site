<script setup lang="ts">

import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

const emits = defineEmits(["update:open", "dismiss"]);

const props = defineProps< {
  open: boolean,
  eventTitle: string,
  eventId: string,
  instance?: string | number
}>();

const internalIsOpen = ref(props.open);
const errorMessage = ref<string | null>(null);

watch(() => props.open, (val) => {
  internalIsOpen.value = val;
});

watch(internalIsOpen, (val) => {
  emits("update:open");
  if (!val) {
    emits("dismiss");
  } else {
    errorMessage.value = null;
    firstName.value = false;
    lastName.value = false;
    dob.value = false;
    email.value = false;
    bcNumber.value = false;
    homeTel.value = false;
    mobileNumber.value = false;
    medicalInfo.value = false;
    emergencyContacts.value = false;
    parentDetails.value = false;
  }
});

const directus = useDirectus();

const firstName = ref(false);
const lastName = ref(false);
const dob = ref(false);
const email = ref(false);
const bcNumber = ref(false);
const homeTel = ref(false);
const mobileNumber = ref(false);
const medicalInfo = ref(false);
const emergencyContacts = ref(false);
const parentDetails = ref(false);

const hasSelection = computed(() => {
  return firstName.value ||
    lastName.value ||
    dob.value ||
    email.value ||
    bcNumber.value ||
    homeTel.value ||
    mobileNumber.value ||
    medicalInfo.value ||
    emergencyContacts.value ||
    parentDetails.value;
});

async function onDownload () {
  if (!hasSelection.value) {
    return;
  }

  try {
    let url = "/events/download-attendees?eventId=" + props.eventId;

    if (props.instance !== null && props.instance !== undefined) {
      url += "&instance=" + props.instance;
    }

    const rows = await directus<string[][]>(url, {
      method: "POST",
      body: {
        firstName: firstName.value,
        lastName: lastName.value,
        dob: dob.value,
        email: email.value,
        bcNumber: bcNumber.value,
        homeTel: homeTel.value,
        mobileNumber: mobileNumber.value,
        medicalInfo: medicalInfo.value,
        emergencyContacts: emergencyContacts.value,
        parentDetails: parentDetails.value
      }
    });

    let csvContent = "data:text/csv;charset=utf-8,";

    rows.forEach(function (rowArray) {
      const row = rowArray.join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${props.eventTitle} - attendee data`);
    link.click();
    link.remove();

    internalIsOpen.value = false;
  } catch (e) {
    console.error("error downloading attendee data", e);
    errorMessage.value = "Something went wrong downloading the attendee data";
  }
}

function onSelectAll (val: boolean) {
  firstName.value = val;
  lastName.value = val;
  dob.value = val;
  email.value = val;
  bcNumber.value = val;
  homeTel.value = val;
  mobileNumber.value = val;
  medicalInfo.value = val;
  emergencyContacts.value = val;
  parentDetails.value = val;
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
              <template v-if="errorMessage">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    Unable to download
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      {{ errorMessage }}
                    </p>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6">
                  <button
                    ref="cancelButtonRef"
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0"
                    @click="internalIsOpen = false">
                    Continue
                  </button>
                </div>
              </template>

              <template v-else>
                <strong class="mb-4 block">Download attendees</strong>
                <div class="sm:flex sm:items-start">
                  <div class="space-y-2">
                    <p>Choose what attendee data you would like to download:</p>
                    <input-checkbox
                      id="first-name"
                      v-model="firstName"
                      name="first-name"
                      label="First name" />

                    <input-checkbox
                      id="last-name"
                      v-model="lastName"
                      name="last-name"
                      label="Last name" />

                    <input-checkbox
                      id="dob"
                      v-model="dob"
                      name="dob"
                      label="Date of birth" />

                    <input-checkbox
                      id="email"
                      v-model="email"
                      name="email"
                      label="Email" />

                    <input-checkbox
                      id="bc-number"
                      v-model="bcNumber"
                      name="bc-number"
                      label="BC number" />

                    <input-checkbox
                      id="home-tel"
                      v-model="homeTel"
                      name="home-tel"
                      label="Home telephone" />

                    <input-checkbox
                      id="mobile"
                      v-model="mobileNumber"
                      name="mobile"
                      label="Mobile" />

                    <input-checkbox
                      id="medical-info"
                      v-model="medicalInfo"
                      name="medical-info"
                      label="Medical information" />

                    <input-checkbox
                      id="emergency-contacts"
                      v-model="emergencyContacts"
                      name="emergency-contacts"
                      label="Emergency contacts" />

                    <input-checkbox
                      id="parent-details"
                      v-model="parentDetails"
                      name="parent-details"
                      label="Parent details" />

                    <div>
                      <input-checkbox
                        id="select-all"
                        class="pt-2"
                        name="select-all"
                        label="Select all"
                        @update:model-value="onSelectAll" />
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <a-button
                    type="button"
                    :disabled="!hasSelection"
                    :action="onDownload"
                    class="w-full sm:ml-3 sm:w-auto">
                    Download
                  </a-button>
                  <button
                    ref="cancelButtonRef"
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
