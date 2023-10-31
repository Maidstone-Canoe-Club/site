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
            {{ item.full_name }}
          </td>
          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
            {{ item.contact_number }}
          </td>
          <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
            <button
              type="button"
              class="text-indigo-600 hover:text-indigo-900"
              @click="removeContact(item)">
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
      {{ addButtonLabel }}
    </button>

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

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<{
  modelValue: any,
  addButtonLabel?: string,
  showValidation?: boolean
}>(), {
  addButtonLabel: "Save",
  showValidation: false
});

const user = useDirectusUser();

const internalValue = ref(props.modelValue);

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

function addNewContact () {
  showEmergencyContactValidation.value = false;
  if (!newFullName.value || !newContactNumber.value) {
    return;
  }

  const item = {
    full_name: newFullName.value,
    contact_number: newContactNumber.value
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
