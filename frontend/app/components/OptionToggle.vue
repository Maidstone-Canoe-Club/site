<script setup lang="ts">
import { CheckCircleIcon } from "@heroicons/vue/24/solid";
import { type ButtonSize, type ButtonVariant, ButtonVariantClasses } from "~/utils/buttons";

export type OptionToggleItem = {
  id: string,
  label: string
}

const props = withDefaults(defineProps<{
  options: OptionToggleItem[],
  showIcon?: boolean,
  size?: ButtonSize,
  variant?: ButtonVariant
}>(), {
  showIcon: false,
  size: "md",
  variant: "primary"
});

const selected = defineModel<string | undefined>();

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-2.5 py-1.5 text-sm",
  md: "px-3 py-2 text-sm",
  lg: "px-3.5 py-2.5 text-sm"
};

const baseClasses = "relative inline-flex items-center font-semibold focus:z-10 gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
const leftRoundedClasses = "rounded-l-md";
const middleClasses = "-ml-px";
const rightRoundedClasses = "-ml-px rounded-r-md";
const singleClasses = "rounded-md";

function onSelect (id: string) {
  selected.value = id;
}

function isSelected (id: string) {
  return selected.value === id;
}

function getClassForIndex (id: string, index: number) {
  const size = sizeClasses[props.size];
  const variant = ButtonVariantClasses[props.variant];
  const untoggledVariant = ButtonVariantClasses.outline;

  const result = [
    size
  ];

  if (props.options.length === 1) {
    result.push(`${baseClasses} ${singleClasses}`);
  } else if (index === 0) {
    result.push(`${baseClasses} ${leftRoundedClasses}`);
  } else if (index === props.options.length - 1) {
    result.push(`${baseClasses} ${rightRoundedClasses}`);
  } else {
    result.push(`${baseClasses} ${middleClasses}`);
  }

  if (isSelected(id)) {
    result.push(variant);
  } else {
    result.push(untoggledVariant);
  }

  return result;
}

</script>

<template>
  <span>
    <button
      v-for="(option, index) in options"
      :key="option.id"
      type="button"
      :class="getClassForIndex(option.id, index)"
      @click="() => onSelect(option.id)">
      <span
        v-if="showIcon"
        :class="[size === 'xs' ? 'size-3' : 'size-4']"
        class="flex justify-center items-center">
        <CheckCircleIcon
          v-if="isSelected(option.id)"
          :class="[size === 'xs' ? 'size-3' : 'size-4']" />
        <span
          v-else
          class="rounded-full"
          :class="[size === 'xs' ? 'size-3 border' : 'size-4 border-2']" />
      </span>
      {{ option.label }}
    </button>
  </span>
</template>

<style scoped lang="scss">

</style>
