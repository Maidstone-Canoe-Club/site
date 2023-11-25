<template>
  <div v-if="internalBookings && internalBookings.length">
    <strong>{{ attendeesLabel }}</strong>
    <ul
      role="list"
      class="divide-y divide-gray-100">
      <li
        v-for="booking in internalBookings"
        :key="booking.email"
        class="flex items-center justify-between gap-x-6 py-5">
        <div class="flex min-w-0 gap-x-2 items-center">
          <user-avatar
            size-class="w-12 h-12"
            :user="booking.user" />
          <div class="min-w-0 flex-auto">
            <div class="flex gap-3 items-center">
              <p class="text-sm font-semibold leading-6 text-gray-900">
                {{ booking.user.first_name }} {{ booking.user.last_name }}
              </p>
            </div>
            <role-badge :user="booking.user" />
          </div>
        </div>
        <button
          v-if="canViewBooking()"
          type="button"
          class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          @click="viewUser(booking.user)">
          View
        </button>
        <button
          v-else
          type="button"
          class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          @click="cancelBooking(booking.user)">
          Cancel booking
        </button>
      </li>
    </ul>

    <TransitionRoot
      as="template"
      :show="showModal">
      <Dialog as="div" class="relative z-10" @close="closeModal">
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
                class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="">
                    <template v-if="loading">
                      <div class="flex justify-center items-center py-20">
                        <loading-spinner
                          color="#999" />
                      </div>
                    </template>

                    <div v-else class="mt-3 sm:ml-4 sm:mt-0">
                      <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                        <span class="flex gap-3 items-center">
                          <user-avatar
                            :user="viewingUser"
                            size-class="w-12 h-12" />
                          {{ viewingUser.first_name }} {{ viewingUser.last_name }}
                          <role-badge :user="viewingUser" />
                        </span>
                      </DialogTitle>

                      <div class="mt-4">
                        <dl class="space-y-4 sm:space-y-5">
                          <div>
                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                              Date of birth
                            </dt>
                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                              {{ formatDate(viewingUser.dob) }}
                            </dd>
                          </div>
                          <div v-if="viewingUser.email">
                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                              Email
                            </dt>
                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                              {{ viewingUser.email }}
                            </dd>
                          </div>
                          <div v-if="viewingUser.mobile">
                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                              Mobile
                            </dt>
                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                              {{ viewingUser.mobile }}
                            </dd>
                          </div>
                          <div v-if="viewingUser.home_tel">
                            <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                              Home tel
                            </dt>
                            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                              {{ viewingUser.home_tel }}
                            </dd>
                          </div>
                          <div v-if="!!viewingUser.parent">
                            <div class="rounded-md bg-blue-50 p-4">
                              <div class="flex">
                                <div class="flex-shrink-0">
                                  <InformationCircleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
                                </div>
                                <div class="ml-3 flex-1 md:flex md:justify-between">
                                  <p class="text-sm text-blue-700">
                                    This user is a junior, click below to view parent contact details.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              class="mt-5 w-full sm:w-auto rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                              @click="viewParent">
                              View parent
                            </button>
                          </div>
                          <template v-if="medicalInfo">
                            <div class="relative">
                              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                                <div class="w-full border-t border-gray-300" />
                              </div>
                              <div class="relative flex justify-center">
                                <span class="bg-white px-2 text-sm text-gray-700">Medical Information</span>
                              </div>
                            </div>
                            <div>
                              <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                Conditions
                              </dt>
                              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                                <div class="flex flex-wrap gap-2">
                                  <medical-badge
                                    v-if="medicalInfo.allergies"
                                    label="Allergies"
                                    :value="medicalInfo.allergies" />
                                  <medical-badge
                                    v-if="medicalInfo.asthma"
                                    label="Asthma"
                                    :value="medicalInfo.asthma" />
                                  <medical-badge
                                    v-if="medicalInfo.epilepsy"
                                    label="Epilepsy"
                                    :value="medicalInfo.epilepsy" />
                                  <medical-badge
                                    v-if="medicalInfo.diabetes"
                                    label="Diabetes"
                                    :value="medicalInfo.diabetes" />
                                  <medical-badge
                                    v-if="medicalInfo.other"
                                    label="Other"
                                    :value="medicalInfo.other" />
                                </div>
                              </dd>
                            </div>

                            <div v-if="medicalInfo.details && medicalInfo.details !== ''">
                              <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                Other details
                              </dt>
                              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                                {{ medicalInfo.details ?? "No other details" }}
                              </dd>
                            </div>
                          </template>
                        </dl>
                      </div>
                      <div class="relative mt-6">
                        <div class="absolute inset-0 flex items-center" aria-hidden="true">
                          <div class="w-full border-t border-gray-300" />
                        </div>
                        <div class="relative flex justify-center">
                          <span class="bg-white px-2 text-sm text-gray-700">Emergency contacts</span>
                        </div>
                      </div>
                      <div
                        v-if="!isJunior(viewingUser)"
                        class="flex w-full flex-col gap-4 border-dashed border-2 border-red-300 rounded px-3 py-5 mt-5 bg-red-50 ">
                        <div
                          v-if="emergencyLoading"
                          class="flex justify-center items-center py-5">
                          <loading-spinner color="#bbb" />
                        </div>
                        <template v-else>
                          <div v-if="emergencyContactInfo">
                            <dl>
                              <div
                                v-for="contact in emergencyContactInfo"
                                :key="contact.id"
                                class="space-y-5 sm:space-y-4">
                                <div>
                                  <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                    Name
                                  </dt>
                                  <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                                    {{ contact.full_name }}
                                  </dd>
                                </div>

                                <div>
                                  <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
                                    Contact number
                                  </dt>
                                  <dd class="mt-1 text-sm text-gray-900 sm:col-span-2">
                                    {{ contact.contact_number }}
                                  </dd>
                                </div>
                              </div>
                            </dl>
                          </div>
                          <button
                            v-else
                            type="button"
                            class="w-full inline-flex justify-center flex-grow items-center gap-x-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            @click="loadEmergencyContactDetails">
                            <ExclamationTriangleIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
                            View Emergency Contact Info
                          </button>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    v-if="canCancelBooking(viewingUser)"
                    type="button"
                    class="inline-flex w-full gap-2 items-center justify-center rounded-md bg-red-50 px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-red-300 text-red-600 shadow-sm hover:bg-red-100 sm:ml-3 sm:w-auto"
                    @click="cancelBooking(viewingUser)">
                    <TrashIcon class="w-4 h-4" />
                    Cancel booking
                  </button>
                  <button
                    ref="cancelButtonRef"
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    @click="closeModal">
                    Close
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <dismiss-modal
      v-model:open="showCancelConfirmModal"
      title="Cancel booking"
      action-button-label="Cancel booking"
      variant="warning"
      :action="onCancelBooking">
      Are you sure you want to cancel this booking?
    </dismiss-modal>
  </div>
