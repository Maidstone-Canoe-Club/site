<template>
  <div>
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
                v-if="subscriptions && subscriptions.length"
                role="list"
                class="divide-y divide-white/5">
                <li v-for="subscription in subscriptions" :key="subscription.id" class="relative flex items-center space-x-4 py-4">
                  <div class="min-w-0 flex-auto">
                    <div class="flex items-center gap-x-3">
                      <h2 class="min-w-0 text-sm font-semibold leading-6">
                        {{ getListName(subscription.list) }}
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
                    @click="tryUnsubscribe(subscription.id, subscription.list)">
                    Unsubscribe
                  </button>
                </li>
              </ul>
              <div v-else>
                <span class="text-sm text-gray-800 mt-3">You aren't subscribed to any mailing lists!</span>
              </div>
            </div>

            <div class="sm:col-span-4">
              <input-dropdown
                v-model="newSubscription"
                :options="subscribableLists"
                label="Subscribe to a mailing list" />
              <custom-button
                v-if="subscribableLists && subscribableLists.length"
                class="mt-3"
                :disabled="!newSubscription"
                :action="onSubscribe">
                Subscribe
              </custom-button>
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

    <dismiss-modal
      v-model:open="showUnsubscribeModal"
      :action="onUnsubscribe"
      title="Unsubscribe"
      action-button-label="Unsubscribe">
      Are you sure you want to unsubscribe from the <strong>{{ unsubscribeListName }}</strong> mailing list?
    </dismiss-modal>
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from "date-fns";
import { useDirectusItems } from "#imports";

const user = useDirectusUser();
const { getItems, deleteItems, createItems } = useDirectusItems();

const unsubscribeId = ref(null);
const unsubscribeListName = ref(null);
const showUnsubscribeModal = ref(false);

const newSubscription = ref({});

const { data: mailingLists } = await useAsyncData("mailing-lists", async () => {
  return await loadMailingLists();
});

async function loadMailingLists () {
  return await getItems({
    collection: "mailing_lists"
  });
}

const { data: subscriptions } = await useAsyncData("subscriptions", async () => {
  return await loadSubscriptions();
});

async function loadSubscriptions () {
  return await getItems({
    collection: "mailing_list_subscriber",
    params: {
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
      const existingSubscription = subscriptions.value?.find(x => x.list === list.id);
      if (!existingSubscription) {
        result.push(list);
      }
    }
  }

  return result;
});

async function onSubscribe () {
  try {
    await createItems({
      collection: "mailing_list_subscriber",
      items: {
        list: newSubscription.value.id,
        email: user.value.email,
        user: user.value.id
      }
    });

    subscriptions.value = await loadSubscriptions();
    newSubscription.value = {};
  } catch (e) {
    console.error("Error subscribing to mailing list", e);
  }
}

async function onUnsubscribe () {
  try {
    await deleteItems({
      collection: "mailing_list_subscriber",
      items: [unsubscribeId.value]
    });

    subscriptions.value = await loadSubscriptions();
  } catch (e) {
    console.error("Error unsubscribing from mailing list", e);
  }
}

function getListName (id: string) {
  return mailingLists.value?.find(x => x.id === id)?.name ?? "UNKNOWN LIST";
}

function tryUnsubscribe (subscriptionId: string, listId: string) {
  unsubscribeId.value = subscriptionId;
  unsubscribeListName.value = getListName(listId);
  showUnsubscribeModal.value = true;
}

function timeSince (input: string) {
  return `Subscribed ${formatDistanceToNow(new Date(input))} ago`;
}

</script>

<style scoped lang="scss">

</style>
