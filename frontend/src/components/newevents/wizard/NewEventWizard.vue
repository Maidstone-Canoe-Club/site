<script setup lang="ts">
import type { Component } from "vue";
import EventTypeStep from "./EventTypeStep.vue";
import {
  // EventTypeStep,
  EventBasicsStep,
  SingleDateStep,
  MultiDateStep,
  RecurringDateStep
} from "#components";
import type { EventType, NewEventItem } from "~/types/events";

export type EventWizardItem = {
  name?: string,
  startDate?: Date,
  endDate?: Date,
  dates?: {
    startDate: Date,
    endDate: Date,
  }[],
  rrule?: string,
  type?: EventType,
}

const newEvent = reactive<EventWizardItem>({
  type: "recurring",
  name: "Hello"
});

export type WizardStep = {
  id: string,
  component: Component,
}

const steps = computed(() => {
  const result: WizardStep[] = [
    {
      id: "type",
      component: EventTypeStep
    },
    {
      id: "basics",
      component: EventBasicsStep
    }
  ];

  if (newEvent.type === "single") {
    result.push({
      id: "single",
      component: SingleDateStep
    });
  } else if (newEvent.type === "multi") {
    result.push({
      id: "multi",
      component: MultiDateStep
    });
  } else if (newEvent.type === "recurring") {
    result.push({
      id: "single",
      component: SingleDateStep
    });
    result.push({
      id: "recurring",
      component: RecurringDateStep
    });
  }

  return result;
});

const currentStepIndex = ref(2);
const currentStep = computed(() => steps.value[currentStepIndex.value]);
const currentStepIsLast = computed(() => currentStepIndex.value === steps.value.length - 1);

function onPrev () {
  currentStepIndex.value -= 1;
}

async function onAdvance () {
  if (currentStepIsLast.value) {
    await onSubmit();
  } else {
    currentStepIndex.value += 1;
  }
}

function toNewEventItem (eventItem: EventWizardItem) : NewEventItem {
  return {
    name: eventItem.name!,
    startDate: eventItem.startDate!,
    endDate: eventItem.endDate!,
    rrule: eventItem.rrule!,
    type: eventItem.type!
  };
}

async function onSubmit () {
  try {
    console.log("SUBMIT!");
    const newId = await $fetch("/api/events", {
      method: "POST",
      body: toNewEventItem(newEvent)
    });

    await navigateTo(`/events/${newId}`);
  } catch (e) {
    console.error("create event error", e);
  }
}

</script>

<template>
  <div class="m-auto max-w-xl space-y-8 mt-12">
    <!--    <pre>{{ newEvent }}</pre>-->
    <!--    <pre>currentStepIndex: {{ currentStepIndex }}</pre>-->
    <!--    <pre>currentStepIsLast: {{ currentStepIsLast }}</pre>-->
    <h1 class="text-2xl font-bold text-center">
      Create a new event
    </h1>
    <EventWizardSteps
      v-model="currentStepIndex"
      :steps="steps" />
    <component
      :is="currentStep.component"
      v-model="newEvent"
      #="{valid, validator}">
      <EventWizardControls
        :current-step-index="currentStepIndex"
        :current-step-is-last="currentStepIsLast"
        :valid="valid"
        :validator="validator"
        @prev="onPrev"
        @advance="onAdvance" />
    </component>
  </div>
</template>
