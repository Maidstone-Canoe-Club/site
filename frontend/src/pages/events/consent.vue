<script setup lang="ts">
import { format } from "date-fns";

type ConsentInfo = {
  eventName: string
  startDate: string
  fullName: string
  emailAddress: string
  dob: string
  parentName: string
  address: string
  mobile: string
  emergencyContact: string
  emergencyContactNumber: string
  first_aid_consent?: string
  photography_consent?: string
  allergies: string
  asthma: string
  epilepsy: string
  diabetes: string
  other: string
  otherDetails: string
}

definePageMeta({
  middleware: "auth",
  layout: "none"
});

const route = useRoute();
const bookingId = route.query.booking;

if (!bookingId) {
  throw createError({
    statusCode: 404,
    statusMessage: "Missing booking id"
  });
}

const directus = useDirectus();

const infoData = await useAsyncData(`consent-form-${bookingId}`, async () => {
  return await directus<ConsentInfo>(`/events/consent-info?bookingId=${bookingId}`);
});

if (!infoData) {
  throw showError({
    statusCode: 404,
    statusMessage: "Consent form not found"
  });
}

const info = computed(() => infoData.data!.value!);

function onPrintClick () {
  window.print();
}

function formatDate (input: Date | string) {
  return format(new Date(input), "dd/MM/yyyy, h:mmaa");
}

