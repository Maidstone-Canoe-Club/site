<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import type { Ref } from "vue";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";
import type { EventPaddleType, EventType } from "~/types";

const props = defineProps<{
  editMode: boolean
}>();

const event = defineModel<EventWizardItem>({ required: true });

const confirm = ref<boolean>(props.editMode);
const showPreview = ref<boolean>(false);

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
  { id: "social_events", name: "Social event" },
  { id: "fun_session", name: "Fun session" },
  { id: "race", name: "Race" },
  { id: "meetings", name: "Meetings" }
];

const eventType = ref<EventTypeOption | undefined>(eventTypes.find(t => t.id === event.value.type));

watch(eventType, (val) => {
  if (val) {
    event.value.type = val.id;
    if (val.id === "meetings") {
      event.value.paddleType = "other";
    } else if (val.id === "beginners_course") {
      event.value.paddleType = "led_paddle";
    } else {
      event.value.paddleType = undefined;
    }
  }
}, { deep: true });

function confirmIsValid () {
  if (event.value.paddleType === "peer_paddle" || event.value.paddleType === "other") {
    return true;
  }

  return confirm.value;
}

const rules = {
  event: {
    type: { required },
    paddleType: { required: helpers.withMessage("You must choose a paddle type", required) }
  },
  confirm: {
    required: helpers.withMessage(
      "Must be checked in order to proceed",
      confirmIsValid
    )
  }
};

const validator = useVuelidate<{ event: Ref<EventWizardItem>, confirm: Ref<boolean> }>(rules, {
  event,
  confirm
});

watch(() => event.value.paddleType, () => {
  confirm.value = false;
});

function onPreviewDisclaimer () {
  showPreview.value = true;
}

type PaddleType = {
  id: EventPaddleType,
  name: string,
  description?: string
}

const paddleTypes: PaddleType[] = [
  {
    id: "peer_paddle",
    name: "Peer paddle"
  },
  {
    id: "led_paddle",
    name: "Led paddle"
  },
  {
    id: "coached_paddle",
    name: "Coached paddle"
  },
  {
    id: "other",
    name: "Other",
    description: "Select when the event is not a paddle"
  }
];
const selectedPaddleType = ref<PaddleType | undefined>(paddleTypes.find(t => t.id === event.value.paddleType));

watch(selectedPaddleType, (val) => {
  if (val) {
    event.value.paddleType = val.id;
  } else {
    event.value.paddleType = undefined;
  }

  // Stops the validation message appearing if the user failed to choose a paddle type
  validator.value.$reset();
}, { deep: true });

watch(() => event.value.paddleType, (val) => {
  if (selectedPaddleType.value?.id !== val) {
    selectedPaddleType.value = paddleTypes.find(p => p.id === val);
  }
});

</script>

<template>
  <div class="space-y-6">
    <strong>Important information</strong>

    <input-dropdown
      id="event-type"
      v-model="eventType"
      :options="eventTypes"
      label="Event type"
      required
      :v="validator.type" />

    <div
      class="space-y-2">
      <input-radio-group
        v-model="selectedPaddleType"
        :disabled="!eventType || eventType.id === 'meetings'"
        :required="eventType && eventType.id !== 'meetings'"
        by="id"
        :options="paddleTypes"
        :v="validator.event.paddleType" />
      <div
        class="block text-gray-700">
        If the event is a peer paddle, users will not be able to book onto this event.
      </div>
    </div>

    <div class="space-y-2">
      <input-text-area
        id="paddler-level"
        v-model="event.requiredPaddlerAbility"
        name="paddler-level"
        label="Required paddler skill level" />
      <div class="text-gray-700 space-y-2">
        <div>
          Please specify the required paddling skill level for event attendees to join.
        </div>
        <div>
          For example, "Paddlers must have their Explore award and FSRT/PSRT" or "Must be comfortable on grade 3 white
          water".
        </div>
      </div>
    </div>

    <template v-if="event.paddleType && event.paddleType !== 'peer_paddle' && event.paddleType !== 'other'">
      <div class="space-y-2">
        <input-wysiwyg
          id="disclaimer"
          v-model="event.disclaimer"
          label="Disclaimer"
          name="disclaimer" />

        <div class="text-gray-700">
          Enter any other disclaimer the user must agree to before booking onto this event.
        </div>

        <div class="flex justify-between items-center gap-3">
          <span class="text-gray-700 text-sm flex-shrink">
            Click to preview the disclaimer popup as users will see it when booking
          </span>
          <a-button
            variant="outline"
            size="sm"
            @click="onPreviewDisclaimer">
            Preview
          </a-button>
        </div>
      </div>

      <div>
        <input-checkbox
          id="confirm"
          v-model="confirm"
          name="confirm"
          required
          :v="validator.confirm"
          label="I confirm the leaders assigned to this event are competent to lead this event" />
      </div>

      <event-disclaimer-modal
        v-model:open="showPreview"
        book-now-label="Okay"
        :event="event" />
    </template>

    <div class="footer">
      <hr class="mb-6">
      <slot
        v-bind="{validator}" />
    </div>
  </div>
</template>
