<template>
  <div class="space-y-6 flex flex-col">
    <strong>This information will remain private and will only be accessible to coaches, instructors, and leaders during events you sign up for.</strong>

    <div class="space-y-8">
      <div class="space-y-4">
        <h3 class="font-bold text-xl">
          Medical information
        </h3>
        <div class="flex flex-col gap-1">
          <span class="block text-sm font-medium leading-6 text-gray-900">Do you have any of the following:</span>
          <input-checkbox
            id="allergies"
            v-model="internalMedicalInfo.allergies"
            name="allergies"
            label="Allergies" />
          <input-checkbox
            id="asthma"
            v-model="internalMedicalInfo.asthma"
            name="asthma"
            label="Asthma" />
          <input-checkbox
            id="epilepsy"
            v-model="internalMedicalInfo.epilepsy"
            name="epilepsy"
            label="Epilepsy" />
          <input-checkbox
            id="diabetes"
            v-model="internalMedicalInfo.diabetes"
            name="diabetes"
            label="Diabetes" />
          <input-checkbox
            id="other"
            v-model="internalMedicalInfo.other"
            name="other"
            label="Other" />
        </div>

        <input-text-area
          id="medical-details"
          v-model="internalMedicalInfo.details"
          name="medical-details"
          label="If you checked any of the above, please give details (e.g. medication required)" />
      </div>

      <div class="space-y-4">
        <h1 class="font-bold text-xl">
          Emergency contacts
        </h1>

        <div class="mt-6 space-y-4">
          <table
            v-if="internalEmergencyContacts && internalEmergencyContacts.length"
            class="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                  Full name
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Contact number
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(item, index) in internalEmergencyContacts" :key="index">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                  {{ item.full_name }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {{ item.contact_number }}
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                  <button
                    type="button"
                    class="text-indigo-600 hover:text-indigo-900"
                    @click="removeContact(index)">
                    Remove<span class="sr-only">, {{ item.full_name }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <span class="block text font-medium leading-6 text-gray-900">Add new emergency contact</span>
          <div class="flex flex-row gap-2">
            <input-field
              id="full-name"
              v-model="newFullName"
              label="Full name"
              name="full-name" />

            <input-field
              id="contact-number"
              v-model="newContactNumber"
              label="Contact number"
              name="contact-number" />
          </div>
          <button
            type="button"
            class="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            @click="addNewContact">
            Add
          </button>

          <p
            v-if="showEmergencyContactValidation"
            class="mt-2 text-sm text-red-600">
            You must add at least one emergency contact
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-col gap-4 mt-14">
    <custom-button
      :loading="loading"
      @click="onSubmit">
      Complete registration
    </custom-button>

    <button
      class="flex-grow rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      type="button"
      @click="onBack">
      Back
    </button>
  </div>
</template>

<script setup lang="ts">
import { EmergencyContact, MedicalInfo } from "~/types";

const emits = defineEmits(["update:medicalInfo", "update:emergencyContacts", "onBack", "onNext"]);

const props = defineProps<{
  medicalInfo: MedicalInfo,
  emergencyContacts: EmergencyContact[],
  loading: boolean
}>();

const internalMedicalInfo = ref(props.medicalInfo);
const internalEmergencyContacts = ref(props.emergencyContacts);

watch(() => props.medicalInfo, (val) => {
  internalMedicalInfo.value = val;
}, { deep: true });

watch(internalMedicalInfo, (val) => {
  emits("update:medicalInfo", val);
}, { deep: true });

watch(() => props.emergencyContacts, (val) => {
  internalEmergencyContacts.value = val;
}, { deep: true });

watch(internalEmergencyContacts, (val) => {
  emits("update:emergencyContacts", val);
}, { deep: true });

const newFullName = ref("");
const newContactNumber = ref("");

const showEmergencyContactValidation = ref(false);

function removeContact (index: number) {
  internalEmergencyContacts.value.splice(index, 1);
}

function addNewContact () {
  if (!newFullName.value || !newContactNumber.value) {
    return;
  }

  internalEmergencyContacts.value.push({
    full_name: newFullName.value,
    contact_number: newContactNumber.value
  });

  newFullName.value = "";
  newContactNumber.value = "";
}

function onBack () {
  emits("onBack");
}

function onSubmit () {
  if (!internalEmergencyContacts.value.length) {
    showEmergencyContactValidation.value = true;
    return;
  }
  emits("onNext");
}

</script>

<style scoped lang="scss">

</style>
