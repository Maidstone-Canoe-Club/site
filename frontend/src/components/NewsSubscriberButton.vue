<script setup lang="ts">
import { EnvelopeIcon } from "@heroicons/vue/20/solid";

const user = useDirectusUser();
const directus = useDirectus();
const config = useRuntimeConfig();
const baseUrl = config.public.directus.url;

const hasSubscription = ref(false);
const showConfirmModal = ref(false);

if (user.value) {
  const url = baseUrl + "/news-posts/check";
  hasSubscription.value = await directus<boolean>("/news-posts/check", {
    method: "GET"
  });
}

const buttonLabel = computed(() => hasSubscription.value ? "Unsubscribe" : "Subscribe to news posts");

const route = useRoute();
const loginUrl = computed(() => `/login?redirect=${route.fullPath}`);

async function onClick () {
  if (hasSubscription.value) {
    await onUnsubscribe();
  } else {
    showConfirmModal.value = true;
  }
}

async function onSubscribe () {
  umTrackEvent("news-post-subscribe");
  hasSubscription.value = await directus<boolean>("/news-posts/subscribe", {
    method: "POST"
  });
}

async function onUnsubscribe () {
  umTrackEvent("news-post-unsubscribe");
  const result = await directus("/news-posts/unsubscribe", {
    method: "POST"
  });

  if (result) {
    hasSubscription.value = false;
  }
}

</script>

<template>
  <div>
    <a-button
      variant="outline"
      size="sm"
      :to="!user ? loginUrl : undefined"
      :action="!user ? undefined : onClick">
      <span class="flex items-center justify-center gap-2">
        <EnvelopeIcon
          v-if="!hasSubscription"
          class="h-5 w-5"
          aria-hidden="true" />
        {{ buttonLabel }}
      </span>
    </a-button>
    <dismiss-modal
      :open="showConfirmModal"
      :action="onSubscribe"
      variant="primary"
      title="Subscribe"
      action-button-label="Subscribe"
      @dismiss="showConfirmModal = false">
      <p>
        By subscribing, you will receive an email whenever a new news post is published.
      </p>
      <p class="mt-2">
        You can unsubscribe either on
        this page or by clicking the unsubscribe link in the emails you receive.
      </p>
    </dismiss-modal>
  </div>
</template>

<style scoped lang="scss">

</style>
