<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import { datetime, RRule } from "rrule";
import { useVuelidate } from "@vuelidate/core";
import { format } from "date-fns";
import type { EventWizardItem } from "~/components/newevents/wizard/NewEventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  rrule: { validRule: helpers.withMessage("A valid input is required", required) }
};

const validator = useVuelidate(rules, event);
const rawValue = ref<string | undefined>();

const examples = [
  "Every weekday",
  "Every Sunday",
  "Every month on the 3rd Thursday",
  "Every week on Monday, Wednesday",
  "Every 2 months until November 1, 2024"
];

function useExample (example: string) {
  rawValue.value = example;
}

const previewDates = ref<string[]>([]);

function toDatetime (date: Date | string) {
  const newDate = new Date(date);
  return datetime(newDate.getUTCFullYear(),
    newDate.getUTCMonth() + 1,
    newDate.getUTCDate(),
    newDate.getUTCHours(),
    newDate.getUTCMinutes(),
    newDate.getUTCSeconds());
}

watch(() => event.value.rrule, (val) => {
  console.log("CHANGE", val);
  if (!val) {
    previewDates.value = [];
    return;
  }

  const ruleData = RRule.fromString(val);

  if (!ruleData) {
    previewDates.value = [];
    return;
  }

  const until = ruleData.options.until;

  console.log("rule data", ruleData, until);

  const results = ruleData.all((_, i) => {
    return !until ? i < 9 : true;
  }).map(d => format(d, "EEE do MMMM yyyy"));

  if (!until) {
    results.push("Indefinitely...");
  }
  console.log("results", results);
  previewDates.value = results;
});

// const ruleData = computed(() => event.value.rrule ? RRule.fromText(event.value.rrule) : undefined);

// const previewDates = computed(() => {
//   console.log("preview dates", ruleData.value);
//   // if (!event.value.rrule) {
//   //   return [];
//   // }
//
//   // const ruleData = RRule.fromText(event.value.rrule);
//
//   if (!ruleData.value) {
//     return [];
//   }
//
//   const until = ruleData.value.options.until;
//
//   const results = ruleData.value.all((_, i) => {
//     return !until ? i < 9 : true;
//   }).map(d => format(d, "EEE do MMMM yyyy"));
//
//   if (!until) {
//     results.push("Indefinitely...");
//   }
//
//   return results;
// });

const exampleEvents = computed(() => [{
  start_date: event.value.startDate,
  end_date: event.value.endDate,
  is_recurring: !!event.value.rrule,
  rrule: event.value.rrule
}]);
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <pre>{{ event.rrule }}</pre>
      <rule-parser
        id="event-rule"
        v-model="event.rrule"
        :start="event.startDate"
        label="How often should the event occur?"
        :raw-value="rawValue"
        :v="validator.rrule" />
      <p>
        Write how many times this event should recur as a normal sentence. Click the buttons below to see different
        examples.
      </p>
    </div>

    <div>
      <ul class="flex flex-wrap gap-3">
        <li
          v-for="(example, index) in examples"
          :key="index">
          <button
            class="rounded bg-indigo-50 px-2 py-1 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 border border-indigo-300"
            @click="() => useExample(example)">
            {{ example }}
          </button>
        </li>
      </ul>
    </div>

    <hr>

    <div class="space-y-5">
      <span>Preview the dates here; days with a circle indicate when this event will occur.</span>
      <small-calendar
        :events="exampleEvents" />
    </div>

    <div class="footer">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>
