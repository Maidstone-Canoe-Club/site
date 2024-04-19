<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const rules = {
  name: { required },
  location: { required },
  allowedRoles: { required }
};

const validator = useVuelidate<EventWizardItem>(rules, event);

const allowedRoles = [
  { id: "non-members", name: "Non-members" },
  { id: "members", name: "Members" },
  { id: "juniors", name: "Juniors" },
  { id: "none", name: "No one" }
];

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

const minAge = computed(() => {
  const selectedJunior = !!event.value.allowedRoles.find(x => x.id === "juniors");
  if (selectedJunior) {
    return 8;
  }

  return null;
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
      :placeholder="minAge ?? 'Any age'"
      :min="minAge"
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
      :label="event.paddleType === 'peer_paddle' || event.paddleType === 'other' ? 'Event organiser(s)' : 'Event leader(s)'"
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
