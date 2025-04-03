<template>
  <div class="mx-auto max-w-3xl mt-8 px-3 sm:px-0">
    <h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Frequently asked questions
    </h1>

    <div class="mt-12 space-y-4">
      <Disclosure
        v-for="faq in faqs.blocks"
        v-slot="{ open }"
        :key="faq.item.id"
        as="div">
        <DisclosureButton
          class="flex w-full justify-between items-center rounded-lg bg-indigo-100 px-4 py-2 text-left text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75">
          <span>{{ faq.item.question }}</span>
          <MinusIcon
            v-if="open"
            class="h-5 w-5 text-indigo-500" />
          <PlusIcon
            v-else
            class="h-5 w-5 text-indigo-500 flex-shrink-0" />
        </DisclosureButton>
        <DisclosurePanel class="px-4 pt-4 pb-2 text-sm text-gray-500">
          <rich-text :content="faq.item.answer" />
        </DisclosurePanel>
      </Disclosure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, MinusIcon } from "@heroicons/vue/24/outline";

useHead({
  title: "Frequently asked questions"
});

const { getSingletonItem } = useDirectusItems();

const { data: faqs } = await useAsyncData("faqs", async () => {
  return await getSingletonItem({
    collection: "faqs",
    params: {
      fields: ["*", "blocks.item.*"]
    }
  });
});

</script>

<style scoped lang="scss">

</style>
