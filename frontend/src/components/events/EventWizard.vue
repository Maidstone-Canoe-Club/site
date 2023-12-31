﻿<template>
  <div class="mt-20 mx-auto max-w-4xl px-3 sm:px-0">
    <nav
      aria-label="Progress"
      class="flex justify-center items-center">
      <ol role="list" class="flex items-center">
        <li
          v-for="(step, stepIdx) in steps"
          :key="step.name"
          :class="[stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative']">
          <template v-if="step.status === 'complete'">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-indigo-600" />
            </div>
            <div
              class="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-900">
              <CheckIcon class="h-5 w-5 text-white" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </div>
          </template>
          <template v-else-if="step.status === 'current'" condition="step.status === 'current'">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-gray-200" />
            </div>
            <div
              class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white"
              aria-current="step">
              <span class="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </div>
          </template>
          <template v-else>
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-gray-200" />
            </div>
            <div
              class="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
              <span class="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
              <span class="sr-only">{{ step.name }}</span>
            </div>
          </template>
        </li>
      </ol>
    </nav>

    <component
      :is="currentStep"
      v-model:event-type="eventType"
      v-model:event-item="eventItem"
      v-model:event-dates="eventDates"
      class="mt-10"
      :show-back-button="showBackButton"
      :is-last="currentStepIndex === steps.length - 1"
      :loading="loading"
      @prev="goToPrevStep"
      @next="goToNextStep" />
  </div>
</template>

<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/20/solid";
import {
  EventTypeStep,
  EventSingleDateStep,
  EventMultiDateStep,
  EventRecurringDateStep,
  EventDetailsStep
} from "#components";

const directus = useDirectus();

const steps = computed(() => [
  { name: "Event type step", status: getStepStatus(0), component: EventTypeStep },
  { name: "Event date step", status: getStepStatus(1), component: dateStepComponent.value },
  { name: "Event details step", status: getStepStatus(2), component: EventDetailsStep }
]);

function getStepStatus (index: number) {
  if (currentStepIndex.value === index) {
    return "current";
  }

  if (currentStepIndex.value < index) {
    return "upcoming";
  }
  return "complete";
}

const user = useDirectusUser();
const currentStepIndex = ref(0);
const currentStep = computed(() => steps.value[currentStepIndex.value].component);
const loading = ref(false);

const eventType = ref("");
const eventItem = ref({
  location: "Maidstone Canoe Club",
  allowedRoles: [],
  type: {},
  leaders: [user.value]
});
const eventDates = ref(blankEventDates());

const showBackButton = computed(() => currentStepIndex.value >= 1);

watch(eventType, () => {
  eventDates.value = blankEventDates();
});

function blankEventDates () {
  return {
    multiple: [],
    recurring: {
      recurringType: { id: "weekly", name: "Weekly" }
    }
  };
}

function goToPrevStep () {
  currentStepIndex.value = currentStepIndex.value - 1;
}

function goToNextStep () {
  if (currentStepIndex.value === steps.value.length - 1) {
    onSubmit();
  } else {
    currentStepIndex.value = currentStepIndex.value + 1;
  }
}

async function onSubmit () {
  loading.value = true;
  try {
    const newEventItem = {
      ...eventItem.value
    };

    newEventItem.allowedRoles = newEventItem.allowedRoles.map(x => x.id);
    newEventItem.type = newEventItem.type.id;
    newEventItem.leaders = undefined;

    await directus("/events/create", {
      method: "POST",
      body: {
        eventType: eventType.value,
        eventItem: newEventItem,
        eventDates: eventDates.value,
        leaders: eventItem.value.leaders?.map(l => l.id)
      }
    });
    await navigateTo("/calendar");
  } catch (e) {
    console.error("could not create event", e);
    loading.value = false;
  }
}

const dateStepComponent = computed(() => {
  switch (eventType.value) {
  case "single": return EventSingleDateStep;
  case "multi": return EventMultiDateStep;
  case "recurring": return EventRecurringDateStep;
  default: return null;
  }
});

</script>

<style scoped lang="scss">

</style>
