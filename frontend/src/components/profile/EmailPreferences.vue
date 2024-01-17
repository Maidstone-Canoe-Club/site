<template>
  <div class="flex flex-col gap-10">
    <div class="grid grid-cols-1 gap-x-8 gap-y-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-base font-semibold leading-7 text-gray-900">
          Mailing lists
        </h2>
      </div>

      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div class="px-4 py-6 sm:p-8">
          <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div class="sm:col-span-4">
              <span class="block text-sm font-medium leading-6 text-gray-900">Current subscriptions</span>
              <ul
                v-if="mailingListSubscriptions && mailingListSubscriptions.length"
                role="list"
                class="divide-y divide-white/5">
                <li v-for="subscription in mailingListSubscriptions" :key="subscription.id" class="relative flex items-center space-x-4 py-4">
                  <div class="min-w-0 flex-auto">
                    <div class="flex items-center gap-x-3">
                      <h2 class="min-w-0 text-sm font-semibold leading-6">
                        {{ subscription.list.name }}
                      </h2>
                    </div>
                    <div class="flex items-center gap-x-2.5 text-xs leading-5 text-gray-600">
                      <p class="whitespace-nowrap">
                        {{ timeSince(subscription.date_created) }}
                      </p>
                    </div>
                  </div>
                  <button
                    class="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    @click="tryMailingListUnsubscribe(subscription.id, subscription.list.name)">
                    Unsubscribe
                  </button>
                </li>
              </ul>
              <div v-else>
                <span class="text-sm text-gray-800 mt-3">You aren't subscribed to any mailing lists!</span>
              </div>
            </div>

            <div class="sm:col-span-4">
              <template
                v-if="subscribableLists && subscribableLists.length">
                <input-dropdown
                  v-model="newSubscription"
                  :options="subscribableLists"
                  label="Subscribe to a mailing list" />
                <a-button
                  class="mt-3"
                  :disabled="!newSubscription"
                  :action="onMailingListSubscribe">
                  Subscribe
                </a-button>
              </template>
              <div
                v-else
                class="text-sm text-gray-800 mt-3">
                There are no more mailing lists you can subscribe to.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-x-8 gap-y-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-base font-semibold leading-7 text-gray-900">
          Newsletters
        </h2>
      </div>

      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div class="px-4 py-6 sm:p-8">
          <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div class="sm:col-span-4">
              <span class="block text-sm font-medium leading-6 text-gray-900">Current subscriptions</span>
              <ul
                v-if="newsletterSubscriptions && newsletterSubscriptions.length"
                role="list"
                class="divide-y divide-white/5">
                <li v-for="subscription in newsletterSubscriptions" :key="subscription.id" class="relative flex items-center space-x-4 py-4">
                  <div class="min-w-0 flex-auto">
                    <div class="flex items-center gap-x-3">
                      <h2 class="min-w-0 text-sm font-semibold leading-6">
                        {{ subscription.newsletter.name }}
                      </h2>
                    </div>
                    <div class="flex items-center gap-x-2.5 text-xs leading-5 text-gray-600">
                      <p class="whitespace-nowrap">
                        {{ timeSince(subscription.date_created) }}
                      </p>
                    </div>
                  </div>
                  <a-button
                    variant="outline"
                    size="sm"
                    :action="() => tryNewsletterUnsubscribe(subscription.id, subscription.newsletter.name)">
                    Unsubscribe
                  </a-button>
                </li>
              </ul>
              <div v-else>
                <span class="text-sm text-gray-800 mt-3">You aren't subscribed to any newsletters!</span>
              </div>
            </div>

            <div class="sm:col-span-4">
              <template
                v-if="subscribableNewsletters && subscribableNewsletters.length">
                <input-dropdown
                  v-model="newNewsletterSubscription"
                  :options="subscribableNewsletters"
                  label="Subscribe to a newsletter" />
                <custom-button
                  class="mt-3"
                  :disabled="!newNewsletterSubscription"
                  :action="onNewsletterSubscribe">
                  Subscribe
                </custom-button>
              </template>
              <div
                v-else
                class="text-sm text-gray-800 mt-3">
                There are no more newsletters you can subscribe to.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <dismiss-modal
      v-model:open="showUnsubscribeModal"
      :action="onUnsubscribe"
      variant="warning"
      title="Unsubscribe"
      action-button-label="Unsubscribe">
      Are you sure you want to unsubscribe from the <strong>{{ unsubscribeListName }}</strong> mailing list?
    </dismiss-modal>

    <dismiss-modal
      v-model:open="showNewsletterUnsubscribeModal"
      :action="onNewsletterUnsubscribe"
      variant="warning"
      title="Unsubscribe"
      action-button-label="Unsubscribe">
      Are you sure you want to unsubscribe from the <strong>{{ unsubscribeNewsletterName }}</strong> newsletter?
    </dismiss-modal>
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from "date-fns";
import { useDirectusItems } from "#imports";

