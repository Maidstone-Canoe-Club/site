<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/20/solid";
import type { WizardStep } from "~/components/events/wizard/EventWizard.vue";

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

function changeStep (index: number) {
  currentIndex.value = index;
}

</script>

<template>
  <div>
    <nav aria-label="Progress" class="hidden md:block">
      <ol role="list" class="flex items-center justify-between">
        <li
          v-for="(step, index) in steps"
          :key="step.id"
          :class="[index !== steps.length - 1 ? 'pr-8 flex-grow' : '', 'relative']">
          <template v-if="getStepStatus(index, currentIndex) === 'complete'">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div
                class="h-0.5 w-full"
                :class="[step.disabled ? 'bg-indigo-400' : 'bg-indigo-600']" />
            </div>
            <component
              :is="step.disabled ? 'span' : 'button'"
              class="relative flex h-8 w-8 items-center justify-center rounded-full "
              :class="[step.disabled ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-900']"
              @click="step.disabled ? undefined : () => changeStep(index as number)">
              <CheckIcon class="h-5 w-5 text-white" aria-hidden="true" />
              <span class="sr-only">{{ step.id }}</span>
            </component>
          </template>
          <template v-else-if="getStepStatus(index, currentIndex) === 'current'">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-gray-200" />
            </div>
            <a
              href="#"
              class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white"
              aria-current="step">
              <span class="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
              <span class="sr-only">{{ step.id }}</span>
            </a>
          </template>
          <template v-else>
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="h-0.5 w-full bg-gray-200" />
            </div>
            <a
              href="#"
              class="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white hover:border-gray-400"
              :class="[step.disabled ? 'border-gray-100' : 'border-gray-300']">
              <span class="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
              <span class="sr-only">{{ step.id }}</span>
            </a>
          </template>
        </li>
      </ol>
    </nav>

    <nav class="flex md:hidden items-center justify-center" aria-label="Progress">
      <p class="text-sm font-medium">
        Step {{ currentIndex + 1 }} of {{ steps.length }}
      </p>
      <ol role="list" class="ml-8 flex items-center space-x-5">
        <li
          v-for="(step, index) in steps"
          :key="step.id">
          <div
            v-if="getStepStatus(index, currentIndex) === 'complete'"
            class="block h-2.5 w-2.5 rounded-full bg-indigo-600 hover:bg-indigo-900">
            <span class="sr-only">{{ step.id }}</span>
          </div>
          <div
            v-else-if="getStepStatus(index, currentIndex) === 'current'"
            class="relative flex items-center justify-center"
            aria-current="step">
            <span class="absolute flex h-5 w-5 p-px" aria-hidden="true">
              <span class="h-full w-full rounded-full bg-indigo-200" />
            </span>
            <span class="relative block h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span class="sr-only">{{ step.id }}</span>
          </div>
          <div v-else class="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
            <span class="sr-only">{{ step.id }}</span>
          </div>
        </li>
      </ol>
    </nav>
  </div>
</template>

<style scoped>

</style>
