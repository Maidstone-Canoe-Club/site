<template>
  <div class="mt-10">
    <strong>Event wizard</strong>

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
      @prev="goToPrevStep"
      @next="goToNextStep" />
    <pre>
      {{ eventType }}
    </pre>
    <pre>
      {{ eventItem }}
    </pre>
    <pre>{{ eventDates }}</pre>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/20/solid";
import EventTypeStep from "~/components/events/EventTypeStep.vue";
import EventSingleDateStep from "~/components/events/EventSingleDateStep.vue";
import EventMultiDateStep from "~/components/events/EventMultiDateStep.vue";
import EventRecurringDateStep from "~/components/events/EventRecurringDateStep.vue";
import EventDetailsStep from "~/components/events/EventDetailsStep.vue";

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

const currentStepIndex = ref(0);
const currentStep = computed(() => steps.value[currentStepIndex.value].component);

const eventType = ref("");
const eventItem = ref({
  location: "Maidstone Canoe Club",
  allowedRole: []
});
const eventDates = ref({
  multiple: [],
  recurring: {
    recurringType: { id: "daily", name: "Daily" }
  }
});

const showBackButton = computed(() => currentStepIndex.value >= 1);

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
  try {
    await directus("/events/create", {
      method: "POST",
      body: {
        eventType: eventType.value,
        eventItem: eventItem.value,
        eventDates: eventDates.value
      }
    });
    await navigateTo("/calendar");
  } catch (e) {
    console.error("could not create event", e);
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
