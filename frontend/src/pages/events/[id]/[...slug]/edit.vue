<template>
  <div class="mt-16 mx-auto max-w-4xl px-3 sm:px-0">
    <event-editor
      :event="event"
      :instance="instance" />
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  middleware: ["auth"]
});

const { getItemById } = useDirectusItems();

const route = useRoute();

const { data: event } = await useAsyncData(`event-item-${route.params.id}`, async () => {
  return await getItemById({
    collection: "events",
    id: route.params.id as string
  });
});

const instance = computed(() => route.query.instance);

if (!event.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Event not found"
  });
}
</script>

<style scoped lang="scss">

</style>
