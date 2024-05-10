<script setup lang="ts">
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import { isEqual, cloneDeep } from "lodash-es";
import type { MedicalInformation } from "~/components/user/MedicalInformation.vue";

const emits = defineEmits(["continue", "cancel"]);

const props = defineProps<{
  users: DirectusUser[],
  continueLabel?: string,
  saveLabel?: string,
  showCancel?: boolean
}>();

const open = defineModel<boolean>("open", { default: false });
const viewingInfoIndex = ref<number>();

const {
  getItems,
  createItems,
  updateItem
} = useDirectusItems();

const user = useDirectusUser();
const originalMedicalInfo = ref<MedicalInformation[]>([]);
const medicalInfo = ref<MedicalInformation[]>([]);
const errorMessage = ref<string>();
const loading = ref(false);
const confirmInfo = ref(false);

const consentSelected = computed(() => {
  let result = false;

  for (const info of medicalInfo.value) {
    if (info.first_aid_consent === undefined || info.photography_consent === undefined) {
      result = true;
      break;
    }
  }

  return result;
});

watch(open, async (val) => {
  if (val) {
    confirmInfo.value = false;
    errorMessage.value = undefined;
    viewingInfoIndex.value = undefined;
    await loadData();
  }
}, { immediate: true });

const isDirty = ref(false);

watch(medicalInfo, (val) => {
  const equal = isEqual(val, originalMedicalInfo.value);
  if (!equal) {
    isDirty.value = true;
    confirmInfo.value = false;
  } else {
    isDirty.value = false;
  }
}, { deep: true });

function blankMedicalInfo (userId: string) {
  return {
    allergies: false,
    asthma: false,
    epilepsy: false,
    diabetes: false,
    other: false,
    details: "",
    user: userId,
    hasData: false,
    first_aid_consent: undefined,
    photography_consent: undefined
  };
}

function getUserLabel (userId: string) {
  const user = props.users.find(u => u.id === userId);
  return user ? `${user.first_name} ${user.last_name}` : "unknown";
}

async function loadData () {
  loading.value = true;
  try {
    const userIds = props.users.map(u => u.id);

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 750);
    });

    const result = await getItems<MedicalInformation>({
      collection: "medical_info",
      params: {
        fields: [
          "id",
          "user",
          "allergies",
          "asthma",
          "details",
          "diabetes",
          "epilepsy",
          "first_aid_consent",
          "photography_consent",
          "other"
        ],
        filter: {
          user: {
            _in: userIds
          }
        }
      }
    });

    if (result && result.length) {
      medicalInfo.value = [
        ...result,
        ...userIds.filter(id => !result.find(i => i.user === id)).map(id => blankMedicalInfo(id))
      ];
    } else {
      medicalInfo.value = userIds.map(id => blankMedicalInfo(id));
    }

    medicalInfo.value = medicalInfo.value.sort((a, b) => {
      const userA = props.users.find(u => u.id === a.user);
      const userB = props.users.find(u => u.id === b.user);
      if (userA.last_name > userB.last_name) {
        return 1;
      } else if (userA.last_name < userB.last_name) {
        return -1;
      } else if (userA.first_name > userB.first_name) {
        return 1;
      } else if (userA.first_name < userB.first_name) {
        return -1;
      } else {
        return 0;
      }
    });

    medicalInfo.value.forEach((i) => {
      i.hasData = checkHasData(i);
      i.details = i.details ?? "";
      i.first_aid_consent = i.first_aid_consent === null ? undefined : i.first_aid_consent;
      i.photography_consent = i.photography_consent === null ? undefined : i.photography_consent;
    });
    originalMedicalInfo.value = cloneDeep(medicalInfo.value);
  } catch (err) {
    errorMessage.value = "There was an error loading your medical information, please try again later.";
    console.error("Error loading medical info");
  } finally {
    loading.value = false;
  }
}

function checkHasData (val: MedicalInformation) {
  const hasDetails = !!val.details && val.details.trim() !== "";
  return val.allergies ||
    val.asthma ||
    val.epilepsy ||
    val.diabetes ||
    val.other ||
    hasDetails ||
    val.first_aid_consent !== undefined ||
    val.photography_consent !== undefined;
}

async function onUpdate () {
  try {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 750);
    });

    const toUpdate = [];
    const toAdd = [];

    for (const info of medicalInfo.value) {
      if (info.id) {
        toUpdate.push(info);
      } else {
        toAdd.push(info);
      }
    }

    if (toAdd.length) {
      await createItems({
        collection: "medical_info",
        items: toAdd
      });
    }

    if (toUpdate.length) {
      for (const item of toUpdate) {
        await updateItem({
          id: item.id!,
          collection: "medical_info",
          item: {
            allergies: item.allergies,
            asthma: item.asthma,
            diabetes: item.diabetes,
            epilepsy: item.epilepsy,
            other: item.other,
            details: item.details,
            first_aid_consent: item.first_aid_consent,
            photography_consent: item.photography_consent
          }
        });
      }
    }

    emits("continue");
  } catch (err: any) {
    console.error("error saving medical info");
    errorMessage.value = "There was an error when saving your medical information, please try again later.";
  }
}

