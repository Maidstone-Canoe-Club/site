<script setup lang="ts">
import { datetime, RRule } from "rrule";
import type { Validation } from "@vuelidate/core";
import { useDebounceFn, watchDebounced } from "@vueuse/core";
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { useDirectusToken } from "#imports";

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

const loading = ref(false);
const result = ref<"pending" | "success" | "error">("pending");
const smartGenerationError = ref<string | null>();

const rule = defineModel<string | undefined>({ required: true });

const ruleData = ref<RRule | null>(null);

const internalRawValue = ref<string | undefined>(props.rawValue);

watch(() => props.rawValue, (val) => {
  internalRawValue.value = val;
});

watchDebounced(internalRawValue, (val) => {
  props.v?.$reset();

  ruleData.value = createRule(val, true);
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

const { token } = useDirectusToken();

const debouncedSmartGeneration = useDebounceFn(async () => {
  if (!internalRawValue.value) {
    console.warn("no prompt");
    return;
  }

  loading.value = true;

  try {
    const res = await $fetch<string | undefined>("/api/newevents", {
      query: {
        prompt: internalRawValue.value
      },
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });

    console.log("response", res);
    if (res) {
      if (res.startsWith("error: ")) {
        smartGenerationError.value = res.replace("error: ", "");
        result.value = "error";
      } else {
        const options = RRule.parseString(res);
        options.dtstart = toDatetime(props.start);
        ruleData.value = new RRule(options);
        rule.value = ruleData.value?.toString() ?? undefined;
        result.value = "success";
      }
    } else {
      throw createError("No choices available");
    }
  } catch (err) {
    smartGenerationError.value = "Unable to generate a valid recurring event pattern";
    result.value = "error";
    console.error(err);
  } finally {
    loading.value = false;
  }
}, 1000);

function createRule (input: string | undefined, smartFallback: boolean) {
  result.value = "pending";
  smartGenerationError.value = null;

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
    if (smartFallback) {
      debouncedSmartGeneration();
    }
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
      :disabled="loading"
      :v="v">
      <template #icons>
        <LoadingSpinner
          v-if="loading"
          color="#4f46e5" />
        <template v-else>
          <CheckIcon
            v-if="result === 'success'"
            class="size-5 text-green-600" />
          <XMarkIcon
            v-else-if="result === 'error'"
            class="size-5 text-red-500" />
        </template>
      </template>
    </input-field>

    <p
      v-if="smartGenerationError"
      class="text-sm text-red-600 mt-2">
      {{ smartGenerationError }}
    </p>
  </div>
</template>
