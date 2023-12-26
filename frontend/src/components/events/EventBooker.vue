<template>
  <div>
    <template v-if="!user">
      <nuxt-link
        :to="loginUrl"
        class="w-full flex justify-center items-center rounded-md bg-indigo-600 px-2.5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Login to book
      </nuxt-link>
    </template>

    <template v-else>
      <div
        v-if="userHasAllowedRole"
        class="w-full">
        <!--        <advanced-booker-->
        <!--          v-if="advancedPricing"-->
        <!--          :event="event"-->
        <!--          :payment-url="paymentUrl"-->
        <!--          :already-booked="alreadyBooked"-->
        <!--          :spaces-left="spacesLeft" />-->
        <!--        <template v-else>-->
        <multi-booker
          v-if="canBookJuniors"
          :event="event"
          :instance="instance"
          :price="event.price"
          :junior-price="event.junior_price"
          :payment-url="paymentUrl"
          :current-bookings="bookings"
          :spaces-left="spacesLeft"
          :juniors="juniors"
          @refresh="onRefresh" />
        <single-booker
          v-else
          :event="event"
          :instance="instance"
          :price="priceForUser"
          :payment-url="paymentUrl"
          :already-booked="alreadyBooked"
          :spaces-left="spacesLeft"
          @refresh="onRefresh" />
        <!--        </template>-->
      </div>
      <div v-else>
        You aren't allowed to book onto this event
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { EventItem } from "~/types";

const emits = defineEmits(["refresh"]);

const props = defineProps<{
  event: EventItem,
  instance?: string,
  patternType?: string,
  alreadyBooked: boolean,
  spacesLeft?: number,
  bookings: any,
}>();

const user = useDirectusUser();
const route = useRoute();
const { getUsers } = useDirectusUsers();

const loginUrl = computed(() => `/login?redirect=${route.path}`);

const canBookJuniors = computed(() => props.event.allowed_roles?.map(x => x.toLowerCase()).includes("juniors") ?? false);

// const advancedPricing = computed(() => props.event.advanced_pricing);
const advancedPricing = ref(false);

const { data: juniors } = await useAsyncData("juniors-" + user.value?.id, async () => {
  return await loadJuniors();
});

async function loadJuniors () {
  if (user.value) {
    return await getUsers({
      params: {
        fields: ["id", "first_name", "last_name", "role.name"],
        filter: {
          parent: {
            _eq: user.value.id
          }
        }
      }
    });
  }

  return null;
}

const paymentUrl = computed(() => {
  let result = `/api/eventPayment?eventId=${props.event.id}&userId=${user.value.id}`;

  if (props.instance) {
    result += `&instance=${props.instance}`;
  }

  if (props.patternType) {
    result += `&patternType=${props.patternType}`;
  }

  return result;
});

const userHasAllowedRole = computed(() => {
  const result = true;

  if (!user.value) {
    return true;
  }

  const allowed = props.event.allowed_roles;
  if (allowed && allowed.length) {
    const nobodyAllowed = allowed.includes("No one");

    if (nobodyAllowed) {
      return false;
    }

    for (const allowedRole of allowed) {
      if (hasRole(user.value, mapAllowedRoleToUserRole(allowedRole))) {
        return true;
      }
    }

    return false;
  }

  return result;
});

const priceForUser = computed(() => {
  if (props.event.advanced_pricing) {
    if (hasExactRole(user.value, "member")) {
      return props.event.member_price;
    } else if (hasExactRole(user.value, "non_member")) {
      return props.event.non_member_price;
    } else if (hasExactRole(user.value, "coach")) {
      return props.event.coach_price;
    }

    return null;
  } else {
    return props.event.price;
  }
});

function mapAllowedRoleToUserRole (allowedRole: string) {
  switch (allowedRole.toLowerCase()) {
  case "non-members": return "Unapproved";
  case "juniors": return "Junior";
  case "members": return "Member";
  case "none": return null;
  default: throw new Error("Unknown allowed role: " + allowedRole);
  }
}

function onRefresh () {
  emits("refresh");
}

</script>

<style scoped lang="scss">

</style>
