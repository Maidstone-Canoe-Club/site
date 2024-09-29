<template>
  <div>
    <Listbox
      v-model="internalValue"
      as="div"
      :by="by"
      :disabled="disabled"
      :multiple="multiple">
      <ListboxLabel
        class="block text-sm font-medium leading-6 text-gray-900"
        :class="{'required': required}">
        {{ label }}
      </ListboxLabel>
      <div class="relative mt-2">
        <ListboxButton
          class="relative w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
         :class="[disabled ? 'text-gray-600 bg-gray-50 ring-gray-200' :'text-gray-900 bg-white ring-gray-300']">
          <span class="block truncate">
            {{ currentLabel }}
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0">
          <ListboxOptions
            class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <ListboxOption
              v-for="option in options"
              :id="option.id"
              :key="option.id"
              v-slot="{ active, selected }"
              as="template"
              :disabled="option.disabled"
              :value="option">
              <li
                :class="[
                  option.disabled ? '!text-gray-300 cursor-not-allowed' : '',
                  active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                   'relative cursor-default select-none py-2 pl-3 pr-9']">
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ option.name }}</span>

                <span
                  v-if="selected"
                  :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
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
  by?: string,
  options: DropdownOption[],
  multiple?: boolean
  v?: Validation | null
}

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  label: null,
  required: false,
  disabled: false,
  by: "id",
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
