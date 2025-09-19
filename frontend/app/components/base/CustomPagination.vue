<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
    <div
      class="-mt-px flex w-0 flex-1">
      <button
        v-if="canGoPrev"
        class="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        @click="onPrev">
        <ArrowLongLeftIcon class="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
        Previous
      </button>
    </div>
    <div class="hidden md:-mt-px md:flex">
      <template
        v-for="p in pages"
        :key="p.value">
        <span
          v-if="p.value === '...'"
          class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 select-none">...</span>
        <button
          v-else
          :aria-current="p.current ? 'page': undefined"
          :class="p.current ? 'inline-flex items-center border-t-2 border-indigo-500 px-4 pt-4 text-sm font-medium text-indigo-600' : 'inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'"
          @click="onClick(p.value)">
          {{ p.value }}
        </button>
      </template>
    </div>
    <div
      class="-mt-px flex w-0 flex-1 justify-end">
      <button
        v-if="canGoNext"
        class="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        @click="onNext">
        Next
        <ArrowLongRightIcon class="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ArrowLongLeftIcon, ArrowLongRightIcon } from "@heroicons/vue/20/solid";

const emits = defineEmits(["next", "prev", "click"]);

const props = defineProps<{
  itemsPerPage: number,
  totalPages: number,
  page: number
}>();

const pages = computed(() => {
  const result = [];

  if (props.page > 4) {
    result.push({
      current: false,
      value: 1
    });

    result.push({
      current: false,
      value: 2
    });

    result.push({
      current: false,
      value: "..."
    });
  }

  for (let i = 0; i <= Math.min(props.totalPages, 4); i++) {
    const p = i - 2 + props.page;
    if (p > 0 && p <= props.totalPages) {
      result.push({
        current: p === props.page,
        value: p
      });
    }
  }

  if (props.page < props.totalPages - 4) {
    result.push({
      current: false,
      value: "..."
    });

    result.push({
      current: false,
      value: props.totalPages - 1
    });

    result.push({
      current: false,
      value: props.totalPages
    });
  }

  return result;
});

const canGoPrev = computed(() => {
  return props.page > 1;
});

const canGoNext = computed(() => {
  return props.page < props.totalPages;
});

function onNext () {
  emits("next");
}

function onPrev () {
  emits("prev");
}

function onClick (page: number) {
  emits("click", page);
}

</script>

<style scoped lang="scss">

</style>
