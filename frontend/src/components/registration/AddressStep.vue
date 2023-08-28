<template>
  <form @submit="prevent">
    <div class="space-y-6">
      <input-field
        id="street-address"
        v-model="internalValue.street_address"
        label="Street address"
        required
        name="street-address"
        autocomplete="address-line1"
        :v="v$.street_address" />

      <input-field
        id="city"
        v-model="internalValue.city"
        label="City"
        required
        name="city"
        autocomplete="address-level1"
        :v="v$.city" />

      <input-field
        id="county"
        v-model="internalValue.county"
        label="County"
        required
        name="county"
        autocomplete="address-level2"
        :v="v$.county" />

      <input-field
        id="postcode"
        v-model="internalValue.postcode"
        label="Postcode"
        required
        name="postcode"
        autocomplete="postal-code"
        :v="v$.postcode" />
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
  street_address: { required },
  county: { required },
  city: { required },
  postcode: { required }
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
