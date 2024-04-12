<script setup lang="ts">
// @ts-ignore
import Dinero from "dinero.js";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

const event = defineModel<EventWizardItem>({ required: true });

const user = useDirectusUser();

const nonMembersAllowed = computed(() => !!event.value.allowedRoles.find(x => x.id === "non-members"));
const membersAllowed = computed(() => !!event.value.allowedRoles.find(x => x.id === "members"));
const juniorsAllowed = computed(() => !!event.value.allowedRoles.find(x => x.id === "juniors"));
const showPrice = computed(() => event.value.allowedRoles.length && !event.value.allowedRoles.find(x => x.id === "none"));

const showAdultPrice = computed(() => nonMembersAllowed.value || membersAllowed.value);

function formatPrice (amount: number | undefined) {
  if (!amount) {
    return null;
  }
  return Dinero({ amount, currency: "GBP" }).toFormat("0.00");
}

watch(() => event.value.advancedPricing, () => {
  event.value.price = undefined;
  event.value.juniorPrice = undefined;
  event.value.memberPrice = undefined;
  event.value.nonMemberPrice = undefined;
  event.value.coachPrice = undefined;
  event.value.nonMemberJuniorPrice = undefined;
});

</script>

<template>
  <div
    v-if="showPrice"
    class="space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-base font-semibold leading-6 text-gray-900">
        Pricing
      </h3>

      <div class="flex">
        <input-toggle
          v-model="event.advancedPricing"
          label="Advanced options" />
      </div>
    </div>

    <template v-if="event.advancedPricing">
      <template v-if="nonMembersAllowed">
        <input-currency
          id="non-members-price"
          v-model="event.nonMemberPrice"
          placeholder="Free"
          label="Non-members price"
          name="non-members-price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for non-members.
        </span>
      </template>

      <template v-if="membersAllowed">
        <input-currency
          id="members-price"
          v-model="event.memberPrice"
          placeholder="Free"
          label="Members price"
          name="members-price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for members.
        </span>

        <input-currency
          id="coach-price"
          v-model="event.coachPrice"
          :placeholder="formatPrice(event.memberPrice) || 'Free'"
          label="Coaches price"
          name="coach-price" />
        <span class="text-sm text-gray-500">
          Important: If you leave this blank, coaches will use the members price. Set to £0 for the event to be free for coaches.
        </span>
      </template>

      <template v-if="juniorsAllowed">
        <input-currency
          id="junior-price"
          v-model="event.juniorPrice"
          placeholder="Free"
          label="Member junior price"
          name="junior-price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for juniors.
        </span>

        <input-currency
          id="non-member-junior-price"
          v-model="event.nonMemberJuniorPrice"
          placeholder="Free"
          label="Non-member junior price"
          name="non-member-junior-price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for non-member juniors.
        </span>
      </template>

      <template v-if="!nonMembersAllowed && !membersAllowed && !juniorsAllowed">
        <p class="text-gray-500">
          You need to choose who can join this event before setting a price.
        </p>
      </template>

      <template v-if="event.occurrenceType === 'recurring'">
        <input-toggle
          id="one-time-payment"
          v-model="event.oneTimePayment"
          label="Allow one-time payment"
          name="one-time-payment" />
        <span class="text-sm text-gray-500">
          If you enable one-time payments, attendees will be able to join all instances of this
          event after they have made the one-time payment. Otherwise all instances of this
          event will require payment.
        </span>
      </template>

      <input-field
        id="payment-reference"
        v-model="event.paymentReference"
        :required="event.oneTimePayment"
        name="payment-reference"
        label="Payment reference" />
    </template>

    <template v-else>
      <template v-if="showAdultPrice">
        <input-currency
          id="price"
          v-model="event.price"
          placeholder="Free"
          label="Price"
          name="price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for adults.
        </span>
      </template>

      <template v-if="juniorsAllowed">
        <input-currency
          id="junior-price"
          v-model="event.juniorPrice"
          placeholder="Free"
          label="Junior price"
          name="junior-price" />
        <span class="text-sm text-gray-500">
          Leave blank for the event to be free for juniors.
        </span>
      </template>
    </template>
  </div>
</template>
