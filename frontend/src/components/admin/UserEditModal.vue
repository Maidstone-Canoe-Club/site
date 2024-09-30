<script setup lang="ts">
import type {DirectusUser} from "nuxt-directus/dist/runtime/types";
import {UserIcon} from '@heroicons/vue/24/outline'

const emits = defineEmits(["close", "save"]);

const props = defineProps<{
  user?: DirectusUser,
  open: boolean
}>();

const editingUser = ref(props.user);

watch(() => props.open, (val) => {
  if (val) {
    editingUser.value = {...props.user};
  }
});

function close() {
  emits("close");
}

const directus = useDirectus();
const user = useDirectusUser();
const {newError} = useErrors();

const {data: roles} = await useAsyncData("directus-roles", async () => await fetchRoles());

const canEditUser = computed(() => {
  return editingUser.value.role.name !== "Administrator" && editingUser.value.id !== user.value.id;
});

async function fetchRoles() {
  const foundRoles = await directus("/roles");
  return foundRoles.data;
}

const isDirty = computed(() => {
  return !deepEqual(props.user, editingUser.value);
});

function isDisabledRoleOption(roleName: string) {
  return roleName === "Administrator" || roleName === "Junior" || roleName === "Unverified";
}

const rolesOptions = computed(() => {
  return roles.value.map(r => ({
    name: r.name === "Unapproved" ? "Non-member" : r.name,
    id: r.id,
    disabled: isDisabledRoleOption(r.name)
  }));
});

async function save() {
  try {
    await directus("/user-admin/update-user", {
      method: "POST",
      body: {
        id: editingUser.value.id,
        role: editingUser.value.role.id,
        bc_number: editingUser.value.bc_number,
        club_number: editingUser.value.club_number
      }
    })
    emits("save");
    close();
  } catch (err: any) {
    console.error("Error updating user:", err);
    newError({
      message: "Unable to update user details"
    });
  }
}

</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-10">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                       leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
                           enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                           enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                           leave-from="opacity-100 translate-y-0 sm:scale-100"
                           leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <UserIcon class="h-6 w-6 text-green-600" aria-hidden="true"/>
                </div>
                <div class="mt-3 sm:mt-5">
                  <div class="mt-2 space-y-4">
                    <div class="grid grid-cols-2 gap-3">
                      <input-field label="First name"
                                   id="first-name"
                                   name="first-name"
                                   disabled
                                   v-model="editingUser.first_name"/>
                      <input-field label="Last name"
                                   id="last-name"
                                   name="last-name"
                                   disabled
                                   v-model="editingUser.last_name"/>
                    </div>
                    <input-field label="Email address"
                                 disabled
                                 id="email-address"
                                 name="email-address"
                                 type="email"
                                 v-model="editingUser.email"/>

                    <input-dropdown :options="rolesOptions"
                                    v-model="editingUser.role"
                                    :disabled="!canEditUser"
                                    by="id"
                                    label="Role"/>

                    <div class="grid grid-cols-2 gap-3">
                      <input-field label="BC Number"
                                   id="bc-number"
                                   name="bc-number"
                                   :disabled="!canEditUser"
                                   v-model="editingUser.bc_number"/>
                      <input-field label="Club number"
                                   id="club-number"
                                   name="club-number"
                                   :disabled="!canEditUser"
                                   v-model="editingUser.club_number"/>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:gap-3"
              :class="[canEditUser ? 'sm-grid-cols-2' : '']">
                <a-button type="button"
                          v-if="canEditUser"
                          :disabled="!isDirty"
                          :action="save"
                          class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                          @click="close">Save
                </a-button>
                <button type="button"
                        class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                        @click="close" ref="cancelButtonRef">Cancel
                </button>
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