</template>

<script setup lang="ts">
import { InformationCircleIcon } from "@heroicons/vue/20/solid";
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { format } from "date-fns";

const emits = defineEmits(["refresh"]);

const props = defineProps<{
  bookings: any,
  eventId: string,
  instance?: string,
  userIsLeader: boolean,
  attendeesCount: number
}>();

const internalBookings = ref(props.bookings);

watch(() => props.bookings, (val) => {
  internalBookings.value = val;
}, { deep: true });

const { getItems } = useDirectusItems();
const { getUserById } = useDirectusUsers();
const user = useDirectusUser();
const directus = useDirectus();

const loading = ref(true);
const emergencyLoading = ref(false);

const showModal = ref(false);
const viewingUser = ref(null);
const emergencyContactInfo = ref(null);
const medicalInfo = ref(null);

const cancelBookingForUser = ref(null);
const showCancelConfirmModal = ref(false);

const attendeesLabel = computed(() => {
  const count = props.attendeesCount;
  return count === 1 ? "1 Attendee" : `${count} Attendees`;
});

async function viewUser (user) {
  medicalInfo.value = null;
  emergencyContactInfo.value = null;
  viewingUser.value = user;
  showModal.value = true;

  loading.value = true;

  try {
    const results = await getItems({
      collection: "medical_info",
      params: {
        filter: {
          user: {
            _eq: viewingUser.value.id
          }
        }
      }
    });

    const result = results?.length ? results[0] : null;

    if (result && (result.allergies || result.asthma ||
        result.epilepsy || result.diabetes ||
        result.other || result.details)) {
      medicalInfo.value = result;
    }
  } catch (e) {
    console.error("error loading medical info", e);
    showModal.value = false;
  } finally {
    loading.value = false;
  }
}

function closeModal () {
  showModal.value = false;
}

function cancelBooking (viewingUser) {
  cancelBookingForUser.value = viewingUser;
  showCancelConfirmModal.value = true;
}

function canCancelBooking (viewingUser) {
  return props.userIsLeader || viewingUser.id === user.value.id;
}

async function onCancelBooking () {
  try {
    let url = `/events/booking/cancel?eventId=${props.eventId}&userId=${cancelBookingForUser.value.id}`;

    if (props.instance) {
      url += `&instance=${props.instance}`;
    }

    await directus(url, {
      method: "POST"
    });
    emits("refresh");
    // internalBookings.value = internalBookings.value.filter(x => x.id !== cancelBookingForUser.value.id);
    cancelBookingForUser.value = null;
  } catch (e) {
    console.error("error cancelling booking", e);
  }
}

function canViewBooking () {
  return hasRole(user.value, "coach") || props.userIsLeader;
}

function formatDate (input: string) {
  return format(new Date(input), "do MMMM yyyy");
}

function formatAddress (user) {
  const lines = [
    user.street_address,
    user.city,
    user.county,
    user.postcode
  ];

  return lines.filter(x => x && x.trim() !== "")
    .join("\n");
}

function isJunior (user) {
  return hasExactRole(user, "junior");
}

async function loadEmergencyContactDetails () {
  emergencyLoading.value = true;
  try {
    emergencyContactInfo.value = await getItems({
      collection: "emergency_contacts",
      params: {
        filter: {
          user: {
            _eq: viewingUser.value.id
          }
        }
      }
    });
  } catch (e) {
    console.error("error loading emergency contact info", e);
  } finally {
    emergencyLoading.value = false;
  }
}

async function viewParent () {
  loading.value = true;
  try {
    viewingUser.value = await getUserById({
      id: viewingUser.value.parent,
      params: {
        fields: [
          "*",
          "role.name"
        ]
      }
    });
  } catch (e) {
    console.log("error loading parent", e);
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped lang="scss">

</style>
