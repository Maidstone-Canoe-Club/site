﻿<template>
  <div class="flex items-center justify-center py-6 sm:py-12 flex-col gap-2 mt-12">
    <XCircleIcon
      class="w-24 h-24 mb-4 text-orange-600" />
    <h2 class="font-bold text-4xl">
      Payment cancelled
    </h2>

    <nuxt-link
      v-if="redirect"
      :to="redirect"
      class="mt-4 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
      Click here to continue
    </nuxt-link>
    <nuxt-link
      v-else
      to="/"
      class="mt-4 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
      Click here to go home
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import { XCircleIcon } from "@heroicons/vue/24/outline";

const directus = useDirectus();

const route = useRoute();

const redirect = route.query.redirect ? atob(route.query.redirect) : null;
const orderIds = route.query.o ? atob(route.query.o).split(",") : null;

if (orderIds && orderIds.length) {
  try {
    await directus("/payments/orders/cancel", {
      method: "POST",
      body: {
        orderIds
      }
    });
  } catch (e) {
    console.error("error cancelling orders", e);
  }
} else {
  // throw createError("No orders to cancel");
  console.error("no orders to cancel");
}

</script>

<style scoped lang="scss">

</style>
