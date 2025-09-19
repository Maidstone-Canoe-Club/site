<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0 space-y-6">
    <div class="space-y-2">
      <strong>Send member invite emails</strong>
      <div>
        Loaded {{ existingInvites.length }} member invites
      </div>
    </div>

    <div class="space-y-6">
      <input-field
        id="subject"
        v-model="email.subject"
        label="Subject"
        name="subject"
        :v="v$.subject" />

      <div>
        <input-wysiwyg
          id="content"
          v-model="email.content"
          :v="v$.subject"
          label="Content" />
        <small>Use the following placeholders to be replaced in the email: {FIRST_NAME} {LAST_NAME} {INVITE_URL}</small>
      </div>

      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-gray-900">
            Select invites to send
          </h1>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            @click="selectAll">
            {{ allSelected ? "Deselect all" : "Select all" }}
          </button>
        </div>
      </div>
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Select
                  </th>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    First name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    First name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Club number
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    BC number
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="person in existingInvites" :key="person.email">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                    <input-checkbox
                      :id="person.email + '-selected'"
                      v-model="person.selected"
                      :name="person.email + '-selected'" />
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.first_name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.last_name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.email }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.club_number }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {{ person.bc_number }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <custom-button :action="trySend">
        Send invite emails
      </custom-button>
    </div>

    <dismiss-modal
      v-model:open="showConfirmModal"
      :action="onSend"
      title="Are you sure?"
      action-button-label="Yes, send!">
      Are you sure you want to send an invite email to {{ selectedInvites.length }} {{ selectedInvites.length === 1 ? "person" : "people" }}?
    </dismiss-modal>
  </div>
</template>
<script setup lang="ts">
import { required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import type { Ref } from "vue";

definePageMeta({
  middleware: ["auth", "admin"]
});

const { getItems } = useDirectusItems();
const directus = useDirectus();

const { data: existingInvites } = await useAsyncData("invites", async () => {
  const items = await getItems({
    collection: "member_invites",
    params: {
      limit: 9999,
      filter: {
        accepted: {
          _eq: false
        }
      }
    }
  });

  return items.map(x => ({
    ...x,
    selected: false
  }))
    .sort((a, b) => {
      if (a.last_name < b.last_name) {
        return -1;
      }
      if (a.last_name > b.last_name) {
        return 1;
      }
      return 0;
    });
});

const email = ref({
  subject: "",
  content: ""
});
const showConfirmModal = ref(false);

const rules = {
  subject: { required },
  content: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, email);

function selectAll () {
  const all = allSelected.value;
  for (const invite of existingInvites.value) {
    if (all) {
      invite.selected = false;
    } else {
      invite.selected = true;
    }
  }
}

const allSelected = computed(() => existingInvites.value.filter(x => !x.selected).length === 0);

const selectedInvites = computed(() => existingInvites.value.filter(x => x.selected));

function trySend () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    showConfirmModal.value = true;
  }
}

async function onSend () {
  try {
    await directus("/invites/send", {
      method: "POST",
      body: {
        email: email.value,
        invites: selectedInvites.value
      }
    });
  } catch (e) {
    console.error("error sending invites", e);
  } finally {
    showConfirmModal.value = false;
  }
}

</script>

<style scoped lang="scss">

</style>
