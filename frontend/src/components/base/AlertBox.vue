﻿<template>
  <div
    :class="alertClasses.base"
    class="rounded-md p-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <component
          :is="alertClasses.icon"
          :class="alertClasses.iconColor"
          class="w-5 h-5"
          aria-hidden="true" />
      </div>
      <div class="ml-3 space-y-2">
        <h3
          v-if="heading"
          class="mb-2 font-medium text-sm"
          :class="alertClasses.heading">
          {{ heading }}
        </h3>
        <div
          class="text-sm"
          :class="alertClasses.content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from "@heroicons/vue/20/solid";
import type { FunctionalComponent } from "vue";

export type Variant = "warning" | "error" | "success" | "info";

interface IProps {
  variant: Variant,
  heading: string,
}

interface IVariant {
  base: string,
  icon: FunctionalComponent,
  iconColor: string,
  heading: string,
  content: string
}

const props = withDefaults(defineProps<IProps>(), {
  variant: "warning",
  headingText: undefined
});

const variants: Record<Variant, IVariant> = {
  error: {
    base: "bg-red-50",
    icon: XCircleIcon,
    iconColor: "text-red-400",
    heading: "text-red-800",
    content: "text-red-700"
  },
  warning: {
    base: "bg-yellow-50",
    icon: ExclamationTriangleIcon,
    iconColor: "text-yellow-400",
    heading: "text-yellow-800",
    content: "text-yellow-700"
  },
  success: {
    base: "bg-yellow-50",
    icon: CheckCircleIcon,
    iconColor: "text-yellow-400",
    heading: "text-yellow-800",
    content: "text-yellow-700"
  },
  info: {
    base: "bg-yellow-50",
    icon: InformationCircleIcon,
    iconColor: "text-yellow-400",
    heading: "text-yellow-800",
    content: "text-yellow-700"
  }
};

const alertClasses = computed(() => {
  return variants[props.variant];
});
</script>
