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
  EventComplianceStep,
  RecurringSelectStep,
  NotificationSettingsStep
} from "#components";
import type { NewEventItem, OccurrenceType } from "~/types/events";
import type { EventType } from "~/types/events";
import type { EventMultiDate } from "~/components/events/wizard/MultiDateStep.vue";
import { BlankEventTemplate } from "~/utils/events";
import type { EventItem } from "~/types";

export type EventWizardAllowedRole = {
  id: string,
  name: string
}

export type EditRecurringType = "all" | "single-instance"

export type EventWizardItem = {
  name?: string,
  description?: string,
  location?: string,
  type?: EventType,
  allowedRoles: EventWizardAllowedRole[],
  leaders: DirectusUser[],
  maxSpaces?: number,
  startDate?: Date | string,
  endDate?: Date | string,
  lastBookingDate?: Date,
  lastOccurrence?: Date,
  memberPrice?: number,
  nonMemberPrice?: number,
  nonMemberJuniorPrice?: number,
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
  disclaimer?: string,
  allowBookingsAfterStart?: boolean,
  minAge?: number
  visibleAttendees?: boolean
  notifyUsers?: boolean,
  paddleType?: "peer_paddle" | "led_paddle" | "coached_paddle",
  paymentReference?: string,
  oneTimePayment: boolean,
  advancedPricing: boolean
}

const props = defineProps<{
  events?: EventItem[],
  instance?: number,
  bookingsCount?: number
}>();

const editMode = computed<boolean>(() => !!props.events && props.events.length > 0);

const directus = useDirectus();

const newEvent = ref<EventWizardItem>(initialEventItem());
const editRecurringType = ref<EditRecurringType | undefined>();
const eventDates = reactive<EventMultiDate[]>(initialEventDates());

export type WizardStep = {
  id: string,
  component: Component,
  disabled?: boolean,
  props?: Record<string, any>
}

