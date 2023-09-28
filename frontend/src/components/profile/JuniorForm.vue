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
    </div>

    <medical-information
      v-model="internalValue.medicalInformation"
      checkboxes-label="Does the junior have any of the following:" />

    <div class="flex">
      <custom-button
        class="whitespace-nowrap"
        :action="submit">
        {{ mode === "edit" ? "Update junior" : "Create new junior" }}
      </custom-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required } from "@vuelidate/validators";
import { Ref } from "vue";
import { useVuelidate, Validation } from "@vuelidate/core";

export type Junior = {
  id?: string,
  first_name: string,
  last_name: string,
  parentId: string,
  medicalInformation: {}
}

const directus = useDirectus();

const emits = defineEmits(["update:modelValue", "complete"]);

const props = defineProps<{
  modelValue: Junior,
  mode: "create" | "edit" | null
}>();

const rules = {
  first_name: { required },
  last_name: { required },
  dob: { required }
};

const internalValue = ref(props.modelValue);

const v$: Ref<Validation> = useVuelidate(rules, internalValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val) => {
  emits("update:modelValue", val);
}, { deep: true });

async function submit () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    if (props.mode === "create") {
      await createJunior();
    } else if (props.mode === "edit") {
      await updateJunior();
    }

    v$.value.$reset();
    emits("complete");
  }
}

async function createJunior () {
  await directus("/juniors/create", {
    method: "POST",
    body: { user: internalValue.value }
  });
}

async function updateJunior () {
  await directus("/juniors/update", {
    method: "POST",
    body: { user: internalValue.value }
  });
}

</script>

<style scoped lang="scss">

</style>
