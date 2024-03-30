<script setup lang="ts">
import type { Component } from "vue";
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import {
  EventTypeStep,
  EventBasicsStep,
  SingleDateStep,
  MultiDateStep,
  RecurringRuleStep,
  EventPricingStep,
  EventComplianceStep
} from "#components";
import type { NewEventItem, OccurrenceType } from "~/types/events";
import type { EventType } from "~/types/events";
import type { EventMultiDate } from "~/components/events/wizard/MultiDateStep.vue";

export type EventWizardAllowedRole = {
  id: string,
  value: string
}

export type EventWizardItem = {
  name?: string,
  description?: string,
  location?: string,
  type?: EventType,
  allowedRoles: EventWizardAllowedRole[],
  leaders: DirectusUser[],
  startDate?: Date | string,
  endDate?: Date | string,
  lastBookingDate?: Date,
  lastOccurrence?: Date,
  advancedPricing?: boolean,
  memberPrice?: number,
  nonMemberPrice?: number,
  coachPrice?: number,
  juniorPrice?: number,
  price?: number,
  dates?: {
    startDate: Date,
    endDate: Date,
  }[],
  rrule?: string,
  occurrenceType?: OccurrenceType,
  requiredPaddlerAbility?: string,
  isPeerPaddle: boolean,
  disclaimer?: string
}

const directus = useDirectus();

const newEvent = reactive<EventWizardItem>({
  occurrenceType: "single",
  location: "Maidstone Canoe Club",
  allowedRoles: [],
  leaders: [],
  isPeerPaddle: true
});

const eventDates = reactive<EventMultiDate[]>([
  {
    startDate: undefined,
    endDate: undefined
  }
]);

export type WizardStep = {
  id: string,
  component: Component,
  disabled?: boolean,
  props?: Record<string, any>
}

const steps = computed(() => {
  const result: WizardStep[] = [
    {
      id: "type",
      component: EventTypeStep
    },
    {
      id: "compliance",
      component: EventComplianceStep
    },
    {
      id: "basics",
      component: EventBasicsStep
    }
  ];

  if (newEvent.allowedRoles.filter(x => x.id !== "none").length > 0) {
    result.push({
      id: "price",
      component: EventPricingStep
    });
  }

  if (newEvent.occurrenceType === "single") {
    result.push({
      id: "single",
      component: SingleDateStep
    });
  } else if (newEvent.occurrenceType === "multi") {
    result.push({
      id: "multi",
      component: MultiDateStep
    });
  } else if (newEvent.occurrenceType === "recurring") {
    result.push({
      id: "single",
      component: SingleDateStep,
      props: {
        hideLastOccurrence: true
      }
    });
    result.push({
      id: "recurring-rule",
      component: RecurringRuleStep
    });
  }

  return result;
});

const currentStepIndex = ref(0);
const currentStep = computed(() => steps.value[currentStepIndex.value]);
const currentStepIsLast = computed(() => currentStepIndex.value === steps.value.length - 1);

function onPrev () {
  currentStepIndex.value -= 1;

  if (currentStep.value.disabled) {
    onPrev();
  }
}

function onAdvance () {
  if (!currentStepIsLast.value) {
    currentStepIndex.value += 1;

    if (currentStep.value.disabled) {
      onAdvance();
    }
  }
}

function toNewEventItem (eventItem: EventWizardItem): NewEventItem {
  return {
    title: eventItem.name!,
    description: eventItem.description,
    location: eventItem.location!,
    start_date: eventItem.startDate!,
    end_date: eventItem.endDate!,
    last_occurrence: eventItem.lastOccurrence,
    last_booking_date: eventItem.lastBookingDate,
    allowed_roles: eventItem.allowedRoles.map(r => r.id),
    rrule: eventItem.rrule!,
    occurrenceType: eventItem.occurrenceType!,
    type: eventItem.type!,
    required_paddler_ability: eventItem.requiredPaddlerAbility,
    is_peer_paddle: eventItem.isPeerPaddle,
    disclaimer: eventItem.disclaimer
  };
}

async function onSubmit () {
  try {
    const newId = await directus("/events/create/", {
      method: "POST",
      body: {
        eventItem: toNewEventItem(newEvent),
        eventDates,
        leaders: newEvent.leaders.map(r => r.id)
      }
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
    <!--    <pre>{{ eventDates }}</pre>-->
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
      v-model:event-dates="eventDates"
      v-bind="currentStep.props"
      #="{validator, isValid}">
      <EventWizardControls
        :current-step-index="currentStepIndex"
        :current-step-is-last="currentStepIsLast"
        :is-valid="isValid"
        :validator="validator"
        :on-submit="onSubmit"
        @prev="onPrev"
        @advance="onAdvance" />
    </component>
  </div>
</template>
