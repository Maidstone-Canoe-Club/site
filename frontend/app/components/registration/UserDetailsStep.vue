<template>
  <form @submit.prevent>
    <p
      v-if="discoveredNewMember"
      class="mb-5 flex justify-center gap-5">
      <HandRaisedIcon class="w-12 h-12 text-gray-600" />
      Hi there! It appears that you're already a club member, some of your details have already been pre-filled.
    </p>
    <div class="space-y-6">
      <div class="rounded-md bg-blue-50 p-4 border-blue-400 border">
        <div class="flex">
          <div class="flex-shrink-0">
            <InformationCircleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-700">
              Important Note
            </h3>
            <div class="mt-3 text-sm text-blue-600">
              <p class="mb-2">
                Please provide your own personal information.
              </p>
              <p>
                If you need to register a junior member, you can easily add a junior account via your profile after
                completing your own registration.
              </p>
            </div>
          </div>
        </div>
      </div>

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
        v-if="discoveredNewMember"
        id="bc-number"
        v-model="internalValue.bc_number"
        name="bc-number"
        label="BC number" />

      <input-date
        id="dob"
        v-model="internalValue.dob"
        label="Date of birth"
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
import { InformationCircleIcon } from "@heroicons/vue/20/solid";
import { HandRaisedIcon } from "@heroicons/vue/24/outline";
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import { required, helpers } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import type { Ref } from "vue";

const emits = defineEmits(["update:modelValue", "onBack", "onNext"]);

const props = defineProps<{
  modelValue: DirectusUser,
  inviteId?: string
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
  dob: {
    required,
    minValue: helpers.withMessage("You must be over 18 to create an account", isAdult)
  }
};

const discoveredNewMember = computed(() => !props.inviteId && internalValue.value!.bc_number);

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
