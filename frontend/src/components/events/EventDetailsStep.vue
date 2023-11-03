<template>
  <div>
    <div class="space-y-4">
      <client-only>
        <input-field
          id="title"
          v-model="internalValue.title"
          required
          label="Title"
          name="title"
          :v="v$.title" />

        <input-wysiwyg
          id="description"
          v-model="internalValue.description"
          label="Description" />

        <input-field
          id="location"
          v-model="internalValue.location"
          label="Location"
          required
          name="location"
          :v="v$.location" />

        <input-dropdown
          v-model="internalValue.type"
          :options="eventTypes"
          label="Event type"
          :v="v$.type" />

        <input-dropdown
          v-model="internalValue.allowedRoles"
          multiple
          :options="allowedRoles"
          label="Who can join this event?"
          :v="v$.allowedRoles" />

        <template v-if="showPrice">
          <input-currency
            id="price"
            v-model="internalValue.price"
            label="Price"
            name="price" />
          <span class="text-sm text-gray-500">
            Leave blank for the event to be free
          </span>
        </template>

        <template v-if="juniorsAllowed">
          <input-currency
            id="junior-price"
            v-model="internalValue.junior_price"
            placeholder=""
            label="Junior price"
            name="junior-price" />
          <span class="text-sm text-gray-500">
            Leave blank for the event to be free for juniors
          </span>
        </template>

        <template v-if="showPriceWarning">
          <div class="rounded-md bg-yellow-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">
                  Event will be hidden
                </h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>This event will be hidden if you give this event a price, and will need to be approved before it becomes visible</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div v-show="canChangeLeaders">
          <user-search
            v-model="internalValue.leaders"
            label="Event leaders"
            placeholder="Start typing the name of the club member"
            multiple />
        </div>

        <input-field
          id="max-spaces"
          v-model="internalValue.max_spaces"
          type="number"
          label="Max spaces"
          name="max-spaces" />
        <span class="text-sm text-gray-500">
          Leave blank for no limit on spaces for this event
        </span>
      </client-only>
    </div>

    <event-wizard-footer
      :show-back-button="showBackButton"
      can-go-next
      :is-last="isLast"
      :loading="loading"
      @prev="onPrev"
      @next="onNext" />
  </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core";
import type { Validation } from "@vuelidate/core";
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import { required } from "@vuelidate/validators";
import type { Ref } from "vue";

const emits = defineEmits(["update:modelValue", "prev", "next"]);

const user = useDirectusUser();

const props = defineProps<{
  eventItem: any,
  showBackButton: boolean,
  isLast: boolean,
  loading: boolean
}>();

const internalValue = computed({
  get () {
    return props.eventItem;
  },
  set (val) {
    emits("update:modelValue", val);
  }
});

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
  { id: "race", name: "Race" }
];

watch(() => internalValue.value.allowedRoles, (val, oldVal) => {
  if (oldVal.length === 1 && oldVal[0].id === "none" && val.length > 1) {
    internalValue.value.allowedRoles = val.filter(x => x.id !== "none");
  } else {
    const noOne = val.find(x => x.id === "none");
    if (noOne && val.length > 1) {
      internalValue.value.allowedRoles.value = [noOne];
    }
  }
}, { deep: true });

const juniorsAllowed = computed(() => !!internalValue.value.allowedRoles.find(x => x.id === "juniors"));
const showPrice = computed(() => !internalValue.value.allowedRoles.find(x => x.id === "none"));

const showPriceWarning = computed(() => {
  if ((showPrice.value || juniorsAllowed.value) && hasExactRole(user.value, "member")) {
    return internalValue.value.price || internalValue.value.junior_price;
  }

  return false;
});

const canChangeLeaders = computed(() => {
  return hasRole(user.value, "committee");
});

const rules = {
  title: { required },
  location: { required },
  allowedRoles: { required },
  type: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, internalValue);

function onPrev () {
  emits("prev");
}

function onNext () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    emits("next");
  }
}

</script>

<style scoped lang="scss">

</style>
