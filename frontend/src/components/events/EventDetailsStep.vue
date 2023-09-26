<template>
  <div>
    <div class="space-y-4">
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

      <input-field
        id="max-spaces"
        v-model="internalValue.max_spaces"
        type="number"
        label="Max spaces"
        name="max-spaces" />
      <span class="text-sm text-gray-500">
        Leave blank for no limit on spaces for this event
      </span>
    </div>
    <event-wizard-footer
      :show-back-button="showBackButton"
      can-go-next
      :is-last="isLast"
      @prev="onPrev"
      @next="onNext" />
  </div>
</template>

<script setup lang="ts">
import { useVuelidate, Validation } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { Ref } from "vue";

const emits = defineEmits(["update:modelValue", "prev", "next"]);

const props = defineProps<{
  eventItem: any,
  showBackButton: boolean,
  isLast: boolean
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
