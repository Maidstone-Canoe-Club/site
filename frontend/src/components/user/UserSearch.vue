<template>
  <Combobox
    v-model="internalValue"
    as="div"
    :multiple="multiple">
    <ComboboxLabel
      v-if="label"
      class="block text-sm font-medium leading-6 text-gray-900">
      {{ label }}
    </ComboboxLabel>

    <ul
      v-if="internalValue && internalValue.length"
      class="flex flex-row flex-wrap gap-3 mt-2 mb-4">
      <li v-for="user in internalValue" :key="user.id">
        <button
          v-tooltip="'Remove user'"
          class="flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          @click="removeUser(user)">
          <user-avatar :user="user" size-class="w-6 h-6" />
          <span class="truncate">
            {{ user.first_name }} {{ user.last_name }}
          </span>
          <XMarkIcon class="w-4 h-4 text-gray-700" />
        </button>
      </li>
    </ul>
    <div class="relative mt-2">
      <ComboboxInput
        class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        :placeholder="placeholder"
        @change="query = $event.target.value" />
      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>

      <ComboboxOptions v-if="filteredUsers.length > 0" class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        <ComboboxOption
          v-for="user in filteredUsers"
          :key="user.id"
          v-slot="{ active, selected }"
          :value="user"
          as="template">
          <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
            <div class="flex items-center">
              <user-avatar :user="user" size-class="w-6 h-6" />
              <span :class="['ml-3 truncate', selected && 'font-semibold']">
                {{ user.first_name }} {{ user.last_name }}
              </span>
            </div>

            <span v-if="selected" :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']">
              <CheckIcon class="h-5 w-5" aria-hidden="true" />
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>

<script setup lang="ts">
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions
} from "@headlessui/vue";
import { watchDebounced } from "@vueuse/core";
import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { ref } from "#imports";

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<{
  modelValue: DirectusUser[],
  label?: string,
  placeholder?: string,
  multiple?: boolean
}>(), {
  label: null,
  placeholder: null,
  multiple: false
});

const { getUsers } = useDirectusUsers();

const loading = ref(false);
const internalValue = ref<DirectusUser[]>(props.modelValue);

const users = ref<DirectusUser[]>([]);
const query = ref("");

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val) => {
  emits("update:modelValue", val);
}, { deep: true });

async function runSearch () {
  if (query.value === "") {
    return;
  }

  loading.value = true;

  try {
    users.value = await getUsers({
      params: {
        limit: 10,
        fields: ["*", "role.name"],
        filter: {
          _and: [
            {
              role: {
                name: {
                  _neq: "Junior"
                }
              }
            },
            {
              _or: [
                {
                  first_name: {
                    _icontains: query.value.toLowerCase()
                  }
                },
                {
                  last_name: {
                    _icontains: query.value.toLowerCase()
                  }
                }
              ]
            }
          ]
        }
      }
    });
  } catch (e) {
    console.error("error searching users", e);
  } finally {
    loading.value = false;
  }
}

watchDebounced(query, async () => {
  await runSearch();
}, { debounce: 500, maxWait: 1000 });

const filteredUsers = computed(() => {
  return users.value.filter(user => !internalValue.value.find(x => x.id === user.id));
});

function renderDisplayValue (values) {
  return values?.map(u => `${u.first_name} ${u.last_name}`).join(",");
}

function removeUser (user: DirectusUser) {
  internalValue.value = internalValue.value.filter(x => x.id !== user.id);
}

</script>

<style scoped lang="scss">

</style>
