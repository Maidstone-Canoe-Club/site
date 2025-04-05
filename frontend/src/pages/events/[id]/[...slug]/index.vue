<template>
  <article class="mt-10 text-pretty">
    <alert-box
      v-if="eventInfo.isCancelled"
      class="mb-4"
      variant="error"
      heading="Event cancelled">
      <p>
        This event has been cancelled.
      </p>

      <div
        v-if="eventInfo.cancelReason"
        class="space-y-2">
        <span class="block">Reason:</span>
        <strong>{{ eventInfo.cancelReason }}</strong>
      </div>
    </alert-box>
    <event-review-control
      v-else-if="userCanApprove"
      :event="event"
      :reviewed-by="eventInfo.reviewedBy"
      :review-notes="eventInfo.reviewNotes"
      class="mb-4"
      @refresh="onRefresh" />

    <div class="lg:flex lg:items-center lg:justify-between">
      <div class="min-w-0 flex-1">
        <event-type-badge
          :event="event"
          class="mb-2" />
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {{ event!.title }}
        </h2>
        <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6" />
      </div>
      <div
        v-if="canEdit"
        class="mt-5 flex lg:ml-4 lg:mt-0">
        <a-button
          :to="editLink"
          variant="outline">
          Edit
        </a-button>
        <a-button
          v-if="canCancelEvent"
          variant="danger"
          class="ml-3"
          @click="closeModalOpen = true">
          Cancel
        </a-button>
      </div>
    </div>

    <div class="mt-5">
      <div class="grid md:grid-cols-12 gap-10">
        <div
          ref="contentColumn"
          class="md:col-span-8 min-w-0"
          :class="{'mb-5': !!eventImage}">
          <img
            v-if="eventImage"
            alt="Event image"
            class="rounded-lg mb-5"
            :src="eventImage">

          <div class="space-y-6">
            <rich-text
              v-if="event.description"
              :content="event.description" />

            <alert-box
              v-if="event.type !== 'beginners_course' && event.type !== 'coaching'"
              variant="info"
              heading="Disclaimer">
              <p>
                All our trips are run by club members like you, and unless specifically described otherwise, they are
                <nuxt-link
                  to="/my-first-trip"
                  class="underline">
                  peer paddles.
                </nuxt-link>
              </p>

              <p>
                If you think that you would benefit from the support of a formal river leader or coach, please
                contact the trip organiser in advance - we can usually arrange something! Otherwise you should be
                confident that your own ability matches the trip as planned.
              </p>

              <p>
                If your trip is being led by someone, a more experienced paddler, river leader, or a coach - it
                is your responsibility to mention any medical or other issues which may arise during the trip.
              </p>
            </alert-box>
          </div>
        </div>
        <div class="md:col-span-4 space-y-6">
          <alert-box
            v-if="event.status === 'draft'"
            heading="Event hidden">
            <p class="mb-2">
              Only you can see this event as it has been hidden automatically.
            </p>
            <p>Events need to be approved before being made public.</p>
          </alert-box>

          <div class="flex flex-col gap-1">
            <strong>Details</strong>

            <div class="mt-2 flex items-center text-sm text-gray-500">
              <template v-if="event.paddle_type === 'peer_paddle'">
                <UserGroupIcon
                  class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true" />
                Peer paddle
              </template>
              <template v-else-if="event.paddle_type === 'led_paddle'">
                <FlagIcon
                  class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true" />
                Led paddle
              </template>
              <template v-else-if="event.paddle_type === 'coached_paddle'">
                <LifebuoyIcon
                  class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true" />
                Coached paddle
              </template>
            </div>

            <div
              v-if="event.location"
              class="mt-2 flex items-center text-sm text-gray-500">
              <MapPinIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              {{ event.location }}
            </div>

            <div
              v-if="event.max_spaces"
              class="mt-2 flex items-center text-sm text-gray-500">
              <UsersIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              {{ event.max_spaces }} max spaces
            </div>

            <div
              v-for="(date, index) in sessionDates"
              :key="index">
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                {{ renderSessionDate(date) }}
              </div>
            </div>

            <div
              v-if="eventPrices && eventPrices.length"
              class="mt-2 flex text-sm text-gray-500">
              <CurrencyPoundIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <div class="flex items-center">
                <ul>
                  <li
                    v-for="(eventPrice, index) in eventPrices"
                    :key="index">
                    {{ eventPrice }}
                  </li>
                </ul>
              </div>
            </div>

            <div
              v-if="formattedAllowedRoles"
              class="mt-2 flex items-center text-sm text-gray-500">
              <IdentificationIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <span>
                {{ formattedAllowedRoles }}
              </span>
            </div>

            <div
              v-if="event.last_booking_date"
              class="mt-5 flex items-center text-sm text-gray-700">
              <ExclamationTriangleIcon class="mr-1.5 h-5 w-5 flex-shrink-0 text-orange-400" aria-hidden="true" />
              <span>
                <strong>Bookings cut-off: {{ formatDate(event.last_booking_date) }}</strong>
              </span>
            </div>
          </div>

          <div v-if="leaders && leaders.length">
            <strong>{{ leadersLabel(true) }}</strong>
            <ul
              class="mt-2 flex flex-col gap-2">
              <li
                v-for="leader in leaders"
                :key="leader.id">
                <div class="flex items-center gap-2">
                  <user-avatar
                    :user="leader.directus_users_id"
                    size-class="w-12 h-12" />
                  <span class="truncate">
                    {{ leader.directus_users_id.first_name }} {{ leader.directus_users_id.last_name }}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div
            v-if="leaders && leaders.length && userHasBooking"
            class="flex flex-col gap-2">
            <a-button
              variant="outline"
              @click="onMessageLeaders">
              <EnvelopeIcon class="size-5" />
              Message {{ leadersLabel(true).toLowerCase() }}
            </a-button>
          </div>

          <div
            v-if="bookings.length && userIsLeader"
            class="flex flex-col gap-2">
            <span>{{ leadersLabel(false) }} options</span>
            <a-button
              variant="outline"
              @click="onMarkAttendance">
              <ClipboardDocumentCheckIcon class="size-5" />
              Attendance
            </a-button>

            <a-button
              variant="outline"
              @click="onMessageAttendees">
              <EnvelopeIcon class="size-5" />
              Message attendees
            </a-button>

            <a-button
              variant="outline"
              @click="onDownloadAttendeeDetails">
              <ArrowDownOnSquareStackIcon class="size-5" />
              Download attendee details
            </a-button>

            <!--            <beta-wrapper>-->
            <!--              <a-button-->
            <!--                variant="outline"-->
            <!--                class="w-full"-->
            <!--                @click="onCheckinOther">-->
            <!--                <QrCodeIcon class="size-5" />-->
            <!--                Check-in attendee-->
            <!--              </a-button>-->
            <!--            </beta-wrapper>-->
          </div>

          <div class="mb-5">
            <alert-box
              v-if="event.required_paddler_ability"
              class="mb-5"
              heading="Required paddler skill level">
              <p>{{ event.required_paddler_ability }}</p>
            </alert-box>
            <div v-if="canBook" class="space-y-5">
              <event-booker
                :event="event"
                :price="event.price"
                :user-id="user?.id"
                :junior-price="event.junior_price"
                :instance="instance"
                :already-booked="alreadyBooked"
                :has-required-booking="eventInfo.hasRequiredBooking"
                :other-booking-required="eventInfo.otherBookingRequired"
                :required-event-title="eventInfo.requiredEventTitle"
                :bookings="bookings"
                :spaces-left="eventInfo.spacesLeft"
                :paid-user-ids="eventInfo.paidUserIds"
                @refresh="onRefresh" />
            </div>
            <div
              v-else
              class="rounded-md bg-blue-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <InformationCircleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div class="ml-3 flex-1 md:flex md:justify-between">
                  <p class="text-sm text-blue-700">
                    Bookings are now closed for this event
                  </p>
                </div>
              </div>
            </div>
          </div>
          <alert-box
            v-if="spacesLeftLabel && canBook"
            variant="info">
            {{ spacesLeftLabel }}
          </alert-box>

          <event-attendees
            :bookings="bookings"
            :event-id="event.id"
            :instance="instance"
            :user-is-leader="userIsLeader"
            :attendees-count="eventInfo.bookingsCount"
            @refresh="onRefresh" />
        </div>
      </div>
    </div>

    <lazy-attendance-modal
      v-if="userIsLeader"
      :open="markAttendanceModalOpen"
      :bookings="bookings"
      @refresh="onRefresh"
      @dismiss="markAttendanceModalOpen = false" />

    <lazy-message-attendees-modal
      v-if="userIsLeader"
      :open="messageAttendeesModalOpen"
      :attendee-count="bookings.length"
      :event-id="event.id"
      :instance="instance"
      @dismiss="messageAttendeesModalOpen = false" />

    <lazy-message-leaders-modal
      v-model:open="messageLeadersModalOpen"
      :leaders="leaders"
      :leader-label="leadersLabel(false).toLowerCase()"
      :event-id="event.id"
      :instance="instance" />

    <lazy-attendee-download-modal
      :open="attendeeDownloadModalOpen"
      :event-title="event.title"
      :event-id="event.id"
      :instance="instance"
      @dismiss="attendeeDownloadModalOpen = false" />

    <lazy-checkin-other v-model:open="checkinOtherModalOpen" />

    <lazy-event-cancel-modal
      v-model="closeModalOpen"
      :event="event"
      :instance="instance" />
  </article>
