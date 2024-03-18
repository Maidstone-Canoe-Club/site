<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/20/solid";
import type { WizardStep } from "~/components/newevents/wizard/NewEventWizard.vue";

const props = defineProps<{
  steps: WizardStep[],
}>();

const currentIndex = defineModel<number>({ required: true });

function getStepStatus (stepIndex: number, currentIndex: number) {
  if (stepIndex < currentIndex) {
    return "complete";
  } else if (stepIndex === currentIndex) {
    return "current";
  } else {
    return "upcoming";
  }
}

const internalSteps = computed(() => {
  return props.steps.map((s: WizardStep, index: number) => ({
    name: s.id,
    status: getStepStatus(index, currentIndex.value)
  }));
});

function changeStep (index: number) {
  currentIndex.value = index;
}

</script>

<template>
  <nav aria-label="Progress">
    <ol role="list" class="flex items-center justify-between">
      <li
        v-for="(step, index) in internalSteps"
        :key="step.name"
        :class="[index !== internalSteps.length - 1 ? 'pr-8 sm:pr-20 flex-grow' : '', 'relative']">
        <template v-if="step.status === 'complete'">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="h-0.5 w-full bg-indigo-600" />
          </div>
          <button
            class="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-900"
            @click="() => changeStep(index as number)">
            <CheckIcon class="h-5 w-5 text-white" aria-hidden="true" />
            <span class="sr-only">{{ step.name }}</span>
          </button>
        </template>
        <template v-else-if="step.status === 'current'">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="h-0.5 w-full bg-gray-200" />
          </div>
          <a
            href="#"
            class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white"
            aria-current="step">
            <span class="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span class="sr-only">{{ step.name }}</span>
          </a>
        </template>
        <template v-else>
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="h-0.5 w-full bg-gray-200" />
          </div>
          <a
            href="#"
            class="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
            <span class="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
            <span class="sr-only">{{ step.name }}</span>
          </a>
        </template>
      </li>
    </ol>
  </nav>
</template>

<style scoped>

</style>
