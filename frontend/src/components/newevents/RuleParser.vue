<script setup lang="ts">
import { datetime, RRule } from "rrule";
import { format } from "date-fns";
import type { Validation } from "@vuelidate/core";

const props = withDefaults(defineProps<{
  id: string,
  label?: string,
  placeholder?: string,
  start: Date,
  hideExamples?: boolean,
  hidePreviewDates?: boolean,
  v?: Validation
}>(), {
  label: undefined,
  placeholder: undefined,
  hideExamples: false,
  hidePreviewDates: false,
  v: undefined
});

const rule = defineModel<string | undefined>({ required: true });

const ruleData = ref<RRule | null>(null);

const rawValue = ref<string>();

watch(rawValue, () => {
  ruleData.value = createRule();
  rule.value = ruleData.value?.toString() ?? undefined;
});

function toDatetime (date: Date) {
  const newDate = new Date(date);
  return datetime(newDate.getUTCFullYear(),
    newDate.getUTCMonth() + 1,
    newDate.getUTCDate(),
    newDate.getUTCHours(),
    newDate.getUTCMinutes(),
    newDate.getUTCSeconds());
}

function createRule () {
  try {
    if (rawValue.value) {
      const options = RRule.parseText(rawValue.value);
      options.dtstart = toDatetime(props.start);
      return new RRule(options);
    } else {
      return null;
    }
  } catch (e: any) {
    console.warn("Rule parse error: " + e.message);
  }

  return new RRule();
}

const previewDates = computed(() => {
  if (!ruleData.value) {
    return [];
  }

  const until = ruleData.value.options.until;

  const results = ruleData.value.all((_, i) => {
    return !until ? i < 9 : true;
  }).map(d => format(d, "EEE do MMMM yyyy"));

  if (!until) {
    results.push("Indefinitely...");
  }

  return results;
});

const examples = [
  "Every weekday",
  "Every Sunday",
  "Every month on the 3rd Thursday",
  "Every week on Monday, Wednesday",
  "Every 2 months until November 1, 2024"
];

function setExample (example: string) {
  rawValue.value = example;
}

</script>

<template>
  <div>
    <pre>rule: {{ rule }}</pre>

    <input-field
      :id="id"
      v-model="rawValue"
      :label="label"
      :placeholder="placeholder"
      :v="v" />

    <template v-if="!hideExamples">
      <p>Click one of the examples below to try:</p>
      <ul>
        <li
          v-for="(example, index) in examples"
          :key="index">
          <button @click="setExample(example)">
            {{ example }}
          </button>
        </li>
      </ul>
    </template>

    <pre>{{ previewDates }}</pre>
  </div>
</template>

<style scoped>

</style>
