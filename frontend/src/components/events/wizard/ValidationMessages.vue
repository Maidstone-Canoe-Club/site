<script setup lang="ts">
import type { Validation } from "@vuelidate/core";

const props = defineProps<{
  id?: string
  v: Validation
}>();

const internalId = computed(() => props.id ? `${props.id}-error` : undefined);

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

</script>

<template>
  <p
    v-if="!isValid"
    :id="internalId"
    class="mt-2 text-sm text-red-600">
    {{ error }}
  </p>
</template>

<style scoped>

</style>