</template>

<script setup lang="ts">
import {
  CalendarIcon,
  CurrencyPoundIcon,
  MapPinIcon,
  UsersIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  ArrowDownOnSquareStackIcon,
  FlagIcon,
  IdentificationIcon,
  LifebuoyIcon
} from "@heroicons/vue/16/solid";
import {
  ClipboardDocumentCheckIcon,
  QrCodeIcon
} from "@heroicons/vue/24/outline";
// @ts-ignore
import Dinero from "dinero.js";
import { format, isSameDay } from "date-fns";
import type { DirectusUser } from "nuxt-directus/dist/runtime/types";
import type { Ref } from "vue";
import type { EventItem } from "~/types";
import { getDatesOfInstance } from "~/utils/events";

const { getItemById, getItems } = useDirectusItems();
const directus = useDirectus();
const route = useRoute();
const user: Ref<DirectusUser> = useDirectusUser();

const instance = route.query.instance ? parseInt(route.query.instance as string, 10) : null;

const childEvents = ref();

const markAttendanceModalOpen = ref(false);
const messageAttendeesModalOpen = ref(false);
const messageLeadersModalOpen = ref(false);
const attendeeDownloadModalOpen = ref(false);
const checkinOtherModalOpen = ref(false);
const closeModalOpen = ref(false);

