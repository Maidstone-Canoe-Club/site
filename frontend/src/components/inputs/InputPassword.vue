<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium leading-6 text-gray-900">{{ label }}</label>
    <div class="flex flex-row gap-1 mt-2">
      <input-field
        :id="id"
        v-model="internalValue"
        :type="showPassword ? 'text': 'password'"
        class="flex-grow"
        :v="v"
        :name="name" />
      <button
        v-if="showPasswordToggle"
        type="button"
        class="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        :title="showPassword ? 'Hide password' : 'Show password'"
        @click="showPassword = !showPassword">
        <!--        {{ showPassword ? "hide": "show" }}-->
        <EyeIcon
          v-if="showPassword"
          class="w-5 h-5 text-gray-600" />
        <EyeSlashIcon
          v-else
          class="w-5 h-5 text-gray-600" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Validation } from "@vuelidate/core";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";

interface Props {
  modelValue: string | number | null | undefined,
  id: string,
  name?: string | undefined,
  label?: string | null,
  required?: boolean,
  disabled?: boolean,
  placeholder?: string | undefined,
  autocomplete?: string | undefined,
  showPasswordToggle?: boolean,
  v?: Validation | null
}

const emits = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  name: undefined,
  label: null,
  required: false,
  disabled: false,
  placeholder: undefined,
  autocomplete: undefined,
  showPasswordToggle: false,
  v: null
});

const showPassword = ref(false);

const internalValue = computed<string | null>({
  get () {
    return props.modelValue;
  },
  set (val: string | number | null) {
    emits("update:modelValue", val);
  }
});
</script>

<style scoped lang="scss">

</style>