const user = useDirectusUser();
const { getItems, deleteItems, createItems } = useDirectusItems();

const unsubscribeId = ref(null);
const unsubscribeNewsletterId = ref(null);
const unsubscribeListName = ref(null);
const unsubscribeNewsletterName = ref(null);
const showUnsubscribeModal = ref(false);
const showNewsletterUnsubscribeModal = ref(false);

const newSubscription = ref({});
const newNewsletterSubscription = ref({});

const { data: mailingLists } = await useAsyncData("mailing-lists", async () => {
  return await loadMailingLists();
});

const { data: newsletters } = await useAsyncData("newsletters", async () => {
  return await loadNewsletters();
});

async function loadMailingLists () {
  return await getItems({
    collection: "mailing_lists",
    params: {
      filter: {
        public: {
          _eq: true
        }
      }
    }
  });
}

async function loadNewsletters () {
  return await getItems({
    collection: "newsletters",
    params: {
      filter: {
        public: {
          _eq: true
        }
      }
    }
  });
}

const { data: mailingListSubscriptions } = await useAsyncData("mailing-list-subscriptions", async () => {
  return await loadMailingListSubscriptions();
});

const { data: newsletterSubscriptions } = await useAsyncData("newsletter-subscriptions", async () => {
  return await loadNewsletterSubscriptions();
});

async function loadMailingListSubscriptions () {
  return await getItems({
    collection: "mailing_list_subscriber",
    params: {
      fields: ["*", "list.name", "list.id"],
      filter: {
        _or: [
          {
            user: {
              _eq: user.value.id
            }
          },
          {
            email: {
              _eq: user.value.email
            }
          }
        ]
      }
    }
  });
}

async function loadNewsletterSubscriptions () {
  return await getItems({
    collection: "newsletter_subscriber",
    params: {
      fields: ["*", "newsletter.name", "newsletter.id"],
      filter: {
        _or: [
          {
            user: {
              _eq: user.value.id
            }
          },
          {
            email: {
              _eq: user.value.email
            }
          }
        ]
      }
    }
  });
}

const subscribableLists = computed(() => {
  const result = [];

  if (mailingLists.value && mailingLists.value.length) {
    for (const list of mailingLists.value) {
      const existingSubscription = mailingListSubscriptions.value?.find(x => x.list.id === list.id);
      if (!existingSubscription) {
        result.push(list);
      }
    }
  }

  return result;
});

const subscribableNewsletters = computed(() => {
  const result = [];

  if (newsletters.value && newsletters.value.length) {
    for (const newsletter of newsletters.value) {
      const existingSubscription = newsletterSubscriptions.value?.find(x => x.newsletter.id === newsletter.id);
      if (!existingSubscription) {
        result.push(newsletter);
      }
    }
  }

  return result;
});

async function onMailingListSubscribe () {
  try {
    await createItems({
      collection: "mailing_list_subscriber",
      items: {
        list: newSubscription.value.id,
        email: user.value.email,
        user: user.value.id
      }
    });

    mailingListSubscriptions.value = await loadMailingListSubscriptions();
    newSubscription.value = {};
  } catch (e) {
    console.error("Error subscribing to mailing list", e);
  }
}

async function onNewsletterSubscribe () {
  try {
    await createItems({
      collection: "newsletter_subscriber",
      items: {
        newsletter: newNewsletterSubscription.value.id,
        email: user.value.email,
        user: user.value.id
      }
    });

    newsletterSubscriptions.value = await loadNewsletterSubscriptions();
    newNewsletterSubscription.value = {};
  } catch (e) {
    console.error("Error subscribing to newsletter", e);
  }
}

async function onUnsubscribe () {
  try {
    await deleteItems({
      collection: "mailing_list_subscriber",
      items: [unsubscribeId.value]
    });

    mailingListSubscriptions.value = await loadMailingListSubscriptions();
  } catch (e) {
    console.error("Error unsubscribing from mailing list", e);
  }
}

async function onNewsletterUnsubscribe () {
  try {
    await deleteItems({
      collection: "newsletter_subscriber",
      items: [unsubscribeNewsletterId.value]
    });

    newsletterSubscriptions.value = await loadNewsletterSubscriptions();
  } catch (e) {
    console.error("Error unsubscribing from newsletter", e);
  }
}

function tryMailingListUnsubscribe (subscriptionId: string, listName: string) {
  unsubscribeId.value = subscriptionId;
  unsubscribeListName.value = listName;
  showUnsubscribeModal.value = true;
}

function tryNewsletterUnsubscribe (newsletterId: string, newsletterName: string) {
  console.log("trying unsub");
  unsubscribeNewsletterId.value = newsletterId;
  unsubscribeNewsletterName.value = newsletterName;
  showNewsletterUnsubscribeModal.value = true;
}

function timeSince (input: string) {
  return `Subscribed ${formatDistanceToNow(new Date(input))} ago`;
}

</script>

<style scoped lang="scss">

</style>
