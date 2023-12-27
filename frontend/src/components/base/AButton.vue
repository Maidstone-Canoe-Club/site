<template>
  <component
    :is="element"
    :href="href"
    :to="to"
    :target="target"
    :type="type"
    :class="buttonClass"
    class="relative"
    :disabled="props.disabled || internalLoading"
    @click="onClick">
    <slot />
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div
        v-if="internalLoading"
        :class="buttonClass"
        class="absolute inset-0 flex justify-center items-center">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </transition>
  </component>
</template>
<script setup lang="ts">
import { NuxtLink } from "#components";

export type Variant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const emits = defineEmits(["click"]);

const props = withDefaults(defineProps<{
  variant?: Variant,
  size?: ButtonSize,
  disabled?: boolean,
  href?: string,
  to?: string,
  type?: string,
  target?: string,
  action?:() => Promise<any>,
  loading?: boolean
  keepLoading?: boolean
}>(), {
  variant: "primary",
  size: "md",
  disabled: false,
  href: undefined,
  to: undefined,
  type: "button",
  target: undefined,
  action: undefined,
  loading: false,
  keepLoading: false
});

const internalLoading = ref(false);

watch(() => props.loading, (val) => {
  if (val !== undefined) {
    internalLoading.value = val;
  }
}, { immediate: true });

const variantsMapping: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600",
  secondary: "bg-gray-600 text-white hover:bg-gray-500 focus-visible:outline-gray-600",
  outline: "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600"
};

const sizesMapping: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs rounded",
  sm: "px-2.5 py-1.5 text-sm rounded",
  md: "px-3 py-2 text-sm rounded-md",
  lg: "px-3.5 py-2.5 text-sm rounded-md"
};

const element = computed(() => props.href || props.to ? NuxtLink : "button");

const buttonClass = computed(() => {
  const variant = variantsMapping[props.variant];
  const size = sizesMapping[props.size];
  const disabledClasses = [
    props.disabled ? "opacity-50" : "",
    internalLoading.value || props.disabled ? "cursor-not-allowed" : ""
  ];

  return [
    "inline-flex justify-center items-center gap-x-1.5 font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variant,
    size,
    ...disabledClasses
  ];
});

async function onClick () {
  emits("click");

  if (!props.action) {
    return;
  }

  internalLoading.value = true;

  try {
    await props.action();
  } finally {
    if (!props.keepLoading) {
      internalLoading.value = false;
    }
  }
}
</script>
