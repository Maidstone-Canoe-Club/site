<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/20/solid";
import type { EventItem } from "~/types";

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: EventItem
}>();

const user = useDirectusUser();
const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
}, { deep: true });

watch(internalValue, (val) => {
  emits("update:modelValue", val);
}, { deep: true });

// const advanced = ref(false);

const nonMembersAllowed = computed(() => !!internalValue.value.allowedRoles.find(x => x.id === "non-members"));
const membersAllowed = computed(() => !!internalValue.value.allowedRoles.find(x => x.id === "members"));
const juniorsAllowed = computed(() => !!internalValue.value.allowedRoles.find(x => x.id === "juniors"));
const showPrice = computed(() => internalValue.value.allowedRoles.length && !internalValue.value.allowedRoles.find(x => x.id === "none"));

const showAdultPrice = computed(() => nonMembersAllowed.value || membersAllowed.value);

const showPriceWarning = computed(() => {
  if ((showPrice.value || juniorsAllowed.value) && hasExactRole(user.value, "member")) {
    if (internalValue.value.advanced_pricing) {
      return internalValue.value.member_price ||
        internalValue.value.non_member_price ||
        internalValue.value.coach_price;
    } else {
      return internalValue.value.price ||
        internalValue.value.junior_price;
    }
  }

  return false;
});

</script>

<template>
  <div
    v-if="showPrice"
    class="border border-dashed border-gray-500 rounded-md p-4 space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-base font-semibold leading-6 text-gray-900">
        Pricing
      </h3>

      <div class="flex">
        <input-toggle
          v-model="internalValue.advanced_pricing"
          label="Advanced options" />
      </div>
    </div>

    <template v-if="internalValue.advanced_pricing">
      <template v-if="nonMembersAllowed">
        <input-currency
          id="non-members-price"
          v-model="internalValue.non_member_price"
          label="Non-members price"
          name="non-members-price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for non-members.
        </span>
      </template>

      <template v-if="membersAllowed">
        <input-currency
          id="members-price"
          v-model="internalValue.member_price"
          label="Members price"
          name="members-price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for members.
        </span>

        <input-currency
          id="coach-price"
          v-model="internalValue.coach_price"
          label="Coaches price"
          name="coach-price" />
        <span class="text-sm text-gray-500">
          If you leave this blank, coaches will use the members price. Set to £0 for the event to be free for coaches.
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
          Leave blank for the event to be free for juniors.
        </span>
      </template>

      <template v-if="!nonMembersAllowed && !membersAllowed && !juniorsAllowed">
        <p class="text-gray-500">
          You need to choose who can join this event before setting a price.
        </p>
      </template>
    </template>

    <template v-else>
      <template v-if="showAdultPrice">
        <input-currency
          id="price"
          v-model="internalValue.price"
          label="Price"
          name="price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for adults.
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
          Leave blank for the event to be free for juniors.
        </span>
      </template>
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
              <p>
                This event will be hidden if you give this event a price, and will need to be approved before it
                becomes visible
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">

</style>