const steps = computed(() => {
  const result: WizardStep[] = [];

  if (!editMode.value) {
    result.push({
      id: "type",
      component: EventTypeStep
    });
  } else if (newEvent.value.occurrenceType === "recurring") {
    result.push({
      id: "recurring-type",
      component: RecurringSelectStep
    });
  }

  result.push(
    {
      id: "compliance",
      component: EventComplianceStep
    },
    {
      id: "basics",
      component: EventBasicsStep
    }
  );

  if (newEvent.value.allowedRoles.filter(x => x.id !== "none").length > 0) {
    result.push({
      id: "price",
      component: EventPricingStep
    });
  }

  if (newEvent.value.occurrenceType === "single") {
    result.push({
      id: "single",
      component: SingleDateStep,
      props: {
        changingSingle: true
      }
    });
  } else if (newEvent.value.occurrenceType === "multi") {
    result.push({
      id: "multi",
      component: MultiDateStep
    });
  } else if (newEvent.value.occurrenceType === "recurring") {
    if (editRecurringType.value === "single-instance") {
      result.push({
        id: "single",
        component: SingleDateStep,
        props: {
          changingInstance: true,
          hideLastOccurrence: true
        }
      });
    } else {
      result.push({
        id: "single",
        component: SingleDateStep,
        props: {
          startDateLabel: "When does the first instance of this event start?",
          endDateLabel: "When does the first instance of this event end?",
          hideLastOccurrence: true,
          changingAll: true
        }
      });
      // TEMP
      if (!editMode.value) {
        result.push({
          id: "recurring-rule",
          component: RecurringRuleStep,
          props: {
            changingAll: true
          }
        });
      }
    }
  }

  if (editMode.value) {
    result.push({
      id: "notifications",
      component: NotificationSettingsStep
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

function initialEventItem () {
  if (props.events && props.events.length > 0) {
    return existingEventToWizardEvent(props.events[0]);
  }

  return BlankEventTemplate;
}

function initialEventDates (): EventMultiDate[] {
  if (props.events && props.events.length > 0) {
    return props.events!
      .sort((a, b) => {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      })
      .map((e, index) => ({
        id: e.id,
        startDate: e.start_date,
        endDate: e.end_date
      }));
  }

  return [{
    startDate: undefined,
    endDate: undefined
  }];
}

function existingEventToWizardEvent (eventItem: EventItem): EventWizardItem {
  let occurrenceType: OccurrenceType = "single";
  if (eventItem.is_recurring) {
    occurrenceType = "recurring";
  } else if (eventItem.has_multiple) {
    occurrenceType = "multi";
  }

  const roles = [
    { id: "non-members", name: "Non-members" },
    { id: "members", name: "Members" },
    { id: "juniors", name: "Juniors" },
    { id: "none", name: "No one" }
  ];

  return {
    name: eventItem.title,
    description: eventItem.description,
    location: eventItem.location,
    type: eventItem.type,
    allowedRoles: eventItem.allowed_roles ? roles.filter((r: any) => eventItem.allowed_roles?.includes(r.id)) : [],
    leaders: eventItem.leaders ? eventItem.leaders.map((l: any) => l.directus_users_id) : [],
    startDate: new Date(eventItem.start_date),
    endDate: new Date(eventItem.end_date),
    lastBookingDate: undefined,
    lastOccurrence: eventItem.last_occurence ? new Date(eventItem.last_occurence) : undefined,
    memberPrice: eventItem.member_price,
    nonMemberPrice: eventItem.non_member_price,
    nonMemberJuniorPrice: eventItem.non_member_junior_price,
    coachPrice: eventItem.coach_price,
    juniorPrice: eventItem.junior_price,
    price: eventItem.price,
    maxSpaces: eventItem.max_spaces,
    dates: [],
    rrule: eventItem.rrule,
    occurrenceType,
    requiredPaddlerAbility: eventItem.required_paddler_ability,
    disclaimer: eventItem.disclaimer,
    allowBookingsAfterStart: eventItem.allow_bookings_after_start,
    minAge: eventItem.min_age,
    visibleAttendees: eventItem.visible_attendees,
    paddleType: eventItem.paddle_type,
    paymentReference: eventItem.payment_reference,
    oneTimePayment: eventItem.one_time_payment || false,
    advancedPricing: eventItem.advanced_pricing || false
  };
}

function toNewEventItem (eventItem: EventWizardItem): NewEventItem {
  return {
    title: eventItem.name!,
    description: eventItem.description,
    location: eventItem.location!,
    start_date: eventItem.startDate!,
    end_date: eventItem.endDate!,
    max_spaces: eventItem.maxSpaces || null,
    last_occurrence: eventItem.lastOccurrence,
    last_booking_date: eventItem.lastBookingDate,
    allowed_roles: eventItem.allowedRoles.map(r => r.id),
    rrule: eventItem.rrule!,
    occurrenceType: eventItem.occurrenceType!,
    type: eventItem.type!,
    required_paddler_ability: eventItem.requiredPaddlerAbility,
    disclaimer: eventItem.disclaimer,
    allow_bookings_after_start: eventItem.allowBookingsAfterStart,
    min_age: eventItem.minAge,
    visible_attendees: eventItem.visibleAttendees,
    notifyUsers: eventItem.notifyUsers,
    price: eventItem.price,
    junior_price: eventItem.juniorPrice,
    member_price: eventItem.memberPrice,
    non_member_price: eventItem.nonMemberPrice,
    non_member_junior_price: eventItem.nonMemberJuniorPrice,
    coach_price: eventItem.coachPrice,
    paddle_type: eventItem.paddleType,
    payment_reference: eventItem.paymentReference,
    one_time_payment: eventItem.oneTimePayment,
    advanced_pricing: eventItem.advancedPricing
  };
}

async function onSubmit () {
  try {
    let eventId;

    if (editMode.value) {
      eventId = null;

      const existingEventId = props.events![0].id;

      let url = `/events/update?eventId=${existingEventId}`;

      if (editRecurringType.value) {
        url += `&editType=${editRecurringType.value}`;
      }

      eventId = await directus(url, {
        method: "POST",
        body: {
          event: toNewEventItem(newEvent.value),
          eventDates: sortEventDates(eventDates),
          leaders: newEvent.value.leaders.map(r => r.id)
        }
      });
    } else {
      eventId = await directus("/events/create/", {
        method: "POST",
        body: {
          eventItem: toNewEventItem(newEvent.value),
          eventDates: sortEventDates(eventDates),
          leaders: newEvent.value.leaders.map(r => r.id)
        }
      });
    }

    let returnUrl = `/events/${eventId}`;
    if (props.instance) {
      returnUrl += `?instance=${props.instance}`;
    }
    console.log("return url", returnUrl);
    await navigateTo(returnUrl);
  } catch (e) {
    console.error("create event error", e);
  }
}

function sortEventDates (eventDates: EventMultiDate[]) {
  return eventDates.sort((a, b) => {
    if (!a.startDate) {
      return 0;
    }

    if (!b.startDate) {
      return 0;
    }

    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

</script>

<template>
  <div class="space-y-8 mt-12">
    <!--    <pre>{{ newEvent }}</pre>-->
    <!--    <pre>{{ eventDates }}</pre>-->
    <!--    <pre>currentStepIndex: {{ currentStepIndex }}</pre>-->
    <!--    <pre>currentStepIsLast: {{ currentStepIsLast }}</pre>-->

    <dismiss-modal
      v-if="editMode"
      :open="true"
      variant="primary"
      title="New events editor"
      cancel-button="Okay"
      :allow-click-outside-dismiss="false"
      hide-action-button>
      <div class="space-y-2">
        <p>
          Welcome to the updated events editor!
        </p>
        <p>
          This page has been changed to use the same wizard used when creating events. Here you'll be able to change
          all properties that exist on events.
        </p>
        <p>
          There are two things you cant do just yet: edit a single instance of a recurring event or change event dates.
          These features are rather complex and need a bit more time to finish and get right. In the meantime can still
          edit all of the details against events!
        </p>
        <p>
          You won't see this message for long, just until the events editor is fully up and running.
        </p>
      </div>
    </dismiss-modal>

    <h1 class="text-2xl font-bold text-center">
      {{ editMode ? "Editing event" : "Create new event" }}
    </h1>
    <div class="m-auto max-w-2xl">
      <EventWizardSteps
        v-model="currentStepIndex"
        :steps="steps" />
    </div>
    <div class="m-auto max-w-xl space-y-8">
      <component
        :is="currentStep.component"
        v-model="newEvent"
        v-model:event-dates="eventDates"
        v-bind="currentStep.props"
        v-model:edit-recurring-type="editRecurringType"
        :original-event="events && events.length ? events[0] : undefined"
        :instance="instance"
        :edit-mode="editMode"
        :bookings-count="bookingsCount"
        #="{validator, isValid}">
        <EventWizardControls
          :current-step-index="currentStepIndex"
          :current-step-is-last="currentStepIsLast"
          :is-valid="isValid"
          :validator="validator"
          :on-submit="onSubmit"
          :edit-mode="editMode"
          @prev="onPrev"
          @advance="onAdvance" />
      </component>
    </div>
  </div>
</template>
