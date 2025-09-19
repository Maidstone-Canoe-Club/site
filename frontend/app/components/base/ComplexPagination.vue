<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";

const emits = defineEmits(["next", "prev", "select"]);

const props = defineProps<{
  page: number,
  itemsPerPage: number,
  totalItems: number
}>();

// Computed properties
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));
const firstItemIndex = computed(() => (props.page - 1) * props.itemsPerPage + 1);
const lastItemIndex = computed(() => Math.min(props.page * props.itemsPerPage, props.totalItems));

const pages = computed(() => {
  const numDisplayedPages = 5; // Change this value to adjust the number of displayed page numbers
  const halfDisplay = Math.floor(numDisplayedPages / 2);
  const startPage = Math.max(1, props.page - halfDisplay);
  const endPage = Math.min(totalPages.value, startPage + numDisplayedPages - 1);

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

function onNext () {
  emits("next");
}

function onPrev () {
  emits("prev");
}

function onSelect (page: number) {
  if (page !== props.page) {
    emits("select", page);
  }
}

</script>

<template>
  <div class="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
    <!-- Pagination controls for small screens -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        @click="onPrev">
        Previous
      </button>
      <button
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        @click="onNext">
        Next
      </button>
    </div>
    <!-- Pagination info for larger screens -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Showing
          {{ ' ' }}
          <span class="font-medium">{{ firstItemIndex }}</span>
          {{ ' ' }}
          to
          {{ ' ' }}
          <span class="font-medium">{{ lastItemIndex }}</span>
          {{ ' ' }}
          of
          {{ ' ' }}
          <span class="font-medium">{{ totalItems }}</span>
          {{ ' ' }}
          results
        </p>
      </div>
      <!-- Pagination links -->
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <!-- Previous button -->
          <button
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            @click="onPrev">
            <span class="sr-only">Previous</span>
            <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
          </button>
          <!-- Render page numbers dynamically -->
          <template
            v-for="pageNumber in pages"
            :key="pageNumber">
            <component
              :is="pageNumber === page ? 'span' : 'button'"
              :class="pageNumber === page ? 'bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold"
              @click="() => onSelect(pageNumber)">
              {{ pageNumber }}
            </component>
          </template>
          <!-- Next button -->
          <button
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            @click="onNext">
            <span class="sr-only">Next</span>
            <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