const underEighteen = computed(() => {
  const today = new Date();
  const birthDate = new Date(info.value.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 18;
});

const dob = computed(() => format(new Date(info.value.dob), "dd/MM/yyyy"));

</script>

<template>
  <div class="mx-auto max-w-3xl mt-8 print:mt-0 px-3 sm:px-0">
    <div class="print:hidden flex justify-end mb-6">
      <a-button
        size="lg"
        @click="onPrintClick">
        Print
      </a-button>
    </div>
    <div class="w-full h-full mb-5 space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold">
            {{ info.eventName }}
          </h1>
          <strong>{{ formatDate(info.startDate) }}</strong>
        </div>
        <img
          class="h-32 w-auto"
          src="/images/logo.svg"
          alt="MCC logo">
      </div>

      <div class="space-y-1">
        <div>
          <strong>Full name: </strong>
          <span>{{ info.fullName }}</span>
        </div>

        <div v-if="info.emailAddress">
          <strong>Email address: </strong>
          <span>{{ info.emailAddress }}</span>
        </div>

        <div>
          <strong>Participant under 18: </strong>
          <span>{{ underEighteen ? "Yes" : "No" }}</span>
        </div>

        <div>
          <strong>Date of birth: </strong>
          <span>{{ dob }}</span>
        </div>

        <div v-if="info.parentName">
          <strong>Parent name: </strong>
          <span>{{ info.parentName }}</span>
        </div>

        <div v-if="info.address">
          <strong>Address: </strong>
          <span>{{ info.address }}</span>
        </div>

        <div v-if="info.mobile">
          <strong>Mobile: </strong>
          <span>{{ info.mobile }}</span>
        </div>

        <div>
          <strong>Emergency contact: </strong>
          <span>{{ info.emergencyContact }}</span>
        </div>

        <div>
          <strong>Emergency contact number: </strong>
          <span>{{ info.emergencyContactNumber }}</span>
        </div>

        <div>
          <strong>Medical conditions: </strong>
          <ul class="mx-2 mt-2 flex justify-between flex-col gap-1">
            <li class="flex justify-between items-center w-32">
              Allergies:
              <span class="border border-gray-400 size-8 inline-flex justify-center items-center">
                {{
                  info.allergies === undefined || info.allergies === null
                    ? ""
                    : info.allergies ? "Yes" : "No"
                }}
              </span>
            </li>
            <li class="flex justify-between items-center w-32">
              Asthma:
              <span class="border border-gray-400 size-8 inline-flex justify-center items-center">
                {{
                  info.asthma === undefined || info.asthma === null
                    ? ""
                    : info.asthma ? "Yes" : "No"
                }}
              </span>
            </li>
            <li class="flex justify-between items-center w-32">
              Epilepsy:
              <span class="border border-gray-400 size-8 inline-flex justify-center items-center">
                {{
                  info.epilepsy === undefined || info.epilepsy === null
                    ? ""
                    : info.epilepsy ? "Yes" : "No"
                }}
              </span>
            </li>
            <li class="flex justify-between items-center w-32">
              Diabetes:
              <span class="border border-gray-400 size-8 inline-flex justify-center items-center">
                {{
                  info.diabetes === undefined || info.diabetes === null
                    ? ""
                    : info.diabetes ? "Yes" : "No"
                }}
              </span>
            </li>
            <li class="flex justify-between items-center w-32">
              Other:
              <span class="border border-gray-400 size-8 inline-flex justify-center items-center">
                {{
                  info.other === undefined || info.other === null
                    ? ""
                    : info.other ? "Yes" : "No"
                }}
              </span>
            </li>
            <li class="flex flex-col gap-2">
              Other details:
              <span class="border border-gray-400 p-2 min-h-32 block w-full">
                {{ info.otherDetails }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex gap-5 justify-between">
        <span>I consent to myself / my child receiving appropriate first aid, or, in the event of a medical emergency,
          any treatment deemed necessary by a qualified medical practitioner: </span>
        <span class="border border-gray-400 min-w-8 size-8 inline-flex justify-center items-center">
          <span v-if="info.first_aid_consent === undefined" />
          <span v-else>{{ info.first_aid_consent ? "Yes" : "No" }}</span>
        </span>
      </div>

      <div class="flex gap-5 justify-between">
        <span>I consent that photographs or video taken by authorised personnel of myself / my son / my daughter at
          British Canoeing or club events may be used to promote paddlesport and help improve performance. </span>
        <span class="border border-gray-400 min-w-8 size-8 inline-flex justify-center items-center">
          <span v-if="info.photography_consent === undefined" />
          <span v-else>{{ info.photography_consent ? "Yes" : "No" }}</span>
        </span>
      </div>

      <div class="space-y-3">
        <strong>Declaration</strong>

        <ul class="list-disc mx-8">
          <li>
            I have had the activities explained and agree to myself / my son / my daughter to participate in the
            activities / event.
          </li>
          <li>
            I understand that the club / organisers accept no responsibility for loss, damage or injury caused by or
            during attendance of the organised activity / event except
            where such loss, damage or injury can be shown to result directly from the negligence of the club /
            organisers
          </li>
          <li>
            I confirm to the best of my knowledge that myself / my son / my daughter does not suffer from any medical
            condition other than those declared.
          </li>
          <li>
            I understand that British Canoeing is insured for its civil liabilities as organiser of the event and that
            there is no personal accident cover for participants.
          </li>
          <li>
            I am responsible for completing this form accurately and including all details that might be needed by the
            person in charge. I am responsible for any errors and
            omissions to personal information and accept liability for any direct or indirect consequences that might
            arise from these errors or omissions.
          </li>
          <li>
            I confirm that my son / daughter are not subject to any court order prohibiting publication of their image.
          </li>
          <li>
            I consent to my son / daughter travelling by any form of transport arranged or approved by the organisation
            and related to the specific activity/event.
          </li>
          <li>
            I agree to be at the pick-up / drop-off point at the agreed time.
          </li>
        </ul>
      </div>

      <div class="space-y-4 border border-gray-200 p-4">
        <div class="flex flex-wrap gap-5 w-full">
          <div class="flex flex-grow gap-2 items-end">
            <span class="text-nowrap">Signed:</span>
            <div class="w-full border-b border-dashed border-b-gray-400" />
          </div>
          <div class="flex flex-grow gap-2 items-end">
            <span class="text-nowrap">Relationship to participant:</span>
            <div class="w-full h-full border-b border-dashed border-b-gray-400" />
          </div>
        </div>

        <div class="flex flex-wrap gap-5  w-full">
          <div class="flex flex-grow gap-2 items-end">
            <span class="text-nowrap">Print name:</span>
            <div class="w-full border-b border-dashed border-b-gray-400" />
          </div>
          <div class="flex flex-grow gap-2 items-end">
            <span class="text-nowrap">Date:</span>
            <div class="w-full h-full border-b border-dashed border-b-gray-400" />
          </div>
        </div>
      </div>
    </div>
    <div class="print:hidden flex justify-end my-6">
      <a-button
        size="lg"
        @click="onPrintClick">
        Print
      </a-button>
    </div>
  </div>
</template>

<style>

</style>
