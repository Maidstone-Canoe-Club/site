<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import { required, requiredIf, and, helpers } from "@vuelidate/validators";
import type { Ref } from "vue";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";
import type { EventPaddleType } from "~/types";

const props = defineProps<{
  editMode: boolean
}>();

const event = defineModel<EventWizardItem>({ required: true });

const confirm = ref<boolean>(props.editMode);
const showPreview = ref<boolean>(false);

function confirmIsValid () {
  if (event.value.paddleType === "peer_paddle") {
    return true;
  }

  return confirm.value;
}

const rules = {
  event: {
    paddleType: { required: helpers.withMessage("You must choose a paddle type", required) }
  },
  confirm: {
    required: helpers.withMessage(
      "Must be checked in order to proceed",
      // requiredIf(() => {
      //   console.log("checking if", event.value.paddleType !== "peer_paddle");
      //   return event.value.paddleType !== "peer_paddle";
      // })
      confirmIsValid
    )
  }
};

const validator = useVuelidate<{ event: Ref<EventWizardItem>, confirm: Ref<boolean> }>(rules, {
  event,
  confirm
});

// const isValid = computed(() => {
//   if (event.value.paddleType === "peer_paddle") {
//     return true;
//   }
//
//   return confirm.value;
// });

watch(() => event.value.paddleType, () => {
  confirm.value = false;
});

function onPreviewDisclaimer () {
  showPreview.value = true;
}

type PaddleType = {
  id: EventPaddleType,
  name: string
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
  }
];
const selectedPaddleType = ref<PaddleType | undefined>(paddleTypes.find(t => t.id === event.value.paddleType));

watch(selectedPaddleType, (val) => {
  if (val) {
    event.value.paddleType = val.id;
  } else {
    event.value.paddleType = undefined;
  }

  // Stops the validation message appearing if the user failed to choose a paddle
  // type
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

    <div class="space-y-2">
      <input-radio-group
        v-model="selectedPaddleType"
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

    <template v-if="event.paddleType && event.paddleType !== 'peer_paddle'">
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
