﻿<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import type { EventType } from "~/types/events";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  name: { required },
  location: { required },
  type: { required },
  allowedRoles: { required }
};

const validator = useVuelidate<EventWizardItem>(rules, event);

const allowedRoles = [
  { id: "non-members", name: "Non-members" },
  { id: "members", name: "Members" },
  { id: "juniors", name: "Juniors" },
  { id: "none", name: "No one" }
];

type EventTypeOption = {
  id: EventType,
  name: string
}

const eventTypes: EventTypeOption[] = [
  { id: "beginners_course", name: "Beginners course" },
  { id: "club_paddle", name: "Regular club paddle" },
  { id: "pool_session", name: "Pool session" },
  { id: "paddles_trips_tours", name: "Paddles, trips & tours" },
  { id: "race_training", name: "Race training" },
  { id: "coaching", name: "Coaching" },
  { id: "social_event", name: "Social event" },
  { id: "fun_session", name: "Fun session" },
  { id: "race", name: "Race" },
  { id: "meetings", name: "Meetings" }
];

const eventType = ref<EventTypeOption | undefined>(eventTypes.find(t => t.id === event.value.type));

watch(eventType, (val) => {
  if (val) {
    event.value.type = val.id;
  }
}, { deep: true });

watch(() => event.value.allowedRoles, (val, oldVal) => {
  if (oldVal.length === 1 && oldVal[0].id === "none" && val.length > 1) {
    event.value.allowedRoles = val.filter(x => x.id !== "none");
  } else {
    const noOne = val.find(x => x.id === "none");
    if (noOne && val.length > 1) {
      event.value.allowedRoles = [noOne];
    }
  }
}, { deep: true });

const user = useDirectusUser();

const canChangeLeaders = computed(() => {
  return hasRole(user.value, "committee");
});

</script>

<template>
  <div class="space-y-6">
    <strong>Basic info</strong>

    <input-field
      id="name"
      v-model="event.name"
      required
      label="Event name"
      :v="validator.name" />

    <input-field
      id="location"
      v-model="event.location"
      placeholder="Maidstone Canoe Club"
      required
      label="Location"
      :v="validator.location" />

    <input-wysiwyg
      id="description"
      v-model="event.description"
      label="Description" />

    <input-field
      id="max-spaces"
      v-model="event.maxSpaces"
      name="max-spaces"
      type="number"
      placeholder="Unlimited"
      label="Max spaces"
      min="0" />

    <input-dropdown
      id="event-type"
      v-model="eventType"
      :options="eventTypes"
      label="Event type"
      required
      :v="validator.type" />

    <input-dropdown
      id="allowed-roles"
      v-model="event.allowedRoles"
      multiple
      :options="allowedRoles"
      required
      label="Who can join this event?"
      :v="validator.allowedRoles" />

    <input-field
      id="min-age"
      v-model="event.minAge"
      name="min-age"
      type="number"
      placeholder="Any age"
      min="8"
      label="Minimum attendee age" />

    <div>
      <input-checkbox
        id="visible-attendees"
        v-model="event.visibleAttendees"
        name="visible-attendees"
        label="Are attendees visible?" />
      <small>When enabled, event attendees can see who else has booked onto the same event. Enable this for events like
        the Sunday Paddle, but not for events like Beginners Courses.</small>
    </div>

    <hr>

    <user-search
      v-show="canChangeLeaders"
      v-model="event.leaders"
      :label="event.isPeerPaddle ? 'Event organiser(s)' : 'Event leader(s)'"
      placeholder="Start typing the name of a club member"
      multiple />

    <div class="footer">
      <hr class="mb-6">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>