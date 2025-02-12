﻿<script setup lang="ts">
import { helpers, required } from "@vuelidate/validators";
import { datetime, RRule } from "rrule";
import { useVuelidate } from "@vuelidate/core";
import { format } from "date-fns";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

defineProps<{
  editMode: boolean,
  changingAll?: boolean
}>();

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  rrule: { validRule: helpers.withMessage("A valid input is required", required) }
};

const validator = useVuelidate<EventWizardItem>(rules, event);
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

  if (ruleData.options.until || ruleData.options.count) {
    const all = ruleData.all();
    const last = all[all.length - 1];
    event.value.lastOccurrence = last;
    console.log("last", last);
  } else {
    console.log("event is forever!");
  }

  const results = ruleData.all((_, i) => {
    return !until ? i < 9 : true;
  }).map(d => format(d, "EEE do MMMM yyyy"));

  if (!until) {
    results.push("Indefinitely...");
  }
  console.log("results", results);
  previewDates.value = results;
});

const exampleEvents = computed(() => [{
  start_date: event.value.startDate,
  end_date: event.value.endDate,
  is_recurring: !!event.value.rrule,
  rrule: event.value.rrule
}]);
</script>

<template>
  <div class="space-y-8">
    <alert-box
      v-if="editMode && changingAll"
      variant="error"
      heading="Danger zone">
      <p>You are changing how often this event occurs!</p>
      <p>This will effect past and present instances of this event.</p>
      <p>Any users who are booked onto upcoming events will receive an email saying the date of their booking has changed.</p>
      <p>Users may need to cancel their booking if the new date or time doesn't work for them.</p>
      <p>If you are not changing the date or time, you may proceed as normal and ignore this warning.</p>
    </alert-box>

    <div class="space-y-2">
      <rule-parser
        id="event-rule"
        v-model="event.rrule"
        :start="event.startDate"
        label="How often should the event occur?"
        :raw-value="rawValue"
        :v="validator.rrule" />
      <p>
        Write how many times this event should repeat as a normal sentence. Click the buttons below to see different
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
      <span>Preview the dates here; circled dates indicate when this event will occur.</span>
      <small-calendar
        :events="exampleEvents" />
    </div>

    <div class="footer">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>
