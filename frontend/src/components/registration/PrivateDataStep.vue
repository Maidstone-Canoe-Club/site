<template>
  <div class="space-y-6 flex flex-col">
    <strong>This information will remain private and will only be accessible to coaches, instructors, and leaders during
      events you sign up for.</strong>

    <div class="space-y-8">
      <medical-information v-model="internalMedicalInfo" />
      <div v-if="showNeedsConsent">
        <span class="text-sm text-red-600">You must select your consent preferences</span>
      </div>

      <div class="space-y-4">
        <h1 class="font-bold text-xl">
          Emergency contacts
        </h1>

        <emergency-contact-information
          v-model="internalEmergencyContacts"
          add-button-label="Add"
          :show-validation="showContactsValidation"
          class="mt-6" />
      </div>
    </div>
  </div>
  <div class="flex flex-col gap-4 mt-14">
    <input-checkbox
      id="news-post-notifications"
      v-model="internalNewsPostNotifications"
      name="news-post-notifications"
      label="I want to receive email notifications when news posts are published." />

    <custom-button
      :loading="loading"
      @click="onSubmit">
      Complete registration
    </custom-button>

    <span class="text-sm">By registering you agree to our <nuxt-link to="/privacy-policy" class="underline text-indigo-500">privacy policy.</nuxt-link></span>

    <button
      class="flex-grow rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      type="button"
      @click="onBack">
      Back
    </button>
  </div>
</template>

<script setup lang="ts">
import type { EmergencyContact, MedicalInfo } from "~/types";

const emits = defineEmits(["update:newsPostNotifications", "update:medicalInfo", "update:emergencyContacts", "onBack", "onNext"]);

const props = defineProps<{
  newsPostNotifications: boolean,
  medicalInfo: MedicalInfo,
  emergencyContacts: EmergencyContact[],
  loading: boolean
}>();

const internalNewsPostNotifications = ref(props.newsPostNotifications);
const internalMedicalInfo = ref(props.medicalInfo);
const internalEmergencyContacts = ref(props.emergencyContacts);
const showContactsValidation = ref(false);
const showNeedsConsent = ref(false);

watch(() => props.newsPostNotifications, (val) => {
  internalNewsPostNotifications.value = val;
});

watch(internalNewsPostNotifications, (val) => {
  emits("update:newsPostNotifications", val);
});

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
  if (val.filter(x => !x.shouldRemove).length > 1) {
    showContactsValidation.value = false;
  }

  emits("update:emergencyContacts", val);
}, { deep: true });

function onBack () {
  emits("onBack");
}

function onSubmit () {
  showNeedsConsent.value = false;
  showContactsValidation.value = false;

  if (internalMedicalInfo.value.first_aid_consent === undefined ||
    internalMedicalInfo.value.photography_consent === undefined) {
    showNeedsConsent.value = true;
    return;
  }

  if (!internalEmergencyContacts.value.length) {
    showContactsValidation.value = true;
    return;
  }
  emits("onNext");
}

</script>

<style scoped lang="scss">

</style>
