<script setup lang="ts">
import { ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/vue/20/solid";
import { definePageMeta } from "#imports";

definePageMeta({
  middleware: ["auth"]
});

const route = useRoute();
const e = route.query.e;
const l = route.query.l;

const email = ref<string | null>(e ? decodeURIComponent(atob(e)) : null);
const list = ref<string | null>(l ? decodeURIComponent(atob(l)) : null);

const confirmed = ref<boolean>(false);
const success = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

const {
  getItems,
  deleteItems
} = useDirectusItems();

const { data: mailingList } = await useAsyncData("list", async () => {
  const lists = await getItems({
    collection: "mailing_lists",
    params: {
      filter: {
        id: {
          _eq: list.value
        }
      }
    }
  });

  return lists && lists.length ? lists[0] : null;
});

const { data: subscription } = await useAsyncData("subscriptions", async () => {
  const subscriptions = await getItems({
    collection: "mailing_list_subscriber",
    params: {
      filter: {
        _and: [
          {
            list: {
              _eq: list.value
            }
          },
          {
            email: {
              _eq: email.value
            }
          }
        ]
      }
    }
  });

  return subscriptions && subscriptions.length ? subscriptions[0] : null;
});

async function onUnsubscribe () {
  try {
    await deleteItems({
      collection: "mailing_list_subscriber",
      items: [subscription.value.id]
    });
    success.value = true;
  } catch (e) {
    console.error("Error trying to unsubscribe", e);
    errorMessage.value = "Something went wrong trying to unsubscribe you from that list.";
  } finally {
    confirmed.value = true;
  }
}

</script>

<template>
  <div class="flex items-center justify-center py-6 sm:py-12 flex-col gap-2">
    <template v-if="!subscription || !mailingList">
      <p>Cannot unsubscribe, unknown subscription or mailing list.</p>
    </template>
    <template v-else>
      <template v-if="!confirmed">
        <p>Are you sure you want to unsubscribe from the <strong>{{ mailingList.name }}</strong> mailing list?</p>
        <custom-button :action="onUnsubscribe">
          Yes, unsubscribe
        </custom-button>
      </template>
      <template v-else>
        <ShieldCheckIcon
          v-if="success"
          class="w-12 h-12 mb-4 text-lime-600" />
        <ExclamationTriangleIcon
          v-else
          class="w-12 h-12 mb-6 text-orange-500" />
        <h2
          v-if="success"
          class="font-bold text-4xl">
          Unsubscribed
        </h2>
        <p v-if="!success">
          {{ errorMessage || "Unable to unsubscribe from the list." }}
        </p>
        <p v-else>
          You have been successfully unsubscribed. You can re-subscribe from your <nuxt-link
            to="/profile"
            class="text-indigo-500 underline inline-block">
            profile
          </nuxt-link> page.
        </p>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss">

</style>
