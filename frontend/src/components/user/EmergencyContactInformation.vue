<template>
  <div class="space-y-4">
    <table
      v-if="filteredValues && filteredValues.length"
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
        <tr v-for="(item, index) in filteredValues" :key="index">
          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
            <input-field
              v-if="isEditing(item)"
              v-model="editingItem!.full_name" />
            <template v-else>
              {{ item.full_name }}
            </template>
          </td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
            <input-field
              v-if="isEditing(item)"
              v-model="editingItem!.contact_number" />
            <template v-else>
              {{ item.contact_number }}
            </template>
          </td>
          <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
            <template v-if="isEditing(item)">
              <button
                type="button"
                class="text-indigo-600 hover:text-indigo-900"
                @click="confirmChanges">
                Confirm changes
              </button>
              <button
                type="button"
                class="text-red-600 hover:text-red-900 ml-4"
                @click="cancelChanges">
                Cancel
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="text-indigo-600 hover:text-indigo-900"
                @click="editContact(item)">
                Edit<span class="sr-only">, {{ item.full_name }}</span>
              </button>
              <button
                type="button"
                class="text-red-600 hover:text-red-900 ml-4"
                @click="removeContact(item)">
                Remove<span class="sr-only">, {{ item.full_name }}</span>
              </button>
            </template>
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
    <a-button
      :disabled="isAddDisabled"
      variant="outline"
      size="sm"
      @click="addNewContact">
      {{ addButtonLabel }}
    </a-button>

    <p
      v-if="showEmergencyContactValidation"
      class="mt-2 text-sm text-red-600">
      You must have at least one emergency contact. Add another contact to remove this one.
    </p>

    <p
      v-if="showValidation"
      class="mt-2 text-sm text-red-600">
      You must add at least one emergency contact
    </p>
  </div>
</template>

<script setup lang="ts">
import { nanoid } from "nanoid";
import type { EmergencyContact } from "~/types";

type InternalEmergencyContact = {
  shouldRemove: boolean,
  shouldUpdate: boolean,
  editId: string | null
} & EmergencyContact;

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<{
  modelValue: InternalEmergencyContact[],
  addButtonLabel?: string,
  showValidation?: boolean
}>(), {
  addButtonLabel: "Save",
  showValidation: false
});

const user = useDirectusUser();

const internalValue = ref<InternalEmergencyContact[]>(props.modelValue || []);

const editingItem = ref<InternalEmergencyContact | null>(null);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val) => {
  emits("update:modelValue", val);
});

const filteredValues = computed(() => {
  if (internalValue.value && internalValue.value.length) {
    return internalValue.value.filter(x => !x.shouldRemove);
  }

  return [];
});

const newFullName = ref<string | null>(null);
const newContactNumber = ref<string | null>(null);
const showEmergencyContactValidation = ref(false);

function removeContact (contact: any) {
  if (filteredValues.value.length === 1) {
    showEmergencyContactValidation.value = true;
    return;
  }

  contact.shouldRemove = true;
}

function editContact (contact: InternalEmergencyContact) {
  contact.editId = nanoid();
  editingItem.value = {
    ...contact
  };
}

function isEditing (contact: InternalEmergencyContact) {
  return !!editingItem.value &&
    editingItem.value.editId === contact.editId;
}

function confirmChanges () {
  const index = internalValue.value.findIndex(c => c.editId === editingItem.value!.editId);
  if (index >= 0) {
    internalValue.value[index] = editingItem.value!;
    internalValue.value[index].shouldUpdate = true;
    editingItem.value = null;
  }
}

function cancelChanges () {
  editingItem.value = null;
}

const isAddDisabled = computed(() => {
  return !newFullName.value || !newContactNumber.value;
});

function addNewContact () {
  showEmergencyContactValidation.value = false;
  if (!newFullName.value || !newContactNumber.value) {
    return;
  }

  const item: InternalEmergencyContact = {
    id: null,
    editId: nanoid(),
    full_name: newFullName.value,
    contact_number: newContactNumber.value,
    user: null,
    shouldRemove: false,
    shouldUpdate: false
  };

  if (user.value) {
    item.user = user.value.id;
  }

  internalValue.value.push(item);

  newFullName.value = null;
  newContactNumber.value = null;
}

</script>

<style scoped lang="scss">

</style>
