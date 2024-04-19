<template>
  <div>
    <div class="overflow-x-auto">
      <table
        v-if="payments && payments.length"
        class="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" class="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">
              Order ID
            </th>
            <th scope="col" class="py-3.5 pl-4 text-left text-sm font-semibold text-gray-900">
              Amount
            </th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Description
            </th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Payment date
            </th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="payment in payments" :key="payment.id">
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:pl-0">
              {{ formatId(payment.id) }}
            </td>
            <td class="whitespace-nowrap py-3 pl-4 text-sm font-medium text-gray-900">
              {{ formatPrice(payment.amount) }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ payment.description }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ formatDate(payment.date_created) }}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              <span
                v-if="payment.status"
                class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                :class="{
                  'bg-green-50 text-green-700 ring-green-600/20': payment.status === 'paid',
                  'bg-blue-50 text-blue-700 ring-blue-700/20': payment.status === 'pending',
                  'bg-yellow-50 text-yellow-800 ring-yellow-600/10': payment.status === 'refunded',
                  'bg-red-50 text-red-700 ring-red-600/10': payment.status === 'cancelled'
                }">
                {{ formatStatus(payment.status) }}
              </span>
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
              <nuxt-link
                v-if="payment.href"
                :to="payment.href"
                class="text-indigo-600 hover:text-indigo-900">
                {{ payment.hrefLabel }}
              </nuxt-link>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>
        No payments made yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import Dinero from "dinero.js";
import { format } from "date-fns";

const user = useDirectusUser();
const { getItems } = useDirectusItems();

const { data: payments } = await useAsyncData(`payment-history-${user.value!.id}`, async () => {
  const items = await getItems({
    collection: "orders",
    params: {
      sort: ["-date_created"],
      filter: {
        user: {
          _eq: user.value!.id
        }
      }
    }
  });

  return items.map((x) => {
    const result = {
      ...x,
      metadata: x.metadata ? JSON.parse(x.metadata) : null
    };
    result.href = getLink(result);
    result.hrefLabel = getLabel(result);
    return result;
  });
});

function getLink (payment) {
  if (!payment.metadata) {
    return undefined;
  }

  const metadata = payment.metadata;

  if (metadata.event_id) {
    let result = "/events/" + metadata.event_id;

    if (metadata.instance) {
      result += "?instance=" + metadata.instance;
    }

    return result;
  }
  return undefined;
}

function getLabel (payment) {
  if (!payment.metadata) {
    return undefined;
  }

  const metadata = payment.metadata;

  if (metadata.event_id) {
    return "View event";
  }

  return null;
}

function formatPrice (amount?: number) {
  if (!amount) {
    return null;
  }

  const result = `£${Dinero({ amount, currency: "GBP" }).toFormat("0.00")}`;
  return result.endsWith(".00") ? result.substring(0, result.length - 3) : result;
}

function formatDate (input: string) {
  return format(new Date(input), "do MMMM yyyy, hh:mmaaa");
}

function formatId (id: string) {
  return id.substring(0, 7);
}

function formatStatus (input: string) {
  if (input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
  return null;
}

</script>

<style scoped lang="scss">

</style>
