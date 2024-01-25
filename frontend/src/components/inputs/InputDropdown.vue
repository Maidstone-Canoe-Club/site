<template>
  <div>
    <Listbox
      v-model="internalValue"
      as="div"
      :multiple="multiple">
      <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900">
        {{ label }}
      </ListboxLabel>
      <div class="relative mt-2">
        <ListboxButton class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
          <span class="block truncate">
            {{ currentLabel }}
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
          <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <ListboxOption v-for="person in options" :key="person.id" v-slot="{ active, selected }" as="template" :value="person">
              <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ person.name }}</span>

                <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <p
      v-if="!isValid"
      class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Validation } from "@vuelidate/core";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";

export type DropdownOption = {
  id: number | string,
  name: string,
}

interface Props {
  modelValue: DropdownOption[] | DropdownOption,
  label?: string | null,
  required?: boolean,
  disabled?: boolean,
  options: DropdownOption[],
  multiple?: boolean
  v?: Validation | null
}
const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  label: null,
  required: false,
  disabled: false,
  multiple: false,
  v: null
});

const internalValue = computed<DropdownOption[] | DropdownOption>({
  get () {
    return props.modelValue;
  },
  set (val: DropdownOption[] | DropdownOption) {
    emits("update:modelValue", val);
  }
});

const error = computed(() => {
  if (props.v && props.v?.$errors?.length >= 1) {
    return props.v.$errors[0].$message;
  }
});

const isValid = computed(() => {
  if (props.v && props.v.$dirty) {
    return !props.v.$invalid;
  }

  return true;
});

const currentLabel = computed(() => {
  if (Array.isArray(internalValue.value)) {
    if (internalValue.value.length) {
      return internalValue.value.map(x => x.name).join(", ");
    } else {
      return "Select multiple options";
    }
  } else if (internalValue.value && internalValue.value.name) {
    return internalValue.value.name;
  } else {
    return "Select an option";
  }
});

</script>

<style scoped lang="scss">

</style>