const { data: eventResponse } = await useAsyncData<EventItem>(`event-item-${route.params.id}`, async () => {
  return await getItemById<EventItem>({
    collection: "events",
    id: route.params.id as string
  });
});

if (!eventResponse.value) {
  throw showError({
    statusCode: 404,
    statusMessage: "Event not found"
  });
}

const event = computed(() => eventResponse.value!);

const slug = slugify(event.value.title);

// TODO: Look into issue with og images
// defineOgImageComponent("EventImage", {
//   headline: "Event",
//   event: event.value
// });

const formattedAllowedRoles = computed(() => {
  if (!event.value) {
    return null;
  }

  const roles = event.value.allowed_roles;

  if (!roles || !roles.length) {
    return null;
  }

  if (roles.includes("none")) {
    return null;
  }

  const camelCase = (input: string) => {
    return input.charAt(0).toUpperCase() + input.substring(1);
  };

  const joinOrAnd = (input: string[]) => {
    if (input.length === 2) {
      return input[0] + " & " + input[1];
    }

    if (input.length === 1) {
      return input[0];
    }

    return input.slice(0, -1).join(", ") + " & " + input[input.length - 1];
  };

  if (roles.includes("non-members")) {
    let result = camelCase(joinOrAnd(roles));
    if (event.value.min_age) {
      result += " (ages " + event.value.min_age + "+)";
    }
    return result;
  }

  let result = camelCase(joinOrAnd(roles) + " only");
  if (event.value.min_age) {
    result += " (ages " + event.value.min_age + "+)";
  }

  return result;
});

