<template>
  <nav class="flex items-center justify-between border-t border-gray-200 py-3" aria-label="Pagination">
    <div class="hidden sm:block">
      <p
        v-if="totalItems === 0"
        class="text-sm text-gray-700">
        Showing
        {{ ' ' }}
        <span class="font-medium">0</span>
        {{ ' ' }}
        results
      </p>
      <p
        v-else
        class="text-sm text-gray-700">
        Showing
        {{ ' ' }}
        <span class="font-medium">{{ from }}</span>
        {{ ' ' }}
        to
        {{ ' ' }}
        <span class="font-medium">{{ to }}</span>
        {{ ' ' }}
        of
        {{ ' ' }}
        <span class="font-medium">{{ totalItems }}</span>
        {{ ' ' }}
        results
      </p>
    </div>
    <div class="flex flex-1 justify-between sm:justify-end gap-3">
      <button
        v-if="canGoPrev"
        class="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
        @click="onPrev">
        Previous
      </button>
      <button
        v-if="canGoNext"
        class="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
        @click="onNext">
        Next
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">

const emits = defineEmits(["next", "prev"]);

const props = defineProps<{
  itemsPerPage: number,
  totalItems: number,
  page: number
}>();

const from = computed(() => {
  if (props.totalItems === 0) {
    return 0;
  }
  return ((props.page - 1) * props.itemsPerPage) + 1;
});

const to = computed(() => {
  return Math.min(props.page * props.itemsPerPage, props.totalItems);
});

const canGoPrev = computed(() => {
  return props.page > 1;
});

const canGoNext = computed(() => {
  return props.page < props.totalItems * props.page;
});

function onNext () {
  emits("next");
}

function onPrev () {
  emits("prev");
}

</script>

<style scoped lang="scss">

</style>