function onContinue () {
  emits("continue");
}

function onCancel () {
  emits("cancel");
}

function viewInfo (index: number) {
  if (viewingInfoIndex.value === index) {
    viewingInfoIndex.value = undefined;
  } else {
    viewingInfoIndex.value = index;
  }
}

function onErrorContinue () {
  open.value = false;
}

const singleSubHeading = computed(() => {
  let result = "Do you have any of the following:";

  const otherUser = props.users[0];
  if (user.value!.id !== otherUser.id) {
    result = "Does " + otherUser.first_name + " " + otherUser.last_name + " have any of the following:";
  }

  return result;
});

function isJunior (userId: string) {
  return props.users.find(u => u.id === userId)?.role.name.toLowerCase() === "junior";
}

function isActionNeeded (info: MedicalInformation) {
  return info.first_aid_consent === undefined || info.photography_consent === undefined;
}

function isSelf (info: MedicalInformation) {
  return info.user === user.value!.id;
}

</script>

<template>
  <TransitionRoot as="template" :show="open">
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
            <DialogPanel
              class="relative transform overflow-hidden w-full rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div v-if="errorMessage">
                <div>
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                      Confirm medical info error
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        {{ errorMessage }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6">
                  <a-button
                    type="button"
                    class="inline-flex w-full"
                    @click="onErrorContinue">
                    Continue
                  </a-button>
                </div>
              </div>
              <div
                v-else-if="loading"
                class="flex justify-center items-center p-6">
                <loading-spinner color="#6366F1" />
              </div>
              <template v-else>
                <div class="space-y-4">
                  <h3 class="text-base font-semibold">
                    {{
                      users.length === 1 ? "Confirm medical info" : ("Confirm medical info for " + users.length + " users")
                    }}
                  </h3>
                  <slot />
                  <template v-if="medicalInfo.length > 1">
                    <div
                      v-for="(info,index) in medicalInfo"
                      :key="index"
                      class="space-y-4 border shadow rounded-lg p-4"
                      :class="[isActionNeeded(info) && viewingInfoIndex !== index ? 'bg-red-50 border border-red-300 shadow-red-200' : '']">
                      <div class="flex justify-between items-center">
                        <span class="flex items-center gap-2">
                          <span
                            :class="{
                              'font-semibold': viewingInfoIndex === index
                            }">{{ getUserLabel(info.user!) }}</span>
                          <span
                            v-if="isJunior(info.user!)"
                            class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">Junior</span>
                          <span
                            v-if="isActionNeeded(info)"
                            class="inline-flex gap-1 items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                            <ExclamationTriangleIcon class="size-3" />
                            Action needed!
                          </span>
                        </span>
                        <a-button
                          variant="primary"
                          size="xs"
                          @click="() => viewInfo(index)">
                          {{ viewingInfoIndex === index ? "Hide" : "View medical info" }}
                        </a-button>
                      </div>
                      <medical-information
                        v-if="viewingInfoIndex === index"
                        v-model="medicalInfo[index]"
                        :is-self="isSelf(info)"
                        hide-heading />
                    </div>
                  </template>
                  <div v-else>
                    <medical-information
                      v-model="medicalInfo[0]"
                      :checkboxes-label="singleSubHeading"
                      is-self
                      hide-heading />
                  </div>
                </div>

                <alert-box
                  v-if="medicalInfo.length > 1 && consentSelected && viewingInfoIndex === undefined"
                  variant="error"
                  class="mt-5">
                  Please review the highlighted users above, missing data is required.
                </alert-box>

                <div class="mt-5">
                  <input-checkbox
                    id="confirm-info"
                    v-model="confirmInfo"
                    label="I confirm the information above is correct"
                    name="confirm-info" />
                </div>

                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <a-button
                    v-if="isDirty"
                    type="button"
                    :action="onUpdate"
                    :disabled="!confirmInfo || consentSelected"
                    class="w-full"
                    :class="[!showCancel ? 'sm:col-span-2' : 'sm:col-start-2']">
                    {{ saveLabel || "Save changes" }}
                  </a-button>
                  <a-button
                    v-else
                    type="button"
                    class="w-full"
                    :class="[!showCancel ? 'sm:col-span-2' : 'sm:col-start-2']"
                    :disabled="!confirmInfo || consentSelected"
                    @click="onContinue">
                    {{ continueLabel || "Continue to booking" }}
                  </a-button>
                  <a-button
                    v-if="showCancel"
                    variant="outline"
                    class="mt-3 inline-flex w-full sm:col-start-1 sm:mt-0"
                    @click="onCancel">
                    Cancel
                  </a-button>
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
