<script setup lang="ts">
import { datetime, RRule } from "rrule";
import type { Validation } from "@vuelidate/core";
import { watchDebounced } from "@vueuse/core";
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const props = withDefaults(defineProps<{
  id: string,
  label?: string,
  placeholder?: string,
  start: Date | string,
  v?: Validation,
  rawValue?: string,
}>(), {
  label: undefined,
  placeholder: undefined,
  v: undefined,
  rawValue: undefined
});

const result = ref<"pending" | "success" | "error">("pending");
const parseError = ref<string | null>();

const rule = defineModel<string | undefined>({ required: true });

const ruleData = ref<RRule | null>(null);

const internalRawValue = ref<string | undefined>(props.rawValue);

watch(() => props.rawValue, (val) => {
  internalRawValue.value = val;
});

watchDebounced(internalRawValue, (val) => {
  props.v?.$reset();

  ruleData.value = createRule(val);
  rule.value = ruleData.value?.toString() ?? undefined;
}, { debounce: 1000 });

function toDatetime (date: Date | string) {
  const newDate = new Date(date);
  return datetime(newDate.getUTCFullYear(),
    newDate.getUTCMonth() + 1,
    newDate.getUTCDate(),
    newDate.getUTCHours(),
    newDate.getUTCMinutes(),
    newDate.getUTCSeconds());
}

function createRule (input: string | undefined) {
  result.value = "pending";
  parseError.value = null;

  try {
    if (input) {
      const options = RRule.parseText(input);
      options.dtstart = toDatetime(props.start);
      result.value = "success";
      return new RRule(options);
    } else {
      return null;
    }
  } catch (e: any) {
    result.value = "error";
    console.warn("Rule parse error: " + e.message);
    parseError.value = "Unable to understand that pattern. Try one of the examples below";
  }

  return new RRule();
}

</script>

<template>
  <div>
    <input-field
      :id="id"
      v-model="internalRawValue"
      :label="label"
      :placeholder="placeholder"
      :v="v">
      <template #icons>
        <CheckIcon
          v-if="result === 'success'"
          class="size-5 text-green-600" />
        <XMarkIcon
          v-else-if="result === 'error'"
          class="size-5 text-red-500" />
      </template>
    </input-field>

    <p
      v-if="parseError"
      class="text-sm text-red-600 mt-2">
      {{ parseError }}
    </p>
  </div>
</template>
