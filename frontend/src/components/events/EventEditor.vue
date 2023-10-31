<template>
  <div>
    <div class="mb-4">
      <strong>Edit event</strong>

      <div
        v-if="internalValue.status === 'draft'"
        class="rounded-md bg-yellow-50 p-4 mt-4 border border-yellow-400">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              Event hidden
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>
                This event is currently hidden until approved, but you can still edit it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="space-y-4">
      <input-field
        id="title"
        v-model="internalValue.title"
        name="title"
        label="Title"
        :v="v$.title" />

      <input-wysiwyg
        id="description"
        v-model="internalValue.description"
        name="description"
        label="Description" />

      <input-field
        id="location"
        v-model="internalValue.location"
        title="location"
        name="location"
        label="Location"
        :v="v$.location" />

      <input-dropdown
        id="type"
        v-model="internalValue.type"
        :options="eventTypes"
        label="Event type"
        :v="v$.type" />

      <input-dropdown
        id="allowed-roles"
        v-model="internalValue.allowed_roles"
        multiple
        :options="allowedRoles"
        label="Who can join this event?"
        :v="v$.allowed_roles" />

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

      <!--      <div v-show="canChangeLeaders">-->
      <!--        <user-search-->
      <!--          v-model="internalValue.leaders"-->
      <!--          label="Event leaders"-->
      <!--          placeholder="Start typing the name of the club member"-->
      <!--          multiple />-->
      <!--      </div>-->

      <input-field
        id="max-spaces"
        v-model="internalValue.max_spaces"
        type="number"
        label="Max spaces"
        name="max-spaces" />
      <span class="text-sm text-gray-500">
        Leave blank for no limit on spaces for this event
      </span>

      <div class="flex flex-row gap-2">
        <nuxt-link
          :to="'/events/' + internalValue.id"
          class="rounded-md bg-white flex justify-center items-center px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Go back
        </nuxt-link>
        <custom-button
          :action="onSave"
          class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Save
        </custom-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import { required } from "@vuelidate/validators";
import type { Ref } from "vue";
import { useVuelidate, Validation } from "@vuelidate/core/dist/index";
import type { EventItem } from "~/types";

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

const allowedRoles = [
  { id: "non-members", name: "Non-members" },
  { id: "members", name: "Members" },
  { id: "juniors", name: "Juniors" },
  { id: "none", name: "No one" }
];

const props = defineProps<{
  event: EventItem
}>();

const user = useDirectusUser();
const directus = useDirectus();

const internalValue = ref({ ...props.event });
internalValue.value.type = eventTypes.find(x => x.id === internalValue.value.type);
internalValue.value.allowed_roles = allowedRoles.filter(r => internalValue.value.allowed_roles.includes(r.id));

const juniorsAllowed = computed(() => !!internalValue.value.allowed_roles.find(x => x.id === "juniors"));
const showPrice = computed(() => !internalValue.value.allowed_roles.find(x => x.id === "none"));

watch(() => internalValue.value.allowed_roles, (val, oldVal) => {
  if (oldVal.length === 1 && oldVal[0].id === "none" && val.length > 1) {
    internalValue.value.allowed_roles = val.filter(x => x.id !== "none");
    console.log("here");
  } else {
    const noOne = val.find(x => x.id === "none");
    console.log("there");
    if (noOne && val.length > 1) {
      internalValue.value.allowed_roles = [noOne];
    }
  }
}, { deep: true });

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
  allowed_roles: { required },
  type: { required }
};

const v$: Ref<Validation> = useVuelidate(rules, internalValue);

async function onSave () {
  v$.value.$touch();

  if (!v$.value.$invalid) {
    try {
      const newEventItem = {
        ...internalValue.value
      };

      newEventItem.allowed_roles = newEventItem.allowed_roles.map(x => x.id);
      newEventItem.type = newEventItem.type.id;

      // TODO: need to figure out which leaders have been remove and which have been added
      newEventItem.leaders = undefined;

      await directus("/events/update", {
        method: "POST",
        body: {
          event: newEventItem
          // leaders: internalValue.value.leaders.map(x => x.id)
        }
      });

      await navigateTo("/events/" + newEventItem.id);
    } catch (e) {
      console.error("error updating event", e);
    }
  }
}

</script>

<style scoped lang="scss">

</style>
