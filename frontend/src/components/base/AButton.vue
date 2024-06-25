<template>
  <component
    :is="element"
    :href="href"
    :to="to"
    :target="target"
    :type="type"
    :class="buttonClass"
    class="relative"
    :disabled="internalDisabled || internalLoading"
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
import { type ButtonSize, type ButtonVariant } from "~/utils/buttons";

const emits = defineEmits(["click"]);

const props = withDefaults(defineProps<{
  variant?: ButtonVariant,
  size?: ButtonSize,
  disabled?: boolean,
  href?: string,
  to?: string,
  type?: string,
  target?: string,
  action?:(() => Promise<any>) | (() => void),
  loading?: boolean
  keepLoading?: boolean,
  hideLoader?: boolean,
  disableTimeoutMs?: number
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
  keepLoading: false,
  hideLoader: false,
  disableTimeoutMs: undefined
});

const isDisabled = ref(!!props.disableTimeoutMs);
const internalDisabled = computed(() => props.disabled || isDisabled.value);

const internalLoading = ref(false);

watch(() => props.loading, (val) => {
  if (val !== undefined) {
    internalLoading.value = val;
  }
}, { immediate: true });

const element = computed(() => props.href || props.to ? NuxtLink : "button");

const buttonClass = computed(() => {
  const variant = ButtonVariantClasses[props.variant];
  const size = ButtonSizeClasses[props.size];
  const disabledClasses = [
    internalDisabled.value ? "opacity-50" : "",
    internalLoading.value || internalDisabled.value ? "cursor-not-allowed" : ""
  ];

  return [
    "inline-flex justify-center items-center gap-x-1.5 font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variant,
    size,
    ...disabledClasses
  ];
});

async function onClick () {
  if (internalDisabled.value || internalLoading.value) {
    return;
  }

  emits("click");

  if (!props.action) {
    return;
  }

  if (!props.hideLoader) {
    internalLoading.value = true;
  }

  try {
    await props.action();
  } finally {
    if (!props.keepLoading) {
      internalLoading.value = false;
    }
  }
}

onMounted(() => {
  if (props.disableTimeoutMs && props.disableTimeoutMs > 0) {
    setTimeout(() => {
      isDisabled.value = false;
    }, props.disableTimeoutMs);
  }
});

</script>