if (!route.params.slug && slug) {
  let redirect = route.path;
  if (!redirect.endsWith("/")) {
    redirect += "/";
  }

  redirect += slug;

  if (instance !== null) {
    redirect += `?instance=${instance}`;
  }
  await navigateTo(redirect, {
    replace: true,
    redirectCode: 301
  });
} else if (route.params.slug && route.params.slug[0] !== slug) {
  throw showError({
    statusCode: 404,
    statusMessage: "Event not found"
  });
}

useSeoMeta({
  title: event.value.title,
  ogTitle: event.value.title
});

const { data: eventInfoResponse } = await useAsyncData(`event-info-${event.value.id}`, async () => {
  return await loadInfo();
});

if (!eventInfoResponse.value) {
  throw showError({
    statusCode: 400,
    statusMessage: "Could not load event details"
  });
}

const eventInfo = ref(eventInfoResponse.value!);

const alreadyBooked = computed(() => eventInfo.value.alreadyBooked ?? false);
const bookings = computed(() => eventInfo.value.bookings ?? []);
const leaders = computed(() => eventInfo.value.leaders ?? []);
const userCanApprove = computed(() => eventInfo.value?.userCanApprove ?? false);

const userIsLeader = computed(() => {
  if (leaders.value && leaders.value.length && user.value) {
    return !!leaders.value.find((x: any) => x.directus_users_id.id === user.value.id);
  }

  return false;
});

async function loadInfo () {
  let url = `/events/info?eventId=${event.value!.id}`;
  if (instance !== null && instance !== undefined) {
    url += "&instance=" + instance;
  }
  return await directus(url, {
    headers: {
      "Cache-Control": "no-cache"
    }
  });
}

if (event.value.has_multiple) {
  const { data: events } = await useAsyncData(`event-item-${event.value.id}-children`, async () => {
    return await getItems({
      collection: "events",
      params: {
        filter: {
          _and: [
            {
              parent_event: {
                _eq: event.value.id
              }
            },
            {
              status: {
                _neq: "cancelled"
              }
            }
          ]
        }
      }
    });
  });

  childEvents.value = events.value;
}

const eventPrices = computed(() => {
  const prices: string[] = [];

  if (event.value.member_price) {
    prices.push(`${formatPrice(event.value.member_price)} per adult member`);
  }

  if (event.value.non_member_price) {
    prices.push(`${formatPrice(event.value.non_member_price)} per adult non-member`);
  }

  if (event.value.junior_price) {
    prices.push(`${formatPrice(event.value.junior_price)} per junior`);
  }

  if (event.value.non_member_junior_price) {
    prices.push(`${formatPrice(event.value.non_member_junior_price)} per non-member junior`);
  }

  if (event.value.coach_price) {
    prices.push(`${formatPrice(event.value.coach_price)} per coach`);
  }

  if (event.value.price) {
    prices.push(`${formatPrice(event.value.price)} per adult`);
  }

  return prices;
});

const sessionDates = computed(() => {
  let result = null;

  if (!event.value.has_multiple && !event.value.is_recurring) {
    result = [];
    result.push({
      start: event.value.start_date,
      end: event.value.end_date
    });
  }

  if (event.value.has_multiple && childEvents.value?.length) {
    result = [];
    result.push({
      start: event.value.start_date,
      end: event.value.end_date
    });

    childEvents.value.forEach((e) => {
      result.push({
        start: e.start_date,
        end: e.end_date
      });
    });
  }

  if (event.value.is_recurring && instance !== null) {
    result = [];

    const { start, end } = getDatesOfInstance(event.value, instance);

    result.push({
      start,
      end
    });
  }

  if (result) {
    result = result.sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }

  return result;
});

