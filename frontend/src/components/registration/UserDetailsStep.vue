<template>
  <form @submit.prevent>
    <div class="space-y-6">
      <input-field
        id="first-name"
        v-model="internalValue.first_name"
        label="First name"
        required
        name="name"
        autocomplete="given-name"
        :v="v$.first_name" />

      <input-field
        id="last-name"
        v-model="internalValue.last_name"
        label="Last name"
        required
        name="last-name"
        autocomplete="family-name"
        :v="v$.last_name" />

      <input-field
        id="dob"
        v-model="internalValue.dob"
        label="Date of birth"
        type="date"
        required
        name="dob"
        autocomplete="bday"
        :v="v$.dob" />

      <input-field
        id="home-tel"
        v-model="internalValue.home_tel"
        label="Home Tel"
        required
        type="tel"
        name="home-tel"
        autocomplete="tel"
        :v="v$.home_tel" />

      <input-field
        id="mobile"
        v-model="internalValue.mobile"
        label="Mobile"
        required
        type="tel"
        name="mobile"
        autocomplete="tel"
        :v="v$.mobile" />
    </div>
    <div class="flex flex-col gap-4 mt-14">
      <button
        class="flex-grow rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        type="submit"
        @click="onSubmit">
        Next
      </button>

      <button
        class="flex-grow rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        type="button"
        @click="onBack">
        Back
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { required } from "@vuelidate/validators";
import { useVuelidate, Validation } from "@vuelidate/core";
import { Ref } from "vue";

const emits = defineEmits(["update:modelValue", "onBack", "onNext"]);

const props = defineProps<{
  modelValue: DirectusUser
}>();

const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val) => {
  emits("update:modelValue", val);
}, { deep: true });

const rules = {
  first_name: { required },
  last_name: { required },
  dob: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, internalValue);

function onBack () {
  emits("onBack");
}

function onSubmit () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    emits("onNext");
  }
}

</script>

<style scoped lang="scss">

</style>
