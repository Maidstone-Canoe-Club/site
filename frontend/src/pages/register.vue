<template>
  <div class="flex min-h-full flex-1 flex-col justify-center py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Register
      </h2>
    </div>

    <nav
      aria-label="Progress"
      class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6 flex justify-center">
      <ol role="list" class="flex items-center">
        <li
          v-for="(step, stepIdx) in steps"
          :key="step.name"
          :class="[stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative']">
          <template v-if="step.status === 'complete'">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-indigo-600" />
            </div>
            <a
              href="#"
              class="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-900">
              <CheckIcon class="h-5 w-5 text-white" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </a>
          </template>
          <template v-else-if="step.status === 'current'">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-gray-200" />
            </div>
            <a
              href="#"
              class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white"
              aria-current="step">
              <span class="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </a>
          </template>
          <template v-else>
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-gray-200" />
            </div>
            <a
              href="#"
              class="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
              <span class="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </a>
          </template>
        </li>
      </ol>
    </nav>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
      <template v-if="currentStep === 1">
        <login-details-step
          v-model="user"
          :invite-id="inviteId"
          @invite="setInviteId"
          @on-next="nextStep" />
      </template>

      <template v-if="currentStep === 2">
        <user-details-step
          v-model="user"
          @on-back="previousStep"
          @on-next="nextStep" />
      </template>

      <template v-if="currentStep === 3">
        <address-step
          v-model="user"
          @on-back="previousStep"
          @on-next="nextStep" />
      </template>

      <template v-if="currentStep === 4">
        <private-data-step
          v-model:news-post-notifications="newsPostNotifications"
          v-model:medical-info="medicalInfo"
          v-model:emergency-contacts="emergencyContacts"
          :loading="loading"
          @on-back="previousStep"
          @on-next="onCompleteRegistration" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/solid";
import { definePageMeta } from "#imports";
import type { EmergencyContact, InviteData, MedicalInfo } from "~/types";

definePageMeta({
  middleware: ["public-only"]
});

const route = useRoute();
const inviteId = ref(route.query.inviteId as string);
const directus = useDirectus();
const { login } = useDirectusAuth();

const loading = ref(false);

const user = ref({
  email: "",
  password: "",
  bc_number: null,
  club_number: null,
  first_name: "",
  last_name: "",
  dob: null,
  home_tel: null,
  mobile: null,
  street_address: "",
  city: "",
  county: "",
  postcode: ""
});

const preMedicalCheck = useState<boolean>("pre-med-check", () => false);
const newsPostNotifications = ref(false);

const medicalInfo = ref<MedicalInfo>({
  allergies: false,
  asthma: false,
  epilepsy: false,
  diabetes: false,
  other: false,
  details: "",
  user: null,
  first_aid_consent: undefined,
  photography_consent: undefined
});

const emergencyContacts = ref<EmergencyContact[]>([]);

if (inviteId.value) {
  const directus = useDirectus();
  const inviteInfo = await directus<InviteData>(`/invites?id=${inviteId.value}`);
  user.value.email = inviteInfo.invite.email;
  user.value.bc_number = inviteInfo.invite.bc_number;
  user.value.club_number = inviteInfo.invite.club_number;
  user.value.first_name = inviteInfo.invite.first_name;
  user.value.last_name = inviteInfo.invite.last_name;
}

const currentStep = ref(1);

const steps = computed(() => [
  { id: 1, name: "Login details", status: getStepStatus(1) },
  { id: 2, name: "Personal information", status: getStepStatus(2) },
  { id: 3, name: "Address", status: getStepStatus(3) },
  { id: 4, name: "Private details", status: getStepStatus(4) }
]);

function nextStep () {
  currentStep.value = currentStep.value + 1;
}

function previousStep () {
  currentStep.value = currentStep.value - 1;
}

function getStepStatus (id: number) {
  if (currentStep.value === id) {
    return "current";
  } else if (id > currentStep.value) {
    return "upcoming";
  } else {
    return "complete";
  }
}

async function onCompleteRegistration () {
  loading.value = true;
  try {
    const submitResponse = await directus("/registration", {
      method: "POST",
      body: {
        inviteId: inviteId.value,
        user: user.value,
        newsPostNotifications: newsPostNotifications.value,
        emergencyContacts: emergencyContacts.value,
        medicalInfo: medicalInfo.value
      }
    });

    preMedicalCheck.value = true;

    console.log("submit response", submitResponse);
    console.log("registration complete!");

    await login({
      email: user.value.email,
      password: user.value.password
    });

    await navigateTo("/");
  } catch (e) {
    loading.value = true;
    console.log("something went wrong", e);
  }
}

function setInviteId (newInviteId: string) {
  inviteId.value = newInviteId;
}

</script>

<style scoped lang="scss">

</style>
