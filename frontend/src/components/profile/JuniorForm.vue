<template>
  <div class="space-y-5">
    <h3 class="font-bold text-xl">
      {{ mode === "edit" ? "Update existing junior" : "New junior details" }}
    </h3>
    <div class="space-y-4 max-w-lg">
      <input-field
        id="first-name"
        v-model="internalValue.first_name"
        label="First name"
        name="first-name"
        :v="v$.first_name" />

      <input-field
        id="last-name"
        v-model="internalValue.last_name"
        label="Last name"
        name="last-name"
        :v="v$.last_name" />

      <input-date
        id="dob"
        v-model="internalValue.dob"
        name="dob"
        label="Date of birth"
        :v="v$.dob" />

      <input-field
        id="bc-number"
        v-model="internalValue.bc_number"
        label="BC number"
        name="bc-number" />
    </div>

    <medical-information
      v-model="internalValue.medicalInformation"
      checkboxes-label="Does the junior have any of the following:" />

    <div
      v-if="errorMessage"
      class="text-red-500">
      {{ errorMessage }}
    </div>

    <div class="flex gap-3">
      <a-button
        class="whitespace-nowrap"
        variant="primary"
        :action="submit">
        {{ mode === "edit" ? "Update junior" : "Create new junior" }}
      </a-button>

      <a-button
        variant="outline"
        @click="onBack">
        Back
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required } from "@vuelidate/validators";
import type { Ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import type { JuniorUser } from "~/composables/useJuniors";

const {
  createJunior,
  updateJunior
} = useJuniors();

const emits = defineEmits(["update:modelValue", "complete", "back"]);

const props = defineProps<{
  modelValue: JuniorUser,
  mode: "create" | "edit" | null
}>();

const rules = {
  first_name: { required },
  last_name: { required },
  dob: { required }
};

const errorMessage = ref<string>();
const internalValue = ref(props.modelValue);

const v$: Ref<Validation> = useVuelidate<JuniorUser>(rules, internalValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val) => {
  emits("update:modelValue", val);
}, { deep: true });

async function submit () {
  errorMessage.value = undefined;
  v$.value.$touch();

  if (!v$.value.$invalid) {
    if (props.mode === "create") {
      await createJunior(internalValue);
    } else if (props.mode === "edit") {
      await updateJunior(internalValue);
    }

    v$.value.$reset();
    emits("complete");
  }
}

function onBack () {
  emits("back");
}

</script>

<style scoped lang="scss">

</style>
