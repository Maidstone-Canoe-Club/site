<script setup lang="ts">
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const props = defineProps<{
  editMode: boolean
}>();

const event = defineModel<EventWizardItem>({ required: true });

const confirm = ref<boolean>(props.editMode);
const showPreview = ref<boolean>(false);

const isValid = computed(() => {
  if (event.value.isPeerPaddle) {
    return true;
  }

  return confirm.value;
});

watch(() => event.value.isPeerPaddle, () => {
  confirm.value = false;
});

function onPreviewDisclaimer () {
  showPreview.value = true;
}

</script>

<template>
  <div class="space-y-6">
    <strong>Important information</strong>

    <div class="space-y-2">
      <input-toggle
        v-model="event.isPeerPaddle"
        label="Event is peer paddle" />
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

    <input-checkbox
      v-if="!event.isPeerPaddle"
      id="confirm"
      v-model="confirm"
      name="confirm"
      required
      label="I confirm the leaders assigned to this event are competent to lead this event" />

    <event-disclaimer-modal
      v-model:open="showPreview"
      book-now-label="Okay"
      :event="event" />

    <div class="footer">
      <hr class="mb-6">
      <slot :is-valid="isValid" />
    </div>
  </div>
</template>
