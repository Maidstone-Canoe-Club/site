<template>
  <div class="mt-16 mx-auto max-w-4xl px-3 sm:px-0">
    <event-wizard
      :events="events"
      :instance="instance"
      :bookings-count="bookingsCount" />
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import type { EventItem } from "~/types";

definePageMeta({
  middleware: ["auth"]
});

const {
  getItemById,
  getItems
} = useDirectusItems();
const directus = useDirectus();

const route = useRoute();

const { data: events } = await useAsyncData<EventItem[]>(`event-item-edit-${route.params.id}`, async () => {
  const events: EventItem[] = [];
  const event = await getItemById<EventItem | undefined>({
    collection: "events",
    id: route.params.id as string,
    params: {
      fields: [
        "*",
        "leaders.directus_users_id.first_name",
        "leaders.directus_users_id.last_name",
        "leaders.directus_users_id.id",
        "leaders.directus_users_id.avatar"]
    }
  });

  if (event) {
    events.push(event);

    if (event.has_multiple) {
      const others = await getItems<EventItem>({
        collection: "events",
        params: {
          filter: {
            _and: [
              {
                status: {
                  _neq: "cancelled"
                }
              },
              {
                parent_event: {
                  _eq: event.id
                }
              }
            ]
          }
        }
      });

      console.log("loaded other events", others);
      events.push(...others);
    }
  }

  return events;
});

const instance = computed(() => route.query.instance);

if (!events.value || events.value.length === 0) {
  throw showError({
    statusCode: 404,
    statusMessage: "Event not found"
  });
}

const { data: eventInfo } = await useAsyncData(`event-info-edit-${route.params.id}`, async () => {
  let url = `/events/info?eventId=${route.params.id}`;
  if (instance.value) {
    url += "&instance=" + instance.value;
  }
  return await directus(url, {
    headers: {
      "Cache-Control": "no-cache"
    }
  });
});

const bookingsCount = computed(() => {
  if (eventInfo.value) {
    return eventInfo.value.bookingsCount;
  }

  return 0;
});

</script>

<style scoped lang="scss">

</style>
