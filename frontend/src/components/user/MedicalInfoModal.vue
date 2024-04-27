<script setup lang="ts">
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import type { MedicalInformation } from "~/components/user/MedicalInformation.vue";

const emits = defineEmits(["continue"]);

const props = defineProps<{
  users: DirectusUser[],
  continueLabel?: string
}>();

const open = defineModel<boolean>("open", { default: false });
const viewingInfoIndex = ref<number>();

const {
  getItems,
  createItems,
  updateItem
} = useDirectusItems();

const user = useDirectusUser();
const medicalInfo = ref<MedicalInformation[]>([]);
const errorMessage = ref<string>();
const loading = ref(false);

watch(open, async (val) => {
  if (val) {
    errorMessage.value = undefined;
    viewingInfoIndex.value = undefined;
    await loadData();
  }
}, { immediate: true });

function blankMedicalInfo (userId: string) {
  return {
    allergies: false,
    asthma: false,
    epilepsy: false,
    diabetes: false,
    other: false,
    hasData: false,
    details: undefined,
    user: userId
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
  } catch (err) {
    errorMessage.value = "There was an error loading your medical information, please try again later.";
    console.error("Error loading medical info");
  } finally {
    loading.value = false;
  }
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
            details: item.details
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
                  <strong>
                    {{ users.length === 1 ? "Confirm medical info" : ("Confirm medical info for " + users.length + " users") }}
                  </strong>
                  <slot />
                  <template v-if="medicalInfo.length > 1">
                    <div
                      v-for="(info,index) in medicalInfo"
                      :key="index"
                      class="space-y-4 border shadow rounded-lg p-4">
                      <div class="flex justify-between items-center">
                        <span class="flex items-center gap-2">
                          <span
                            :class="{
                              'font-semibold': viewingInfoIndex === index
                            }">{{ getUserLabel(info.user!) }}</span>
                          <span
                            v-if="isJunior(info.user!)"
                            class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">Junior</span>
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
                        hide-heading />
                    </div>
                  </template>
                  <div v-else>
                    <medical-information
                      v-model="medicalInfo[0]"
                      :checkboxes-label="singleSubHeading"
                      hide-heading />
                  </div>
                </div>

                <alert-box
                  heading="Please confirm the info above is correct"
                  variant="info"
                  class="mt-4">
                  <slot name="alert">
                    If no changes are needed, {{
                      clickOrTap()
                    }} continue. If you have made changes, {{ clickOrTap() }} the save button.
                  </slot>
                </alert-box>

                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <a-button
                    type="button"
                    :action="onUpdate"
                    :disable-timeout-ms="2000"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2">
                    Save changes
                  </a-button>
                  <a-button
                    type="button"
                    variant="outline"
                    class="mt-3 w-full sm:col-start-1 sm:mt-0"
                    :disable-timeout-ms="2000"
                    @click="onContinue">
                    {{ continueLabel || "Continue to booking" }}
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
