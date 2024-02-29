<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import type { EventWizardItem } from "~/components/newevents/wizard/NewEventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  name: { required }
};

const validator = useVuelidate(rules, event);

const allowedRoles = [
  { id: "non-members", name: "Non-members" },
  { id: "members", name: "Members" },
  { id: "juniors", name: "Juniors" },
  { id: "none", name: "No one" }
];

const eventTypes = [
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

    <input-wysiwyg
      id="description"
      v-model="event.description"
      label="Description" />

    <input-field
      id="location"
      v-model="event.location"
      required
      label="Location"
      :v="validator.location" />

    <input-dropdown
      id="event-type"
      v-model="event.type"
      :options="eventTypes"
      label="Event type"
      :v="validator.type" />

    <input-dropdown
      id="allowed-roles"
      v-model="event.allowedRoles"
      multiple
      :options="allowedRoles"
      label="Who can join this event?"
      :v="validator.allowedToles" />

    <user-search
      v-show="canChangeLeaders"
      v-model="event.leaders"
      label="Event leaders"
      placeholder="Start typing the name of a club member"
      multiple />

    <div class="footer">
      <slot v-bind="{validator}" />
    </div>
  </div>
</template>

<style scoped>

</style>