const canBook = computed(() => {
  if (eventInfo.value.isCancelled) {
    return false;
  }

  const canBookAfterStart = event.value.allow_booking_after_start;
  if (!canBookAfterStart) {
    const lastBookingDate = event.value?.last_booking_date;
    if (lastBookingDate && new Date(lastBookingDate) < new Date()) {
      return false;
    }
  }

  if (sessionDates.value && sessionDates.value.length) {
    const firstDate = sessionDates.value[0].start;
    return new Date() < new Date(firstDate);
  }
  return false;
});

const userHasBooking = computed(() => {
  if (!user.value || !bookings.value || bookings.value.length === 0) {
    return false;
  }

  for (const booking of bookings.value) {
    if (booking.status === "cancelled") {
      continue;
    }

    if (booking.user.id === user.value.id || (booking.user.parent && booking.user.parent.id === user.value.id)) {
      return true;
    }
  }

  return false;
});

function formatPrice (amount?: number) {
  if (!amount) {
    return null;
  }
  return `£${Dinero({ amount, currency: "GBP" }).toFormat(amount % 100 === 0 ? "0" : "0.00")}`;
}

const directusUrl = useDirectusUrl();
const editLink = computed(() => {
  let result = `/events/${route.params.id}/${route.params.slug}/edit`;

  if (route.query.instance) {
    result += `?instance=${route.query.instance}`;
  }

  return result;
});

const canEdit = computed(() => {
  // // TODO: ONLY TEMP
  // if (event.value!.is_recurring) {
  //   return false;
  // }

  const userCreatedEvent = user.value && event.value!.user_created === user.value.id;
  if (userCreatedEvent) {
    return true;
  }

  if (hasRole(user.value, "committee")) {
    return true;
  }

  return userIsLeader.value;
});

const contentColumn = ref(null);
const imageWidth = ref(null);

onMounted(() => {
  imageWidth.value = contentColumn.value.clientWidth;
});

const eventImage = computed(() => {
  if (event.value!.image) {
    let url = `${directusUrl}/assets/${event.value.image}?format=webp&height=450`;

    if (imageWidth.value) {
      url += "&width=" + imageWidth.value;
    }

    return url;
  }
  return null;
});

function renderSessionDate (date: any) {
  // For some reason when navigating to the edit page,
  // this method is called and the start and end dates are undefined
  if (date.start === undefined || date.end === undefined) {
    return "";
  }

  if (isSameDay(new Date(date.start), new Date(date.end))) {
    return formatDate(date.start) + " - " + format(new Date(date.end), "h:mmaa");
  }
  return formatDate(date.start) + " - " + formatDate(date.end);
}

function formatDate (date: string) {
  return format(new Date(date), "do MMM, h:mmaa");
}

async function onRefresh () {
  eventInfo.value = await loadInfo();
}

const spacesLeftLabel = computed(() => {
  let result = null;

  if (eventInfo.value.spacesLeft) {
    if (eventInfo.value.spacesLeft === 0) {
      result = "There are no spaces left";
    } else if (eventInfo.value.spacesLeft === 1) {
      result = "There is one space left!";
    } else {
      result = `There are ${eventInfo.value.spacesLeft} spaces left`;
    }
  }

  return result;
});

function leadersLabel (pluralize: boolean) {
  let result = event.value.paddle_type === "peer_paddle" || event.value.paddle_type === "other" ? "Organiser" : "Leader";
  if (pluralize) {
    result += "s";
  }
  return result;
}

const canCancelEvent = computed(() => {
  return !eventInfo.value.isCancelled;
});

function onMessageLeaders () {
  messageLeadersModalOpen.value = true;
}

function onMessageAttendees () {
  messageAttendeesModalOpen.value = true;
}

function onDownloadAttendeeDetails () {
  attendeeDownloadModalOpen.value = true;
}

function onMarkAttendance () {
  markAttendanceModalOpen.value = true;
}

function onCheckinOther () {
  checkinOtherModalOpen.value = true;
}

</script>

<style scoped lang="scss">

</style>
